-- SaaS Template schema (prototype phase)
-- Edit this file directly, then run: pnpm db:reset && pnpm generate:types

-- Extensions
create extension if not exists "moddatetime" schema extensions;
create extension if not exists "citext" schema extensions;
-- pgTAP powers `supabase test db` (see packages/supabase/supabase/tests/). The extension
-- only ships SQL helpers (plan/ok/is/throws_ok/…); it doesn't alter runtime behavior.
create extension if not exists "pgtap" schema extensions;
-- Async queue (pgmq), scheduled jobs (pg_cron), and HTTP calls (pg_net) power the
-- notification dispatch pipeline. pgmq/pg_cron live in their default schemas;
-- pg_net is installed in `extensions` but exposes its functions under the `net` schema
-- (e.g. net.http_post) — that is pg_net's own schema, always named `net`.
create extension if not exists "pgmq";
create extension if not exists "pg_cron";
create extension if not exists "pg_net" schema extensions;

-- Provision the outbound delivery queue (idempotent: pgmq.create is safe to re-run on schema replay).
do $$
begin
  perform pgmq.create('conversation_outbound');
exception when others then
  -- Queue may already exist on a partial replay; swallow and continue.
  null;
end;
$$;

-- ============================================================
-- Schemas
-- ============================================================
-- private   : sensitive data, no API access, not callable from public schemas
-- internal  : utilities callable by other schemas (via security definer), no API access
-- protected : admin primitives, not exposed through APIs; public wrappers may delegate explicitly
-- public    : standard user-facing data, full API access

create schema if not exists private;
create schema if not exists internal;
create schema if not exists protected;

-- Strip implicit access inherited from the 'public' pseudo-role on all non-public schemas.
-- Explicit grants below define who can actually use them.
revoke usage on schema private from public;
revoke usage on schema internal from public;
revoke usage on schema protected from public;

-- internal: helpers used by triggers / CHECK constraints / DEFAULTs on public tables.
-- Those run under the *calling session role*, so every role that can mutate a public table
-- needs USAGE + EXECUTE here — not just service_role. The internal schema is not exposed
-- to PostgREST (it isn't in `[api].schemas` in config.toml), so granting these to
-- authenticated/anon does NOT make the functions API-callable; it only enables in-DB use.
grant usage on schema internal to postgres, service_role, authenticated, anon;
grant execute on all functions in schema internal to service_role, authenticated, anon;

-- protected: accessible only with service_role key
-- authenticator is PostgREST's connecting role — needs USAGE to introspect the schema,
-- but individual tables/functions still require explicit service_role grants to be callable.
grant usage on schema protected to service_role, authenticator;

-- pg_graphql page size: default cap is 30 rows; `addresses_level0` has 247 countries that
-- the country-select dropdown needs in one call. Table-level overrides land in pg_graphql
-- 1.5.12 (PR #595); the version bundled with the Supabase CLI today is 1.5.11, so we set
-- it schema-wide. Callers still pass an explicit `first: N` and pay only for the rows they
-- request; this cap only changes the *ceiling*, not the default page size.
-- Once the CLI ships pg_graphql ≥ 1.5.12, replace with:
--   comment on table public.addresses_level0 is e'@graphql({"max_rows": 250, "totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on schema public is e'@graphql({"inflect_names": true, "max_rows": 250})';

-- ============================================================
-- internal utilities
-- ============================================================

-- pg_uuidv7 is not bundled yet; polyfill until CLI/image is upgraded.
-- Swap for `create extension "pg_uuidv7"` and drop this function once available.
create or replace function internal.uuid_generate_v7()
  returns uuid
  language plpgsql
  volatile
  as $$
  declare
    _unix_ts_ms bytea;
    _uuid_bytes bytea;
  begin
    _unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
    _uuid_bytes = uuid_send(gen_random_uuid());
    _uuid_bytes = overlay(_uuid_bytes placing _unix_ts_ms from 1 for 6);
    _uuid_bytes = set_byte(_uuid_bytes, 6, (b'0111' || get_byte(_uuid_bytes, 6)::bit(4))::bit(8)::int);
    return encode(_uuid_bytes, 'hex')::uuid;
  end;
  $$;

-- Generic text normalization: strip control chars + HTML tags, collapse whitespace.
-- Returns NULL if the result is empty.
create or replace function internal.text_normalize(value text)
  returns text
  language sql
  immutable
  parallel safe
  set search_path to ''
  as $$
    select nullif(
      trim(regexp_replace(
        regexp_replace(
          regexp_replace(value, '[\x00-\x1F\x7F]', ' ', 'g'),
          '<[^>]*>', '', 'g'
        ),
        '\s+', ' ', 'g'
      )),
      ''
    );
  $$;

-- Trigger function: normalizes named text columns via internal.text_normalize.
-- Pass column names as trigger arguments, e.g.:
--   execute procedure internal.column_normalize_text(col_a, col_b)
create or replace function internal.column_normalize_text()
  returns trigger
  language plpgsql
  as $$
    declare
      _col text;
      _val text;
    begin
      foreach _col in array TG_ARGV loop
        _val := internal.text_normalize(row_to_json(NEW) ->> _col);
        NEW := jsonb_populate_record(NEW, jsonb_build_object(_col, _val));
      end loop;
      return NEW;
    end;
  $$;

-- Reusable soft-delete trigger function — PROJECT-WIDE INVARIANT: rows are not
-- hard-deleted. A `before delete` trigger calls this to stamp a `*_deleted_at`
-- column instead of removing the row; RLS policies, partial indexes, and view
-- functions all rely on deleted rows being *filtered*, not gone.
--
-- One definition serves every table: it uses `ctid` (not the PK), and the
-- target column name is passed as the trigger argument (tg_argv[0]).
--
-- Attach per table (the WHEN guard lets a second DELETE on an already-deleted
-- row purge for real):
--   drop trigger if exists soft_delete on public.<table>;
--   create trigger soft_delete
--     before delete on public.<table>
--     for each row when (old.<table>_deleted_at is null)
--     execute function internal.soft_delete('<table>_deleted_at');
--
-- Restore = `update ... set <col> = null`. Note: FK `on delete cascade` does NOT
-- fire (the physical delete is cancelled) — cascade soft-deletes explicitly.
-- See the "Soft-delete" section of the my-supabase skill.
create or replace function internal.soft_delete()
  returns trigger
  language plpgsql
  set search_path to ''
as $$
  begin
    execute format(
      'update %I.%I set %I = current_timestamp where ctid = $1',
      tg_table_schema, tg_table_name, tg_argv[0]
    ) using old.ctid;
    return null;  -- ponytail: cancels the physical DELETE
  end;
$$;

-- Slug validation shared by any table with a slug column (tenants, future teams, etc.)
create or replace function internal.slug_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  set search_path to ''
  as $$
    select value ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])?$';
  $$;

-- Email validation shared by invite/identity columns. citext-friendly; mirrors the
-- length bounds those columns previously enforced inline.
create or replace function internal.email_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    select char_length(value) between 3 and 254
      and value ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$';
  $$;

-- Phone validation: E.164 with leading '+'. Mirrors public.phone_normalize's output shape.
create or replace function internal.phone_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    select value ~ '^\+[1-9]\d{7,14}$';
  $$;

-- Predicate for canonical UUID text (8-4-4-4-12 hex). Cheaper and exception-free
-- compared to `value::uuid` in a try/catch — useful for index predicates and
-- view filters that must be IMMUTABLE.
create or replace function internal.is_uuid(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    select value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  $$;

-- Byte unit conversion. SI ('KB', 'MB', 'GB', 'TB') use powers of 1000; binary
-- ('KiB', 'MiB', 'GiB', 'TiB') use powers of 1024. Unknown units return NULL.
-- Usage: `internal.convert_unit_byte(5, 'MiB')` → 5_242_880 (defaults to bytes).
create or replace function internal.convert_unit_byte(
  amount numeric,
  from_unit text,
  to_unit text default 'byte'
)
  returns numeric
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    with factor(unit, value) as (values
      ('byte', 1::numeric),
      ('KB',   1e3::numeric),  ('KiB',  1024::numeric),
      ('MB',   1e6::numeric),  ('MiB',  1048576::numeric),
      ('GB',   1e9::numeric),  ('GiB',  1073741824::numeric),
      ('TB',   1e12::numeric), ('TiB',  1099511627776::numeric)
    )
    select amount
      * (select value from factor where unit = from_unit)
      / (select value from factor where unit = to_unit);
  $$;

-- Anonymous lookup used by /auth root to branch between login/signup.
-- Lower-cases for case-insensitive match. Enumeration leak is accepted per product decision.
create or replace function public.email_exists(email_to_check text)
  returns boolean
  language sql
  stable
  security definer
  set search_path to ''
  as $$
    select exists (
      select 1 from auth.users
      where lower(email) = lower(email_to_check)
    );
  $$;

-- Normalize a phone string to E.164 with leading '+'. Strips whitespace/dashes/dots/parens.
-- If the cleaned input doesn't start with '+', prepends `default_code`. Returns NULL when the
-- result fails the E.164 shape (`^\+[1-9]\d{7,14}$`) — callers should treat NULL as invalid.
create or replace function public.phone_normalize(value text, default_code text default '+56')
  returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
      _candidate text;
    begin
      _stripped := regexp_replace(coalesce(value, ''), '[\s\-().]', '', 'g');
      if _stripped = '' then
        return null;
      end if;
      if _stripped like '+%' then
        _candidate := _stripped;
      else
        _candidate := default_code || _stripped;
      end if;
      if _candidate ~ '^\+[1-9]\d{7,14}$' then
        return _candidate;
      end if;
      return null;
    end;
  $$;

-- Anonymous lookup used by /auth root to branch between phone login/signup. Mirrors
-- email_exists. gotrue stores phones without the leading '+', so we strip it before comparing.
create or replace function public.phone_exists(phone_to_check text, default_code text default '+56')
  returns boolean
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _canonical text;
      _result boolean;
    begin
      _canonical := public.phone_normalize(phone_to_check, default_code);
      if _canonical is null then
        return false;
      end if;
      select exists (
        select 1 from auth.users
        where phone = ltrim(_canonical, '+')
      ) into _result;
      return _result;
    end;
  $$;

-- Lightweight liveness probe — returns DB time so callers can verify connectivity and clock.
create or replace function public.health_current_timestamp()
  returns timestamptz
  stable
  strict
  parallel safe
  security definer
  language sql
  set search_path to ''
  as $$
    select current_timestamp;
  $$;

-- ============================================================
-- profiles
-- ============================================================

create table if not exists public.profiles (
  profile_id uuid not null primary key references auth.users on delete cascade,
  profile_name_full text,
  profile_onboarded_at timestamptz,
  profile_deleted_at timestamptz,
  profile_created_at timestamptz not null default current_timestamp,
  profile_updated_at timestamptz not null default current_timestamp
);

-- Indexes
create index if not exists profiles_deleted_at_idx
  on public.profiles (profile_deleted_at)
  where profile_deleted_at is not null;

-- Auto-update updated_at
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure extensions.moddatetime(profile_updated_at);

drop trigger if exists soft_delete on public.profiles;
create trigger soft_delete
  before delete on public.profiles
  for each row when (old.profile_deleted_at is null)
  execute function internal.soft_delete('profile_deleted_at');

drop trigger if exists profiles_trigger_normalize_name on public.profiles;
create trigger profiles_trigger_normalize_name
  before insert or update of profile_name_full on public.profiles
  for each row execute procedure internal.column_normalize_text(profile_name_full);

-- Auto-create profile on new auth user
create or replace function public.users_handle_created()
  returns trigger
  language plpgsql
  security definer
  as $$
    begin
      insert into public.profiles (profile_id, profile_name_full)
        values (new.id, new.raw_user_meta_data->>'full_name')
        on conflict (profile_id) do nothing;
      -- TODO: handle referral code in the future.
      return new;
    end;
  $$;

drop trigger if exists users_trigger_created on auth.users;
create trigger users_trigger_created
  after insert on auth.users
  for each row execute procedure public.users_handle_created();

-- Defined early so RLS policies below can reference it before the full viewer_* block.
create or replace function public.viewer_profile_id(strict boolean default false)
  returns uuid
  stable
  security definer
  parallel safe
  language plpgsql
  set search_path to ''
  as $$
    declare
      _user_id uuid := auth.uid();
    begin
      if _user_id is null and $1 is true then
        raise exception '[viewer_profile_id] not logged-in';
      end if;
      return _user_id;
    end;
  $$;

-- RLS (final SELECT policy is defined below, after tenant_members exists)
alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, update on table public.profiles to anon, authenticated;

drop policy if exists "Users can update own profiles." on public.profiles;
create policy "Users can update own profiles."
  on public.profiles for update
  to authenticated
  using (
    profile_deleted_at is null
    and profile_id = (select public.viewer_profile_id())
  );

-- Storage
-- Bucket convention: bucket name === table name. First path segment === row PK.
-- Subfolders below it are app-level (e.g. `<profile_id>/avatar/<filename>`). When reading
-- a folder, callers should `list(..., { sortBy: { column: 'name', order: 'desc' }, limit: 1 })`
-- so the newest filename (lexicographic) wins — uploads name files with a sortable prefix
-- (timestamp / ULID) so newest > oldest under desc.
-- Bucket is public so URLs render without signed redirects; RLS still gates writes (see
-- the `storage.objects` policies at the bottom of this file).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'profiles',
    'profiles',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- conversation_topics (notification catalog)
-- ============================================================
-- `conversation_topics` is the catalog of notification/topic types.
-- Per-profile channel preferences live in `profile_topic_channels` (see conversations section).

do $$ begin
  create type public.notification_priority as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_kind as enum ('info', 'warn', 'fatal', 'error', 'debug', 'log');
exception when duplicate_object then null; end $$;

create table if not exists public.conversation_topics (
  conversation_topic_slug extensions.citext not null primary key
    check (internal.slug_validate(conversation_topic_slug::text)),
  conversation_topic_name text not null check (char_length(conversation_topic_name) between 1 and 120),
  conversation_topic_description text not null check (char_length(conversation_topic_description) between 1 and 500),
  conversation_topic_priority public.notification_priority not null default 'medium',
  conversation_topic_kind public.notification_kind not null default 'log',
  conversation_topic_deleted_at timestamptz,
  conversation_topic_created_at timestamptz not null default current_timestamp,
  conversation_topic_updated_at timestamptz not null default current_timestamp
);

create index if not exists conversation_topics_priority_idx
  on public.conversation_topics (conversation_topic_priority desc)
  where conversation_topic_deleted_at is null;

drop trigger if exists handle_conversation_topics_updated_at on public.conversation_topics;
create trigger handle_conversation_topics_updated_at
  before update on public.conversation_topics
  for each row execute procedure extensions.moddatetime(conversation_topic_updated_at);

drop trigger if exists soft_delete on public.conversation_topics;
create trigger soft_delete
  before delete on public.conversation_topics
  for each row when (old.conversation_topic_deleted_at is null)
  execute function internal.soft_delete('conversation_topic_deleted_at');

drop trigger if exists conversation_topics_trigger_normalize_text on public.conversation_topics;
create trigger conversation_topics_trigger_normalize_text
  before insert or update of conversation_topic_name, conversation_topic_description on public.conversation_topics
  for each row execute procedure internal.column_normalize_text(conversation_topic_name, conversation_topic_description);

alter table public.conversation_topics enable row level security;

revoke all on table public.conversation_topics from anon, authenticated;
grant select on table public.conversation_topics to anon, authenticated;
grant select, insert, update, delete on table public.conversation_topics to service_role;

drop policy if exists "conversation_topics select active catalog" on public.conversation_topics;
create policy "conversation_topics select active catalog"
  on public.conversation_topics for select
  to anon, authenticated
  using (conversation_topic_deleted_at is null);

-- ============================================================
-- tenants + organizations + organization_memberships + permissions
-- ============================================================
--
-- A `tenant` is the billing / customer relationship (e.g. "Walmart").
-- A tenant has one or more `organizations` — the actual operating units (e.g. "Walmart Chile").
-- Most tenants have exactly one organization that mirrors the tenant.
--
-- Users belong to *organizations* via `public.organization_memberships`. The set of tenants a user can
-- access is derived from the tenants of the organizations they're a member of.
-- The subdomain `{tenant_slug}.example.com` routes to the tenant; org switching happens in-app.
--
-- Access control is permission-based (not role-based). Capabilities are atomic slugs in
-- `public.permissions` (e.g. `organization_manage`, `members_manage`). A grant lives in
-- `public.organization_membership_permissions` for a (org, profile, permission) triple. The reserved
-- slug `*` is the wildcard: anyone who has `(org, profile, '*')` passes every permission
-- check inside that org — convenient for the tenant creator and for any other "full
-- admin" relationship without forcing the catalog to be backfilled when a new permission
-- is added later. `public.permission_presets` is a UX helper (catalog of named bundles
-- to apply in the admin UI); it carries no enforcement.

-- public.reserved_slugs — list of slugs that cannot be used as tenant identifiers
-- because they collide with first-party routes (`/auth`, `/home`, etc.) or with
-- BCP47 locale codes. Seeded in seed.sql. The CHECK on `public.tenants.tenant_slug`
-- calls `internal.slug_reserved_validate()` which combines the slug-shape check with
-- a lookup here. RLS: SELECT for anon + authenticated; no write policies (service_role
-- bypasses RLS for seeding/mutations).

create table if not exists public.reserved_slugs (
  reserved_slug extensions.citext primary key check (char_length(reserved_slug) between 1 and 39)
);

alter table public.reserved_slugs enable row level security;

create policy "reserved_slugs_select"
  on public.reserved_slugs
  for select to anon, authenticated
  using (true);

create or replace function internal.slug_reserved_validate(value text)
  returns boolean
  language sql
  stable
  security definer
  parallel safe
  set search_path to ''
  as $$
    select internal.slug_validate(value)
      and not exists (
        select 1 from public.reserved_slugs
        where reserved_slug = value
      );
  $$;

create table if not exists public.tenants (
  tenant_id serial primary key,
  tenant_slug extensions.citext not null unique check (internal.slug_reserved_validate(tenant_slug::text)),
  tenant_name text not null check (char_length(tenant_name) between 1 and 256),
  -- Onboarding (extensible, resumable, soft nudge). Steps (logo set, first member invited) are
  -- derivable — computed at read time from storage/memberships, never stored. `tenant_onboarded_at`
  -- is set when the whole flow is dismissed/finished so the banner stops.
  tenant_onboarded_at timestamptz,
  tenant_deleted_at timestamptz,
  tenant_created_at timestamptz not null default current_timestamp,
  tenant_updated_at timestamptz not null default current_timestamp
);

create index if not exists tenants_deleted_at_idx
  on public.tenants (tenant_deleted_at) where tenant_deleted_at is not null;

drop trigger if exists handle_tenants_updated_at on public.tenants;
create trigger handle_tenants_updated_at
  before update on public.tenants
  for each row execute procedure extensions.moddatetime(tenant_updated_at);

drop trigger if exists soft_delete on public.tenants;
create trigger soft_delete
  before delete on public.tenants
  for each row when (old.tenant_deleted_at is null)
  execute function internal.soft_delete('tenant_deleted_at');

drop trigger if exists tenants_trigger_normalize_name on public.tenants;
create trigger tenants_trigger_normalize_name
  before insert or update of tenant_name on public.tenants
  for each row execute procedure internal.column_normalize_text(tenant_name);

create table if not exists public.organizations (
  organization_id serial primary key,
  tenant_id int not null references public.tenants (tenant_id) on delete cascade,
  organization_slug extensions.citext not null check (internal.slug_validate(organization_slug::text)),
  organization_name text not null check (char_length(organization_name) between 1 and 256),
  organization_deleted_at timestamptz,
  organization_created_at timestamptz not null default current_timestamp,
  organization_updated_at timestamptz not null default current_timestamp,
  unique (tenant_id, organization_slug)
);

create index if not exists organizations_tenant_idx
  on public.organizations (tenant_id) where organization_deleted_at is null;

drop trigger if exists handle_organizations_updated_at on public.organizations;
create trigger handle_organizations_updated_at
  before update on public.organizations
  for each row execute procedure extensions.moddatetime(organization_updated_at);

drop trigger if exists soft_delete on public.organizations;
create trigger soft_delete
  before delete on public.organizations
  for each row when (old.organization_deleted_at is null)
  execute function internal.soft_delete('organization_deleted_at');

drop trigger if exists organizations_trigger_normalize_name on public.organizations;
create trigger organizations_trigger_normalize_name
  before insert or update of organization_name on public.organizations
  for each row execute procedure internal.column_normalize_text(organization_name);

-- Storage (same convention as the `profiles` bucket above: bucket name === table name,
-- first path segment === organization_id, app-level subfolder beneath it: `<id>/avatar/<filename>`).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'organizations',
    'organizations',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'tenants',
    'tenants',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'agencies',
    'agencies',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Forward declarations needed before `public.organization_memberships` so its invite columns + triggers
-- can reference them. The full `public.addresses_level0` table (with seed + indexes) and
-- the `profile_identities` section appear later in the file with their RLS policies; this
-- block only puts the pieces in place that organization_memberships requires.

create table if not exists public.addresses_level0 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level0_name text not null check (length(address_level0_name) <= 100),
  address_level0_emoji text check (char_length(address_level0_emoji) between 1 and 8),
  address_level0_deleted_at timestamptz,
  address_level0_hidden_at timestamptz,
  address_level0_created_at timestamptz not null default current_timestamp,
  address_level0_updated_at timestamptz not null default current_timestamp,
  primary key (address_level0_id)
);

-- Chilean RUT (Rol Unico Tributario) helpers. cl_rut_normalize strips formatting,
-- validates the modulo-11 check digit, and returns the canonical body+DV (digits + upper K)
-- or NULL when the check digit is wrong. cl_rut_validate is the boolean shortcut.
create or replace function public.cl_rut_normalize(value text)
  returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
      _t bigint;
      _m int;
      _s int;
      _dv text;
    begin
      if value is null then
        return null;
      end if;
      _stripped := upper(regexp_replace(value, '[^0-9a-zA-Z]', '', 'g'));
      _stripped := regexp_replace(_stripped, '^0+', '', '');
      if _stripped !~ '^[0-9]{1,9}[0-9K]$' then
        return null;
      end if;
      _t := substring(_stripped from 1 for char_length(_stripped) - 1)::bigint;
      _m := 0;
      _s := 1;
      while _t > 0 loop
        _s := (_s + (_t % 10)::int * (9 - (_m % 6))) % 11;
        _m := _m + 1;
        _t := _t / 10;
      end loop;
      if _s > 0 then
        _dv := (_s - 1)::text;
      else
        _dv := 'K';
      end if;
      if _dv <> substring(_stripped from char_length(_stripped) for 1) then
        return null;
      end if;
      return _stripped;
    end;
  $$;

create or replace function public.cl_rut_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  set search_path to ''
  as $$
    select public.cl_rut_normalize(value) is not null;
  $$;

do $$ begin
  create type public.profile_identity_document_kind as enum ('nin', 'passport');
exception when duplicate_object then null; end $$;

-- Normalizer: strips formatting, validates CL+NIN check digit (modulo 11).
-- Returns NULL on invalid input (caller treats NULL as rejection).
create or replace function internal.profile_identity_value_normalize(
  country text,
  kind public.profile_identity_document_kind,
  value text
) returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
    begin
      if value is null then
        return null;
      end if;
      _stripped := upper(regexp_replace(value, '[^0-9a-zA-Z]', '', 'g'));
      _stripped := regexp_replace(_stripped, '^0+', '', '');
      if _stripped = '' or char_length(_stripped) < 4 or char_length(_stripped) > 32 then
        return null;
      end if;
      if country = 'CL' and kind = 'nin' and not public.cl_rut_validate(_stripped) then
        return null;
      end if;
      return _stripped;
    end;
  $$;

-- organization_memberships: a single row models both a pending invite AND an active organization_membership.
--
-- A row is in one of these states (ordered by typical lifecycle):
--   PENDING   profile_id is null,     accepted_at is null, rejected_at is null, revoked_at is null
--   ACCEPTED  profile_id is not null, accepted_at is not null
--   REJECTED  rejected_at is not null  (terminal — invitee declined)
--   REVOKED   revoked_at is not null   (terminal — admin removed)
--
-- For PENDING rows, at least one identifier (email / phone / document triplet) must be set
-- so the invitee can match it via viewer_organization_membership_pending_collection(). The shareable accept link
-- carries organization_membership_invite_token (random opaque) + expires_at TTL.
create table if not exists public.organization_memberships (
  organization_membership_id serial primary key,
  organization_id int not null references public.organizations (organization_id) on delete cascade,
  profile_id uuid references public.profiles (profile_id) on delete set null,

  -- Invite identifiers (used to match the invitee at accept-time)
  organization_membership_invite_email extensions.citext
    check (organization_membership_invite_email is null or internal.email_validate(organization_membership_invite_email::text)),
  organization_membership_invite_phone text
    check (organization_membership_invite_phone is null or internal.phone_validate(organization_membership_invite_phone)),
  organization_membership_invite_address_level0_id text
    references public.addresses_level0 (address_level0_id),
  organization_membership_invite_document_kind public.profile_identity_document_kind,
  organization_membership_invite_document_value text
    check (organization_membership_invite_document_value is null or char_length(organization_membership_invite_document_value) between 4 and 32),

  -- Shareable accept-link token (random secret; opaque to the user)
  organization_membership_invite_token text unique
    check (organization_membership_invite_token is null or char_length(organization_membership_invite_token) between 8 and 256),
  organization_membership_invite_expires_at timestamptz,

  -- Lifecycle timestamps
  organization_membership_accepted_at timestamptz,
  organization_membership_rejected_at timestamptz,
  organization_membership_revoked_at timestamptz,
  organization_membership_created_at timestamptz not null default current_timestamp,
  organization_membership_updated_at timestamptz not null default current_timestamp,

  -- A claim (profile_id) and acceptance must move together.
  constraint organization_memberships_claim_consistency check (
    (profile_id is null and organization_membership_accepted_at is null)
    or (profile_id is not null and organization_membership_accepted_at is not null)
  ),
  -- Pending rows (no profile yet) must carry at least one identifier so an invitee can match.
  constraint organization_memberships_pending_has_identifier check (
    profile_id is not null
    or organization_membership_invite_email is not null
    or organization_membership_invite_phone is not null
    or (
      organization_membership_invite_address_level0_id is not null
      and organization_membership_invite_document_kind is not null
      and organization_membership_invite_document_value is not null
    )
  ),
  -- Document triplet is all-or-nothing.
  constraint organization_memberships_doc_triplet_complete check (
    (organization_membership_invite_address_level0_id is null
     and organization_membership_invite_document_kind is null
     and organization_membership_invite_document_value is null)
    or (organization_membership_invite_address_level0_id is not null
        and organization_membership_invite_document_kind is not null
        and organization_membership_invite_document_value is not null)
  )
);

-- A claimed (active) member appears at most once per (org, profile).
create unique index if not exists organization_memberships_org_profile_active_idx
  on public.organization_memberships (organization_id, profile_id)
  where profile_id is not null
    and organization_membership_revoked_at is null
    and organization_membership_rejected_at is null;

-- At most one pending invite per (org, identifier).
create unique index if not exists organization_memberships_org_email_pending_idx
  on public.organization_memberships (organization_id, organization_membership_invite_email)
  where profile_id is null
    and organization_membership_invite_email is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;

create unique index if not exists organization_memberships_org_phone_pending_idx
  on public.organization_memberships (organization_id, organization_membership_invite_phone)
  where profile_id is null
    and organization_membership_invite_phone is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;

create unique index if not exists organization_memberships_org_doc_pending_idx
  on public.organization_memberships (
    organization_id, organization_membership_invite_address_level0_id,
    organization_membership_invite_document_kind, organization_membership_invite_document_value
  )
  where profile_id is null
    and organization_membership_invite_document_value is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;

-- Lookup: viewer's claimed organization_memberships (used by viewer_organization_ids hook + RLS).
create index if not exists organization_memberships_profile_active_idx
  on public.organization_memberships (profile_id)
  where profile_id is not null
    and organization_membership_accepted_at is not null
    and organization_membership_revoked_at is null
    and organization_membership_rejected_at is null;

-- Lookups for viewer_organization_membership_pending_collection: scan by identifier.
create index if not exists organization_memberships_invite_email_pending_idx
  on public.organization_memberships (organization_membership_invite_email)
  where profile_id is null
    and organization_membership_invite_email is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;

create index if not exists organization_memberships_invite_phone_pending_idx
  on public.organization_memberships (organization_membership_invite_phone)
  where profile_id is null
    and organization_membership_invite_phone is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;

create index if not exists organization_memberships_invite_doc_pending_idx
  on public.organization_memberships (
    organization_membership_invite_address_level0_id,
    organization_membership_invite_document_kind,
    organization_membership_invite_document_value
  )
  where profile_id is null
    and organization_membership_invite_document_value is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;

drop trigger if exists handle_organization_memberships_updated_at on public.organization_memberships;
create trigger handle_organization_memberships_updated_at
  before update on public.organization_memberships
  for each row execute procedure extensions.moddatetime(organization_membership_updated_at);

-- Normalize invite phone (E.164, default code +56).
create or replace function internal.organization_memberships_normalize_invite_phone()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      if NEW.organization_membership_invite_phone is null then
        return NEW;
      end if;
      _normalized := public.phone_normalize(NEW.organization_membership_invite_phone, '+56');
      if _normalized is null then
        raise exception 'Invalid invite phone: %', NEW.organization_membership_invite_phone;
      end if;
      NEW.organization_membership_invite_phone := _normalized;
      return NEW;
    end;
  $$;

drop trigger if exists organization_memberships_trigger_normalize_invite_phone on public.organization_memberships;
create trigger organization_memberships_trigger_normalize_invite_phone
  before insert or update of organization_membership_invite_phone on public.organization_memberships
  for each row execute procedure internal.organization_memberships_normalize_invite_phone();

-- Normalize invite document triplet (reuses profile_identity_value_normalize).
create or replace function internal.organization_memberships_normalize_invite_document()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      if NEW.organization_membership_invite_document_value is null then
        return NEW;
      end if;
      _normalized := internal.profile_identity_value_normalize(
        NEW.organization_membership_invite_address_level0_id,
        NEW.organization_membership_invite_document_kind,
        NEW.organization_membership_invite_document_value
      );
      if _normalized is null then
        raise exception 'Invalid % document value for %: %',
          NEW.organization_membership_invite_document_kind,
          NEW.organization_membership_invite_address_level0_id,
          NEW.organization_membership_invite_document_value;
      end if;
      NEW.organization_membership_invite_document_value := _normalized;
      return NEW;
    end;
  $$;

drop trigger if exists organization_memberships_trigger_normalize_invite_document on public.organization_memberships;
create trigger organization_memberships_trigger_normalize_invite_document
  before insert or update of
    organization_membership_invite_address_level0_id,
    organization_membership_invite_document_kind,
    organization_membership_invite_document_value
  on public.organization_memberships
  for each row execute procedure internal.organization_memberships_normalize_invite_document();

-- Catalog of permissions. Seeded below. permission_id is a snake_case identifier (we use
-- it as a code-level constant, not a URL slug — so underscores, not hyphens). The reserved
-- slug `*` is the wildcard; the check allows it explicitly alongside snake_case slugs.
create table if not exists public.permissions (
  permission_id extensions.citext primary key
    check (
      permission_id::text = '*'
      or permission_id::text ~ '^[a-z0-9]([a-z0-9_]{1,38}[a-z0-9])?$'
    ),
  permission_description text,
  permission_created_at timestamptz not null default current_timestamp,
  permission_updated_at timestamptz not null default current_timestamp
);

drop trigger if exists handle_permissions_updated_at on public.permissions;
create trigger handle_permissions_updated_at
  before update on public.permissions
  for each row execute procedure extensions.moddatetime(permission_updated_at);

-- Grants: one row per (organization_membership, permission). Permissions can be attached to a organization_membership
-- BEFORE the invitee claims it — admins set the slugs at invite time, they apply once the
-- invitee accepts. Cascades from organization_memberships (delete) and permissions (slug retirement).
create table if not exists public.organization_membership_permissions (
  organization_membership_id int not null
    references public.organization_memberships (organization_membership_id) on delete cascade,
  permission_id extensions.citext not null
    references public.permissions (permission_id) on delete cascade,
  organization_membership_permission_created_at timestamptz not null default current_timestamp,
  primary key (organization_membership_id, permission_id)
);

-- Secondary index for "what permission rows match slug X?" cross-organization_membership scans.
create index if not exists organization_membership_permissions_permission_idx
  on public.organization_membership_permissions (permission_id);

-- UX-only catalog of named permission bundles. `organization_id IS NULL` = global preset
-- visible to everyone; non-null = preset specific to that organization. The trigger validates
-- every slug in `permission_preset_slugs` exists in `public.permissions`.
create table if not exists public.permission_presets (
  permission_preset_id serial primary key,
  organization_id int references public.organizations (organization_id) on delete cascade,
  permission_preset_name text not null check (char_length(permission_preset_name) between 1 and 100),
  permission_preset_slugs extensions.citext[] not null,
  permission_preset_created_at timestamptz not null default current_timestamp,
  permission_preset_updated_at timestamptz not null default current_timestamp,
  check (cardinality(permission_preset_slugs) > 0)
);

create index if not exists permission_presets_org_idx
  on public.permission_presets (organization_id) where organization_id is not null;

drop trigger if exists handle_permission_presets_updated_at on public.permission_presets;
create trigger handle_permission_presets_updated_at
  before update on public.permission_presets
  for each row execute procedure extensions.moddatetime(permission_preset_updated_at);

-- Validate every slug in permission_preset_slugs exists in the permissions catalog.
-- Fires on INSERT or UPDATE of the slugs column.
create or replace function internal.permission_preset_validate_slugs()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _missing extensions.citext[];
    begin
      select array_agg(s)
        into _missing
        from unnest(NEW.permission_preset_slugs) s
        where s not in (select permission_id from public.permissions);
      if _missing is not null and cardinality(_missing) > 0 then
        raise exception 'Unknown permission slug(s) in preset: %', _missing;
      end if;
      return NEW;
    end;
  $$;

drop trigger if exists permission_presets_trigger_validate_slugs on public.permission_presets;
create trigger permission_presets_trigger_validate_slugs
  before insert or update of permission_preset_slugs on public.permission_presets
  for each row execute procedure internal.permission_preset_validate_slugs();

-- Seed catalog (idempotent: ON CONFLICT skips). Add new slugs here, then re-run db:reset.
insert into public.permissions (permission_id, permission_description) values
  ('*',                    'Wildcard: grants every permission within the organization (typical use: founder).'),
  ('organization_manage',  'Edit the organization: name, logo, members, and presets.'),
  ('tenant_manage',        'Edit the tenant (billing entity): name, logo, billing, and domains.'),
  ('members_manage',       'Invite, remove, and reassign permissions to members.'),
  ('presets_manage',       'Create and edit the organization''s permission presets.'),
  ('agency_members_manage','Manage the agency team: invite, revoke, reactivate affiliates and reassign their agency permissions.')
on conflict (permission_id) do nothing;

-- Seed global presets (organization_id IS NULL → visibles para cualquier tenant).
insert into public.permission_presets (organization_id, permission_preset_name, permission_preset_slugs) values
  (null, 'Owner',         array['*']::extensions.citext[]),
  (null, 'Administrator', array['organization_manage','members_manage','presets_manage']::extensions.citext[]),
  (null, 'Member manager', array['members_manage']::extensions.citext[])
on conflict do nothing;

-- ============================================================
-- agencies (cross-tenant groups of profiles, e.g. "Equipo SaaS Template", "BDO Auditores")
-- ============================================================
-- Agencies are platform-level entities — they don't belong to any tenant.
-- Profiles can belong to both organizations (as org members) and agencies (as affiliates).
-- Access is controlled by explicit agency grants, not by a binary flag.

create table if not exists public.agencies (
  agency_id serial primary key,
  agency_name text not null check (char_length(agency_name) between 1 and 100),
  agency_slug extensions.citext not null unique,
  agency_deleted_at timestamptz,
  agency_created_at timestamptz not null default current_timestamp,
  agency_updated_at timestamptz not null default current_timestamp
);

drop trigger if exists handle_agencies_updated_at on public.agencies;
create trigger handle_agencies_updated_at
  before update on public.agencies
  for each row execute procedure extensions.moddatetime(agency_updated_at);

drop trigger if exists soft_delete on public.agencies;
create trigger soft_delete
  before delete on public.agencies
  for each row when (old.agency_deleted_at is null)
  execute function internal.soft_delete('agency_deleted_at');

-- AgencyMemberships: a profile belongs to an agency. Mirrors public.organization_memberships.
create table if not exists public.agency_memberships (
  agency_membership_id serial primary key,
  agency_id int not null references public.agencies (agency_id) on delete cascade,
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  agency_membership_accepted_at timestamptz,
  agency_membership_revoked_at timestamptz,
  agency_membership_rejected_at timestamptz,
  agency_membership_created_at timestamptz not null default current_timestamp,
  agency_membership_updated_at timestamptz not null default current_timestamp,
  unique (agency_id, profile_id)
);

create index if not exists agency_memberships_profile_idx on public.agency_memberships (profile_id);

drop trigger if exists handle_agency_memberships_updated_at on public.agency_memberships;
create trigger handle_agency_memberships_updated_at
  before update on public.agency_memberships
  for each row execute procedure extensions.moddatetime(agency_membership_updated_at);

-- Explicit grants: an agency has a permission in a specific org or globally.
-- organization_id IS NULL = all orgs. permission_id = '*' = all permissions.
create table if not exists public.agencies_organizations_grants (
  agencies_organizations_grant_id uuid not null primary key default internal.uuid_generate_v7(),
  agency_id int not null references public.agencies (agency_id) on delete cascade,
  organization_id int references public.organizations (organization_id) on delete cascade,
  permission_id extensions.citext not null references public.permissions (permission_id) on delete cascade,
  agencies_organizations_grant_created_at timestamptz not null default current_timestamp
);

-- Separate unique indexes because NULL != NULL in standard UNIQUE constraints.
create unique index if not exists agencies_organizations_grants_org_unique
  on public.agencies_organizations_grants (agency_id, organization_id, permission_id)
  where organization_id is not null;

create unique index if not exists agencies_organizations_grants_global_unique
  on public.agencies_organizations_grants (agency_id, permission_id)
  where organization_id is null;

-- Per-affiliate capabilities inside an agency. Mirrors public.organization_membership_permissions:
-- capability-based, reuses the public.permissions catalog (e.g. 'agency_members_manage', '*').
-- Controls who may manage the agency's own team — distinct from agencies_organizations_grants,
-- which is the org-side decision of which agencies may reach which organizations.
create table if not exists public.agency_membership_permissions (
  agency_membership_id int not null references public.agency_memberships (agency_membership_id) on delete cascade,
  permission_id extensions.citext not null references public.permissions (permission_id) on delete cascade,
  agency_membership_permission_created_at timestamptz not null default current_timestamp,
  primary key (agency_membership_id, permission_id)
);

alter table public.agency_membership_permissions enable row level security;
revoke all on table public.agency_membership_permissions from anon, authenticated;
grant select, insert, update, delete on table public.agency_membership_permissions to anon, authenticated;
grant select, insert, update, delete on table public.agency_membership_permissions to service_role;

-- RLS for agency tables.
alter table public.agencies enable row level security;
alter table public.agency_memberships enable row level security;
alter table public.agencies_organizations_grants enable row level security;

revoke all on table public.agencies from anon, authenticated;
grant select on table public.agencies to anon, authenticated;
grant select, insert, update, delete on table public.agencies to service_role;
grant usage, select on sequence public.agencies_agency_id_seq to service_role;

revoke all on table public.agency_memberships from anon, authenticated;
grant select on table public.agency_memberships to anon, authenticated;
grant select, insert, update, delete on table public.agency_memberships to service_role;
grant usage, select on sequence public.agency_memberships_agency_membership_id_seq to service_role;

revoke all on table public.agencies_organizations_grants from anon, authenticated;
grant select on table public.agencies_organizations_grants to anon, authenticated;
grant select, insert, update, delete on table public.agencies_organizations_grants to service_role;

-- Writes on agency tables: service_role only (no authenticated write policies).
-- RLS SELECT policies for agency tables are defined after viewer_agency_ids() is created.

-- Anonymous lookup used by /auth/email step-2 to surface the password field only when the
-- entered email has a password set.
create or replace function public.email_has_password(email_to_check text)
  returns boolean
  language sql
  stable
  security definer
  set search_path to ''
  as $$
    select exists (
      select 1
      from auth.users u
      where lower(u.email) = lower(email_to_check)
        and u.encrypted_password is not null
        and u.encrypted_password <> ''
    );
  $$;

grant execute on function public.email_has_password(text) to anon, authenticated;

-- Anonymous lookup used by /auth/phone step-2 to surface the password field only when the
-- entered phone resolves to an account with a password set.
create or replace function public.phone_has_password(phone_to_check text, default_code text default '+56')
  returns boolean
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _canonical text;
      _result boolean;
    begin
      _canonical := public.phone_normalize(phone_to_check, default_code);
      if _canonical is null then
        return false;
      end if;
      select exists (
        select 1
        from auth.users u
        where u.phone = ltrim(_canonical, '+')
          and u.encrypted_password is not null
          and u.encrypted_password <> ''
      ) into _result;
      return _result;
    end;
  $$;

grant execute on function public.phone_has_password(text, text) to anon, authenticated;

-- ============================================================
-- viewer_* helpers
-- ============================================================
-- These are the app-layer API for "who is the caller". RLS policies should
-- prefer the `id in (select … from viewer_*_ids(…))` form over the `_validate`
-- helpers — the subquery is evaluated once per query (InitPlan) instead of per
-- row, which matters at scale.
--
-- Identity (from JWT — fast, no DB):
--   viewer_profile / viewer_profile_id  : current user's profile
--   viewer_tenant_ids                   : tenants the caller belongs to
--   viewer_tenant_validate(tenant)      : true iff caller belongs to this tenant
--   viewer_organization_ids             : organizations the caller is a member of
--   viewer_organization_validate(org)   : true iff caller is a member of `org`
--
-- Permissions (DB lookup — `security definer` to bypass recursive RLS):
--   viewer_permission_org_ids(perm)     : setof org_id where the caller has `perm` OR `*`
--   viewer_has_permission(org, perm)    : boolean shortcut for a single (org, perm) check
--   viewer_organization_membership_permissions()     : setof (org_id, permission_id) — for UI listing
--
-- Convenience over the join:
--   tenants_organizations_profiles (view)  : active tenant-org organization_memberships for the viewer
--   viewer_tenants_collection() / viewer_organizations_collection() / viewer_tenant_by_id() / viewer_tenant_by_slug() / viewer_organization_by_id()

create or replace function public.viewer_profile(strict boolean default false)
  returns setof public.profiles rows 1
  stable
  security definer
  parallel safe
  language plpgsql
  set search_path to ''
  as $$
    declare
      _user_id uuid;
    begin
      _user_id := public.viewer_profile_id();
      return query
        select * from public.profiles
        where profile_id = _user_id and profile_deleted_at is null
        limit 1;
      if not found and $1 is true then
        raise exception '[viewer_profile] not logged-in or profile not found for user_id: %', _user_id;
      end if;
    end;
  $$;

create or replace function public.viewer_tenant_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct t.tenant_id
    from public.organization_memberships m
    join public.organizations o using (organization_id)
    join public.tenants t using (tenant_id)
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and o.organization_deleted_at is null
      and t.tenant_deleted_at is null;
  $$;

create or replace function public.viewer_tenant_validate(tenant_id int)
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1 from public.viewer_tenant_ids() vt
      where vt = viewer_tenant_validate.tenant_id
    );
  $$;

create or replace function public.viewer_organization_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select m.organization_id
    from public.organization_memberships m
    join public.organizations o using (organization_id)
    join public.tenants t using (tenant_id)
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and o.organization_deleted_at is null
      and t.tenant_deleted_at is null;
  $$;

create or replace function public.viewer_organization_validate(organization_id int)
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1 from public.viewer_organization_ids() vo
      where vo = viewer_organization_validate.organization_id
    );
  $$;

-- Permission-based RLS helpers. SECURITY DEFINER so they bypass RLS on
-- organization_membership_permissions itself (otherwise SELECT-RLS on the very table we're checking
-- could deadlock the logic). Wildcard-aware: an `(*, organization_membership_id)` grant satisfies every
-- permission check inside that org. All helpers join via organization_membership_id and filter to
-- ACTIVE organization_memberships only — claimed by the viewer, accepted, not revoked, not rejected.

create or replace function public.viewer_permission_org_ids(permission_id extensions.citext)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct m.organization_id
    from public.organization_membership_permissions mp
    join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and (mp.permission_id = viewer_permission_org_ids.permission_id or mp.permission_id = '*');
  $$;

create or replace function public.viewer_has_permission(
  organization_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1
      from public.organization_membership_permissions mp
      join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
      where m.organization_id = viewer_has_permission.organization_id
        and m.profile_id = (select public.viewer_profile_id())
        and m.organization_membership_accepted_at is not null
        and m.organization_membership_revoked_at is null
        and m.organization_membership_rejected_at is null
        and (mp.permission_id = viewer_has_permission.permission_id or mp.permission_id = '*')
    );
  $$;

-- Tenant-scoped permission helpers. There is no tenant-level membership table — tenant authority
-- rides on the organization grants of the orgs inside the tenant (the espejo org created by
-- protected.tenant_create is where `tenant_manage` is granted by default). Wildcard `*` is honored.

create or replace function public.viewer_permission_tenant_ids(permission_id extensions.citext)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct o.tenant_id
    from public.organization_membership_permissions mp
    join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
    join public.organizations o on o.organization_id = m.organization_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and (mp.permission_id = viewer_permission_tenant_ids.permission_id or mp.permission_id = '*');
  $$;

create or replace function public.viewer_has_tenant_permission(
  tenant_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1
      from public.organization_membership_permissions mp
      join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
      join public.organizations o on o.organization_id = m.organization_id
      where o.tenant_id = viewer_has_tenant_permission.tenant_id
        and m.profile_id = (select public.viewer_profile_id())
        and m.organization_membership_accepted_at is not null
        and m.organization_membership_revoked_at is null
        and m.organization_membership_rejected_at is null
        and (mp.permission_id = viewer_has_tenant_permission.permission_id or mp.permission_id = '*')
    );
  $$;

create or replace function public.viewer_organization_membership_permissions()
  returns table (organization_id int, permission_id extensions.citext)
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select m.organization_id, mp.permission_id
    from public.organization_membership_permissions mp
    join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null;
  $$;

-- Agency viewer helpers. JWT-only checks are fast (no DB lookup).
-- viewer_agency_permission_org_ids / viewer_has_agency_permission / viewer_agency_tenant_ids
-- use SECURITY DEFINER to bypass RLS on the grant tables they query.

create or replace function public.viewer_agency_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select af.agency_id
    from public.agency_memberships af
    join public.agencies a using (agency_id)
    where af.profile_id = (select public.viewer_profile_id())
      and af.agency_membership_accepted_at is not null
      and af.agency_membership_revoked_at is null
      and af.agency_membership_rejected_at is null
      and a.agency_deleted_at is null;
  $$;

create or replace function public.viewer_is_agency_member()
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (select 1 from public.viewer_agency_ids());
  $$;

-- Returns org IDs where the viewer has the given permission via any of their agencies.
-- Covers: (1) explicit per-org grants, (2) global grants (org IS NULL) → all orgs.
-- Wildcard '*' honored throughout.
create or replace function public.viewer_agency_permission_org_ids(
  permission_id extensions.citext
)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select aog.organization_id
    from public.agencies_organizations_grants aog
    where aog.agency_id in (select public.viewer_agency_ids())
      and aog.organization_id is not null
      and (aog.permission_id = viewer_agency_permission_org_ids.permission_id or aog.permission_id = '*')

    union

    select org.organization_id
    from public.organizations org
    where exists (
      select 1 from public.agencies_organizations_grants aog
      where aog.agency_id in (select public.viewer_agency_ids())
        and aog.organization_id is null
        and (aog.permission_id = viewer_agency_permission_org_ids.permission_id or aog.permission_id = '*')
    );
  $$;

create or replace function public.viewer_has_agency_permission(
  organization_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select viewer_has_agency_permission.organization_id in (
      select public.viewer_agency_permission_org_ids(viewer_has_agency_permission.permission_id)
    );
  $$;

-- Derives tenant IDs accessible via agency grants (tenants table has no organization_id).
create or replace function public.viewer_agency_tenant_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct org.tenant_id
    from public.organizations org
    where org.organization_id in (
      select public.viewer_agency_permission_org_ids('*')
    );
  $$;

create or replace function public.viewer_agencies_collection()
  returns setof public.agencies
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select a.*
    from public.agencies a
    where a.agency_id in (select public.viewer_agency_ids());
  $$;

create or replace function public.viewer_agency_by_id(agency_id int)
  returns setof public.agencies rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select a.*
    from public.agencies a
    where a.agency_id = viewer_agency_by_id.agency_id
      and a.agency_id in (select public.viewer_agency_ids())
    limit 1;
  $$;

create or replace function public.viewer_agency_by_slug(agency_slug text)
  returns setof public.agencies rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select a.*
    from public.agencies a
    where a.agency_slug = viewer_agency_by_slug.agency_slug
      and a.agency_id in (select public.viewer_agency_ids())
    limit 1;
  $$;

-- Team roster for an agency: every membership (accepted, pending, revoked,
-- rejected) with the member's display name and login email. The plain
-- `agency_memberships select own` RLS policy only exposes the caller's own row,
-- so listing co-members and reading their `auth.users` email both require a
-- security-definer hop. The caller is gated to accepted affiliates via
-- `viewer_agency_ids()` (so a non-member gets zero rows), letting the agency
-- shell pages drop the service-role client and `auth.admin.listUsers()` entirely.
create or replace function public.viewer_agency_team(agency_id int)
  returns table (
    agency_membership_id int,
    profile_id uuid,
    agency_membership_accepted_at timestamptz,
    agency_membership_revoked_at timestamptz,
    agency_membership_rejected_at timestamptz,
    agency_membership_created_at timestamptz,
    profile_name_full text,
    email text
  )
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select
      m.agency_membership_id,
      m.profile_id,
      m.agency_membership_accepted_at,
      m.agency_membership_revoked_at,
      m.agency_membership_rejected_at,
      m.agency_membership_created_at,
      p.profile_name_full,
      u.email::text
    from public.agency_memberships m
    join public.profiles p using (profile_id)
    left join auth.users u on u.id = m.profile_id
    where m.agency_id = viewer_agency_team.agency_id
      and viewer_agency_team.agency_id in (select public.viewer_agency_ids())
    order by m.agency_membership_created_at asc;
  $$;

-- Returns the full agency_memberships rows (not an anonymous table) so that
-- pg_graphql exposes it as AgencyMembershipsConnection on Query. The plain
-- `agency_memberships select own` RLS only exposes the caller's own row; this
-- security-definer hop mirrors viewer_agency_team's gate but returns the named
-- table type so GraphQL can traverse it.
create or replace function public.viewer_agency_memberships(agency_id int)
  returns setof public.agency_memberships
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
as $$
  select m.*
  from public.agency_memberships m
  where m.agency_id = viewer_agency_memberships.agency_id
    and viewer_agency_memberships.agency_id in (select public.viewer_agency_ids())
  order by m.agency_membership_created_at asc;
$$;

-- External-access picker for an organization's admins: every enabled agency with
-- its active-affiliate count and whether it is already granted access to THIS org
-- (per-org grant) or globally (org IS NULL, permission '*'). The org admin is not
-- an affiliate of these agencies, so `viewer_agency_ids()` does not apply and the
-- agencies/grants/memberships tables are otherwise service-role-only in RLS — this
-- security-definer hop is gated instead on `organization_manage` for the org, so
-- the settings page drops its service-role client.
create or replace function public.viewer_organization_external_agencies(organization_id int)
  returns table (
    agency_id int,
    agency_name text,
    agency_slug text,
    active_affiliates int,
    granted_here boolean,
    is_global boolean
  )
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select
      a.agency_id,
      a.agency_name,
      a.agency_slug,
      coalesce(m.active_count, 0)::int as active_affiliates,
      coalesce(gh.granted, false) as granted_here,
      coalesce(gg.granted, false) as is_global
    from public.agencies a
    left join lateral (
      select count(*) as active_count
      from public.agency_memberships am
      where am.agency_id = a.agency_id
        and am.agency_membership_accepted_at is not null
        and am.agency_membership_revoked_at is null
        and am.agency_membership_rejected_at is null
    ) m on true
    left join lateral (
      select true as granted
      from public.agencies_organizations_grants g
      where g.agency_id = a.agency_id
        and g.organization_id = viewer_organization_external_agencies.organization_id
      limit 1
    ) gh on true
    left join lateral (
      select true as granted
      from public.agencies_organizations_grants g
      where g.agency_id = a.agency_id
        and g.organization_id is null
        and g.permission_id = '*'
      limit 1
    ) gg on true
    where a.agency_deleted_at is null
      and public.viewer_has_permission(
        viewer_organization_external_agencies.organization_id, 'organization_manage')
    order by a.agency_name asc;
  $$;

-- ============================================================
-- RLS SELECT policies for agency tables (defined here because they
-- require viewer_agency_ids() and viewer_permission_org_ids() to exist first)
-- ============================================================

-- agencies: visible to affiliates of the agency.
drop policy if exists "agencies select by affiliates" on public.agencies;
create policy "agencies select by affiliates"
  on public.agencies for select to authenticated
  using (agency_id in (select public.viewer_agency_ids()));

-- agency_memberships: each profile sees their own.
drop policy if exists "agency_memberships select own" on public.agency_memberships;
create policy "agency_memberships select own"
  on public.agency_memberships for select to authenticated
  using (profile_id = (select public.viewer_profile_id()));

-- agencies_organizations_grants: visible to affiliates or to orgs with organization_manage.
drop policy if exists "agencies_organizations_grants select" on public.agencies_organizations_grants;
create policy "agencies_organizations_grants select"
  on public.agencies_organizations_grants for select to authenticated
  using (
    agency_id in (select public.viewer_agency_ids())
    or organization_id in (select public.viewer_permission_org_ids('organization_manage'))
  );

-- ============================================================
-- Agency internal-capability helpers + RLS (agency_membership_permissions)
-- ============================================================
-- These mean "authority over the agency's OWN team" — NOT the same as the
-- existing viewer_has_agency_permission / viewer_agency_permission_org_ids, which
-- mean "this agency may reach that organization". Hence the distinct `_team_` names.
-- SECURITY DEFINER so they bypass RLS on agency_membership_permissions itself.
-- Wildcard `*` honored, mirroring viewer_permission_org_ids.

create or replace function public.viewer_agency_team_permission_ids(permission_id extensions.citext)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct m.agency_id
    from public.agency_membership_permissions mp
    join public.agency_memberships m on m.agency_membership_id = mp.agency_membership_id
    join public.agencies a on a.agency_id = m.agency_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.agency_membership_accepted_at is not null
      and m.agency_membership_revoked_at is null
      and m.agency_membership_rejected_at is null
      and a.agency_deleted_at is null
      and (mp.permission_id = viewer_agency_team_permission_ids.permission_id or mp.permission_id = '*');
  $$;

create or replace function public.viewer_has_agency_team_permission(
  agency_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select viewer_has_agency_team_permission.agency_id in (
      select public.viewer_agency_team_permission_ids(viewer_has_agency_team_permission.permission_id)
    );
  $$;

-- Resolve a membership's agency, bypassing the own-row-only RLS on agency_memberships.
-- The agency_membership_permissions policies need this: an admin grants/reads capabilities on
-- OTHER affiliates' memberships, which the caller cannot SELECT directly under that table's RLS.
create or replace function public.agency_id_of_membership(agency_membership_id int)
  returns int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select m.agency_id
    from public.agency_memberships m
    where m.agency_membership_id = agency_id_of_membership.agency_membership_id;
  $$;

-- True iff the agency has at least one OTHER active affiliate holding
-- `agency_members_manage` or `*`. Guards against removing the last team admin.
create or replace function public.agency_has_other_active_admin(
  _agency_id int,
  _excluded_agency_membership_id int
) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select exists (
    select 1
    from public.agency_memberships m
    join public.agency_membership_permissions mp on mp.agency_membership_id = m.agency_membership_id
    where m.agency_id = _agency_id
      and m.agency_membership_id <> _excluded_agency_membership_id
      and m.agency_membership_accepted_at is not null
      and m.agency_membership_revoked_at is null
      and m.agency_membership_rejected_at is null
      and mp.permission_id in ('agency_members_manage', '*')
  );
$$;

revoke execute on function public.agency_has_other_active_admin(int, int) from public;
grant execute on function public.agency_has_other_active_admin(int, int) to authenticated;

-- Block deleting the last `agency_members_manage`/`*` grant of the agency's last admin.
-- An admin holding BOTH may drop one — the other still grants admin status.
-- service_role bypasses (viewer_profile_id() is NULL) so migrations can rescue agencies.
create or replace function public.agency_membership_permissions_protect_last_admin()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  _agency_id int;
begin
  if public.viewer_profile_id() is null then
    return old;
  elsif old.permission_id not in ('agency_members_manage', '*') then
    return old;
  end if;

  select agency_id into _agency_id
  from public.agency_memberships
  where agency_membership_id = old.agency_membership_id;

  -- If the membership keeps the OTHER admin permission, it stays an admin — no lockout.
  if exists (
    select 1 from public.agency_membership_permissions
    where agency_membership_id = old.agency_membership_id
      and permission_id in ('agency_members_manage', '*')
      and permission_id <> old.permission_id
  ) then
    return old;
  end if;

  if not public.agency_has_other_active_admin(_agency_id, old.agency_membership_id) then
    raise exception 'last_admin_protected'
      using hint = 'cannot revoke the last admin permission in the agency';
  end if;

  return old;
end;
$$;

drop trigger if exists agency_membership_permissions_trigger_protect_last_admin on public.agency_membership_permissions;
create trigger agency_membership_permissions_trigger_protect_last_admin
  before delete on public.agency_membership_permissions
  for each row execute procedure public.agency_membership_permissions_protect_last_admin();

-- agency_membership_permissions: visible to agency co-members; writable by team admins.
drop policy if exists "agency_membership_permissions select by co-members" on public.agency_membership_permissions;
create policy "agency_membership_permissions select by co-members"
  on public.agency_membership_permissions for select
  to authenticated
  using (
    public.agency_id_of_membership(agency_membership_id) in (select public.viewer_agency_ids())
  );

drop policy if exists "agency_membership_permissions write with agency_members_manage" on public.agency_membership_permissions;
create policy "agency_membership_permissions write with agency_members_manage"
  on public.agency_membership_permissions for all
  to authenticated
  using (
    public.agency_id_of_membership(agency_membership_id)
      in (select public.viewer_agency_team_permission_ids('agency_members_manage'))
  )
  with check (
    public.agency_id_of_membership(agency_membership_id)
      in (select public.viewer_agency_team_permission_ids('agency_members_manage'))
  );

-- agencies_organizations_grants writes: the ORG side decides (organization_manage).
-- Global grants (organization_id IS NULL) are excluded by the IN test → stay service_role-only.
grant insert, update, delete on table public.agencies_organizations_grants to anon, authenticated;
drop policy if exists "agencies_organizations_grants write with organization_manage" on public.agencies_organizations_grants;
create policy "agencies_organizations_grants write with organization_manage"
  on public.agencies_organizations_grants for all
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('organization_manage')))
  with check (organization_id in (select public.viewer_permission_org_ids('organization_manage')));

-- Active tenant-org organization_memberships for the current viewer.
-- Runs as view owner (postgres), bypassing RLS; scoped to the caller
-- via viewer_profile_id(). Null uid → no rows (safe for unauthenticated).
-- Used by viewer_tenants_collection/viewer_organizations_collection family below.
drop view if exists public.tenants_organizations_profiles;
create view public.tenants_organizations_profiles as
  select
    t.tenant_id,
    t.tenant_slug,
    t.tenant_name,
    t.tenant_deleted_at,
    t.tenant_created_at,
    t.tenant_updated_at,
    o.organization_id,
    o.tenant_id as organization_tenant_id,
    o.organization_slug,
    o.organization_name,
    o.organization_deleted_at,
    o.organization_created_at,
    o.organization_updated_at,
    m.profile_id
  from public.organization_memberships m
  join public.organizations o using (organization_id)
  join public.tenants t using (tenant_id)
  where m.profile_id = public.viewer_profile_id()
    and m.organization_membership_accepted_at is not null
    and m.organization_membership_revoked_at is null
    and m.organization_membership_rejected_at is null
    and o.organization_deleted_at is null
    and t.tenant_deleted_at is null;

revoke all on public.tenants_organizations_profiles from anon, authenticated;
grant select on public.tenants_organizations_profiles to authenticated;

-- TODO: is this safe?
create view public.user_sessions with (security_invoker = true, security_barrier = true) as (
  select
    s.id,
    s.user_id,
    s.user_agent,
    s.ip::text as ip,
    s.created_at,
    s.refreshed_at,
    s.not_after
  from auth.sessions as s
  -- where s.user_id = (select auth.uid())
);

revoke all on public.user_sessions from anon, authenticated;
grant select on public.user_sessions to anon, authenticated;

comment on view public.user_sessions is e'@graphql({"primary_key_columns": ["id"]})';

create or replace function public.viewer_sessions_collection()
  returns setof public.user_sessions
  stable
  security definer
  language sql
  set search_path to ''
  as $$
    select s.*
    from public.user_sessions as s
    where s.user_id = (select auth.uid())
    order by s.refreshed_at desc nulls last;
  $$;

create or replace function public.revoke_session(session_id auth.sessions.id%type)
  returns void
  security definer
  language sql
  set search_path to ''
  as $$
    delete from auth.sessions s
    where s.id = revoke_session.session_id
      and s.user_id = auth.uid();
  $$;

create or replace function public.viewer_tenants_collection()
  returns setof public.tenants
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select t.*
    from public.tenants t
    where t.tenant_id in (select tenant_id from public.tenants_organizations_profiles);
  $$;

create or replace function public.viewer_organizations_collection()
  returns setof public.organizations
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select o.*
    from public.organizations o
    where o.organization_id in (select organization_id from public.tenants_organizations_profiles);
  $$;

create or replace function public.viewer_tenant_by_id(tenant_id int)
  returns setof public.tenants rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select t.*
    from public.tenants t
    where t.tenant_id = viewer_tenant_by_id.tenant_id
      and t.tenant_id in (select tenant_id from public.tenants_organizations_profiles)
    limit 1;
  $$;

create or replace function public.viewer_tenant_by_slug(tenant_slug text)
  returns setof public.tenants rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select t.*
    from public.tenants t
    where t.tenant_slug = viewer_tenant_by_slug.tenant_slug
      and t.tenant_id in (select tenant_id from public.tenants_organizations_profiles)
    limit 1;
  $$;

create or replace function public.viewer_organization_by_id(organization_id int)
  returns setof public.organizations rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select o.*
    from public.organizations o
    where o.organization_id = viewer_organization_by_id.organization_id
      and o.organization_id in (select organization_id from public.tenants_organizations_profiles)
    limit 1;
  $$;

create or replace function public.viewer_organization_membership_by_id(organization_membership_id int)
  returns setof public.organization_memberships rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select m.*
    from public.organization_memberships m
    where m.organization_membership_id = viewer_organization_membership_by_id.organization_membership_id
      and m.organization_id in (select public.viewer_organization_ids())
    limit 1;
  $$;

grant execute on function public.viewer_organization_membership_by_id(int) to authenticated;

-- ============================================================
-- profiles SELECT policy (now that organization_memberships exists)
-- ============================================================
-- Profiles are visible to: self, organization co-members, and agency affiliates with access.

drop policy if exists "Users can select their own profiles." on public.profiles;
drop policy if exists "Profiles visible to self or tenant co-members or concierge" on public.profiles;
drop policy if exists "Profiles visible to self or org co-members or concierge" on public.profiles;
create policy "Profiles visible to self or org co-members or agency affiliates"
  on public.profiles for select
  to authenticated
  using (
    profile_deleted_at is null
    and (
      profile_id = (select public.viewer_profile_id())
      or exists (
        select 1
        from public.organization_memberships me
        join public.organization_memberships them using (organization_id)
        where me.profile_id = (select public.viewer_profile_id())
          and them.profile_id = public.profiles.profile_id
          and me.organization_membership_accepted_at is not null
          and me.organization_membership_revoked_at is null
          and me.organization_membership_rejected_at is null
          and them.organization_membership_accepted_at is not null
          and them.organization_membership_revoked_at is null
          and them.organization_membership_rejected_at is null
      )
      or exists (
        select 1 from public.organization_memberships m
        where m.profile_id = public.profiles.profile_id
          and m.organization_id in (select public.viewer_agency_permission_org_ids('*'))
      )
    )
  );

-- ============================================================
-- RLS policies for tenants + organizations + organization_memberships + permissions
-- ============================================================

alter table public.tenants enable row level security;

revoke all on table public.tenants from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, update on table public.tenants to anon, authenticated;
grant select, insert, update, delete on table public.tenants to service_role;
grant usage, select on sequence public.tenants_tenant_id_seq to service_role;

drop policy if exists "tenants select by members or concierge" on public.tenants;
drop policy if exists "tenants select by members or agency affiliates" on public.tenants;
create policy "tenants select by members or agency affiliates"
  on public.tenants for select
  to authenticated
  using (
    tenant_id in (select public.viewer_tenant_ids())
    or tenant_id in (select public.viewer_agency_tenant_ids())
  );

drop policy if exists "tenants update by owner" on public.tenants;
drop policy if exists "tenants update with organization_manage" on public.tenants;
drop policy if exists "tenants update with tenant_manage" on public.tenants;
create policy "tenants update with tenant_manage"
  on public.tenants for update
  to authenticated
  using (tenant_id in (select public.viewer_permission_tenant_ids('tenant_manage')))
  with check (tenant_id in (select public.viewer_permission_tenant_ids('tenant_manage')));

-- INSERT/DELETE on tenants: service_role only. No authenticated policy -> default deny.

alter table public.organizations enable row level security;

revoke all on table public.organizations from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, update on table public.organizations to anon, authenticated;
grant select, insert, update, delete on table public.organizations to service_role;
grant usage, select on sequence public.organizations_organization_id_seq to service_role;

drop policy if exists "organizations select by members or concierge" on public.organizations;
drop policy if exists "organizations select by members or agency affiliates" on public.organizations;
create policy "organizations select by members or agency affiliates"
  on public.organizations for select
  to authenticated
  using (
    organization_id in (select public.viewer_organization_ids())
    or organization_id in (select public.viewer_agency_permission_org_ids('*'))
  );

drop policy if exists "organizations update by owner" on public.organizations;
drop policy if exists "organizations update with organization_manage" on public.organizations;
create policy "organizations update with organization_manage"
  on public.organizations for update
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('organization_manage')));

-- INSERT/DELETE on organizations: service_role only. No authenticated policy -> default deny.

alter table public.organization_memberships enable row level security;

revoke all on table public.organization_memberships from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, insert, update, delete on table public.organization_memberships to anon, authenticated;
grant select, insert, update, delete on table public.organization_memberships to service_role;
grant usage, select on sequence public.organization_memberships_organization_membership_id_seq to service_role;

drop policy if exists "organization_memberships select by co-members" on public.organization_memberships;
drop policy if exists "organization_memberships select by co-members or agency affiliates" on public.organization_memberships;
create policy "organization_memberships select by co-members or agency affiliates"
  on public.organization_memberships for select
  to authenticated
  using (
    organization_id in (select public.viewer_organization_ids())
    or organization_id in (select public.viewer_agency_permission_org_ids('*'))
  );

drop policy if exists "organization_memberships write with members_manage" on public.organization_memberships;
create policy "organization_memberships write with members_manage"
  on public.organization_memberships for all
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('members_manage')))
  with check (organization_id in (select public.viewer_permission_org_ids('members_manage')));

-- ============================================================
-- RLS for permissions catalog
-- ============================================================
-- The catalog is read-only to authenticated users (UI needs to list available slugs).
-- INSERT/UPDATE/DELETE: service_role only (catalog is seeded in schema, not user-managed).

alter table public.permissions enable row level security;

revoke all on table public.permissions from anon, authenticated;
grant select on table public.permissions to anon, authenticated;
grant select, insert, update, delete on table public.permissions to service_role;

drop policy if exists "permissions select to all authenticated" on public.permissions;
create policy "permissions select to all authenticated"
  on public.permissions for select
  to authenticated
  using (true);

-- ============================================================
-- RLS for organization_membership_permissions
-- ============================================================

alter table public.organization_membership_permissions enable row level security;

revoke all on table public.organization_membership_permissions from anon, authenticated;
grant select, insert, update, delete on table public.organization_membership_permissions to anon, authenticated;
grant select, insert, update, delete on table public.organization_membership_permissions to service_role;

-- Co-members in the same organization can see the grants in that organization.
-- Resolve organization via the referenced organization_membership (no direct org column anymore).
drop policy if exists "organization_membership_permissions select by co-members" on public.organization_membership_permissions;
drop policy if exists "organization_membership_permissions select by co-members or agency affiliates" on public.organization_membership_permissions;
create policy "organization_membership_permissions select by co-members or agency affiliates"
  on public.organization_membership_permissions for select
  to authenticated
  using (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.organization_membership_permissions.organization_membership_id
        and (
          m.organization_id in (select public.viewer_organization_ids())
          or m.organization_id in (select public.viewer_agency_permission_org_ids('*'))
        )
    )
  );

-- Only users with `members_manage` in the organization can grant/revoke.
drop policy if exists "organization_membership_permissions write with members_manage" on public.organization_membership_permissions;
create policy "organization_membership_permissions write with members_manage"
  on public.organization_membership_permissions for all
  to authenticated
  using (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.organization_membership_permissions.organization_membership_id
        and m.organization_id in (select public.viewer_permission_org_ids('members_manage'))
    )
  )
  with check (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.organization_membership_permissions.organization_membership_id
        and m.organization_id in (select public.viewer_permission_org_ids('members_manage'))
    )
  );

-- ============================================================
-- Business invariants on organization_memberships / organization_membership_permissions
-- ============================================================
-- These triggers protect against actions that would leave an organization
-- without a usable admin surface, or let a user remove themselves. They run
-- AFTER RLS write-policies on the same tables: RLS already gates "who can
-- mutate", these gate "what may not happen". service_role bypasses (auth.uid()
-- is NULL) so migrations and admin tools can still rescue stuck orgs.

-- True iff org has at least one OTHER claimed, accepted, active organization_membership
-- holding `members_manage` or the wildcard `*`. Pending invites don't count.
create or replace function public.org_has_other_active_admin(
  _organization_id int,
  _excluded_organization_membership_id int
) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select exists (
    select 1
    from public.organization_memberships m
    join public.organization_membership_permissions mp on mp.organization_membership_id = m.organization_membership_id
    where m.organization_id = _organization_id
      and m.organization_membership_id <> _excluded_organization_membership_id
      and m.profile_id is not null
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and mp.permission_id in ('members_manage', '*')
  );
$$;

revoke execute on function public.org_has_other_active_admin(int, int) from public;
grant execute on function public.org_has_other_active_admin(int, int) to authenticated;

-- Block deleting members_manage or '*' from the last claimed admin in an org.
-- An admin who holds BOTH may demote one — the other still grants admin status.
create or replace function public.organization_membership_permissions_protect_last_admin()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  _organization_id int;
  _profile_id uuid;
begin
  -- service_role bypass: auth.uid() is NULL when called outside an authenticated session.
  if public.viewer_profile_id() is null then
    return old;
  elsif old.permission_id not in ('members_manage', '*') then
    return old;
  end if;

  select organization_id, profile_id into _organization_id, _profile_id
  from public.organization_memberships
  where organization_membership_id = old.organization_membership_id;

  -- Pending invites carry no live access — they cannot lock anyone out.
  -- If the organization_membership keeps the OTHER admin permission, it remains active — no lockout.
  if _profile_id is null then
    return old;
  elsif exists (
    select 1 from public.organization_membership_permissions
    where organization_membership_id = old.organization_membership_id
      and permission_id in ('members_manage', '*')
      and permission_id <> old.permission_id
  ) then
    return old;
  end if;

  -- This deletion does strip admin status from the organization_membership. Ensure another
  -- claimed, accepted, active admin exists in the org.
  if not public.org_has_other_active_admin(_organization_id, old.organization_membership_id) then
    raise exception 'last_admin_protected'
      using hint = 'cannot revoke the last admin permission in the organization';
  end if;

  return old;
end;
$$;

drop trigger if exists organization_membership_permissions_trigger_protect_last_admin on public.organization_membership_permissions;
create trigger organization_membership_permissions_trigger_protect_last_admin
  before delete on public.organization_membership_permissions
  for each row execute procedure public.organization_membership_permissions_protect_last_admin();

-- Block self-revocation and revoking the last claimed admin in an org.
create or replace function public.organization_memberships_protect_revoke()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  _viewer uuid;
begin
  -- Only fire when revoked_at transitions from NULL → not NULL.
  if old.organization_membership_revoked_at is not null or new.organization_membership_revoked_at is null then
    return new;
  end if;

  _viewer := public.viewer_profile_id();

  -- service_role bypass.
  if _viewer is null then
    return new;
  end if;

  -- Self-remove: caller cannot revoke their own organization_membership row.
  if new.profile_id is not null and new.profile_id = _viewer then
    raise exception 'self_remove_blocked'
      using hint = 'cannot revoke your own organization_membership';
  -- Last-admin: pending invites carry no live access, only claimed seats lock the org.
  elsif new.profile_id is not null
     and not public.org_has_other_active_admin(new.organization_id, new.organization_membership_id) then
    raise exception 'last_admin_protected'
      using hint = 'cannot revoke the last admin of the organization';
  end if;

  return new;
end;
$$;

drop trigger if exists organization_memberships_trigger_protect_revoke on public.organization_memberships;
create trigger organization_memberships_trigger_protect_revoke
  before update of organization_membership_revoked_at on public.organization_memberships
  for each row execute procedure public.organization_memberships_protect_revoke();

-- ============================================================
-- RLS for permission_presets
-- ============================================================
-- Global presets (organization_id IS NULL) are visible to everyone authenticated;
-- org-specific presets only to co-members of that org. Writes:
--  - global rows: service_role only
--  - org rows: anyone with `presets_manage` in that org

alter table public.permission_presets enable row level security;

revoke all on table public.permission_presets from anon, authenticated;
grant select, insert, update, delete on table public.permission_presets to anon, authenticated;
grant select, insert, update, delete on table public.permission_presets to service_role;
grant usage, select on sequence public.permission_presets_permission_preset_id_seq to service_role;

drop policy if exists "permission_presets select globals or own org" on public.permission_presets;
drop policy if exists "permission_presets select globals or own org or agency affiliates" on public.permission_presets;
create policy "permission_presets select globals or own org or agency affiliates"
  on public.permission_presets for select
  to authenticated
  using (
    organization_id is null
    or organization_id in (select public.viewer_organization_ids())
    or organization_id in (select public.viewer_agency_permission_org_ids('*'))
  );

drop policy if exists "permission_presets write with presets_manage" on public.permission_presets;
create policy "permission_presets write with presets_manage"
  on public.permission_presets for all
  to authenticated
  using (
    organization_id is not null
    and organization_id in (select public.viewer_permission_org_ids('presets_manage'))
  )
  with check (
    organization_id is not null
    and organization_id in (select public.viewer_permission_org_ids('presets_manage'))
  );

-- ============================================================
-- Custom access token hook
-- ============================================================
-- Pass-through hook: only the subject (profile_id as `sub`) lives in the JWT.
-- Tenant / organization / agency membership and onboarding state are resolved at
-- query time via the viewer_* helpers — never embedded in the token.
-- Permissions are deliberately NOT included in the JWT — a single user may have many
-- per-org permissions, and putting them here can balloon cookie size past the 4KB limit.
-- Permission checks happen at query time via viewer_has_permission / viewer_permission_org_ids,
-- which hit the indexed organization_membership_permissions table.
-- Lives in `public`, NOT security definer — supabase_auth_admin gets direct grants
-- + permissive SELECT policies on the source tables (pattern from sibling project).

create or replace function public.user_auth_hook(event jsonb)
  returns jsonb
  language plpgsql
  stable
  parallel safe
  set search_path to ''
  as $$
    begin
      -- Only the subject (profile_id, carried as the `sub` claim) lives in the JWT.
      -- Tenant / organization / agency organization_membership and onboarding state are resolved at
      -- query time via the viewer_* helpers (which hit the DB directly), never embedded
      -- in the token. Pass the event through unchanged.
      return event;
    end;
  $$;

revoke execute on function public.user_auth_hook(jsonb) from authenticated, anon, public;
grant execute on function public.user_auth_hook(jsonb) to supabase_auth_admin;

-- supabase_auth_admin only needs USAGE on public to call the (now pass-through) hook.
grant usage on schema public to supabase_auth_admin;

-- ============================================================
-- addresses hierarchy
-- level0 = country  (ISO 3166-1 alpha-2)
-- level1 = region   (ISO 3166-2, 5–6 chars)
-- level2 = province (slug)
-- level3 = commune  (slug)
-- ============================================================

create table if not exists public.addresses_level0 (
  address_level0_id text not null check (length(address_level0_id) = 2),

  address_level0_name text not null check (length(address_level0_name) <= 100),
  address_level0_emoji text check (char_length(address_level0_emoji) between 1 and 8),
  address_level0_deleted_at timestamptz,
  address_level0_hidden_at timestamptz,
  address_level0_created_at timestamptz not null default current_timestamp,
  address_level0_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id)
);

comment on column public.addresses_level0.address_level0_id is e'ISO 3166-1 alpha-2 country code';

create index if not exists addresses_level0_deleted_at_idx
  on public.addresses_level0 (address_level0_deleted_at)
  where address_level0_deleted_at is not null;
create index if not exists addresses_level0_hidden_at_idx
  on public.addresses_level0 (address_level0_hidden_at)
  where address_level0_hidden_at is not null;
create index if not exists addresses_level0_name_idx
  on public.addresses_level0 (address_level0_name asc nulls last);

drop trigger if exists handle_addresses_level0_updated_at on public.addresses_level0;
create trigger handle_addresses_level0_updated_at
  before update on public.addresses_level0
  for each row execute procedure extensions.moddatetime(address_level0_updated_at);

drop trigger if exists soft_delete on public.addresses_level0;
create trigger soft_delete
  before delete on public.addresses_level0
  for each row when (old.address_level0_deleted_at is null)
  execute function internal.soft_delete('address_level0_deleted_at');

revoke all on table public.addresses_level0 from anon, authenticated;
grant select on table public.addresses_level0 to anon, authenticated;

alter table public.addresses_level0 enable row level security;

drop policy if exists "Anyone can select addresses_level0." on public.addresses_level0;
create policy "Anyone can select addresses_level0."
  on public.addresses_level0 for select
  using (address_level0_deleted_at is null);

-- ============================================================

create table if not exists public.addresses_level1 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),

  address_level1_name text not null check (length(address_level1_name) <= 100),
  address_level1_deleted_at timestamptz,
  address_level1_hidden_at timestamptz,
  address_level1_created_at timestamptz not null default current_timestamp,
  address_level1_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id, address_level1_id),

  constraint fk_addresses_level1_addresses_level0 foreign key (address_level0_id)
    references public.addresses_level0 (address_level0_id) on delete no action
);

comment on column public.addresses_level1.address_level1_id is e'ISO 3166-2 code';

create index if not exists addresses_level1_deleted_at_idx
  on public.addresses_level1 (address_level1_deleted_at)
  where address_level1_deleted_at is not null;
create index if not exists addresses_level1_hidden_at_idx
  on public.addresses_level1 (address_level1_hidden_at)
  where address_level1_hidden_at is not null;
create index if not exists addresses_level1_name_idx
  on public.addresses_level1 (address_level1_name asc nulls last);
create index if not exists addresses_level1_level0_idx
  on public.addresses_level1 (address_level0_id);

drop trigger if exists handle_addresses_level1_updated_at on public.addresses_level1;
create trigger handle_addresses_level1_updated_at
  before update on public.addresses_level1
  for each row execute procedure extensions.moddatetime(address_level1_updated_at);

drop trigger if exists soft_delete on public.addresses_level1;
create trigger soft_delete
  before delete on public.addresses_level1
  for each row when (old.address_level1_deleted_at is null)
  execute function internal.soft_delete('address_level1_deleted_at');

revoke all on table public.addresses_level1 from anon, authenticated;
grant select on table public.addresses_level1 to anon, authenticated;

alter table public.addresses_level1 enable row level security;

drop policy if exists "Anyone can select addresses_level1." on public.addresses_level1;
create policy "Anyone can select addresses_level1."
  on public.addresses_level1 for select
  using (address_level1_deleted_at is null);

-- ============================================================

create table if not exists public.addresses_level2 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),
  address_level2_id text not null check (length(address_level2_id) <= 100),

  address_level2_name text not null check (length(address_level2_name) <= 100),
  address_level2_deleted_at timestamptz,
  address_level2_hidden_at timestamptz,
  address_level2_created_at timestamptz not null default current_timestamp,
  address_level2_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id, address_level1_id, address_level2_id),

  constraint fk_addresses_level2_addresses_level1 foreign key (address_level0_id, address_level1_id)
    references public.addresses_level1 (address_level0_id, address_level1_id) on delete no action
);

comment on column public.addresses_level2.address_level2_id is e'Slug';

create index if not exists addresses_level2_deleted_at_idx
  on public.addresses_level2 (address_level2_deleted_at)
  where address_level2_deleted_at is not null;
create index if not exists addresses_level2_hidden_at_idx
  on public.addresses_level2 (address_level2_hidden_at)
  where address_level2_hidden_at is not null;
create index if not exists addresses_level2_name_idx
  on public.addresses_level2 (address_level2_name asc nulls last);
create index if not exists addresses_level2_level1_idx
  on public.addresses_level2 (address_level0_id, address_level1_id);

drop trigger if exists handle_addresses_level2_updated_at on public.addresses_level2;
create trigger handle_addresses_level2_updated_at
  before update on public.addresses_level2
  for each row execute procedure extensions.moddatetime(address_level2_updated_at);

drop trigger if exists soft_delete on public.addresses_level2;
create trigger soft_delete
  before delete on public.addresses_level2
  for each row when (old.address_level2_deleted_at is null)
  execute function internal.soft_delete('address_level2_deleted_at');

revoke all on table public.addresses_level2 from anon, authenticated;
grant select on table public.addresses_level2 to anon, authenticated;

alter table public.addresses_level2 enable row level security;

drop policy if exists "Anyone can select addresses_level2." on public.addresses_level2;
create policy "Anyone can select addresses_level2."
  on public.addresses_level2 for select
  using (address_level2_deleted_at is null);

-- ============================================================

create table if not exists public.addresses_level3 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),
  address_level2_id text not null check (length(address_level2_id) <= 100),
  address_level3_id text not null check (length(address_level3_id) <= 100),

  address_level3_name text not null check (length(address_level3_name) <= 100),
  address_level3_deleted_at timestamptz,
  address_level3_hidden_at timestamptz,
  address_level3_created_at timestamptz not null default current_timestamp,
  address_level3_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id, address_level1_id, address_level2_id, address_level3_id),

  constraint fk_addresses_level3_addresses_level2 foreign key (address_level0_id, address_level1_id, address_level2_id)
    references public.addresses_level2 (address_level0_id, address_level1_id, address_level2_id) on delete no action
);

create index if not exists addresses_level3_deleted_at_idx
  on public.addresses_level3 (address_level3_deleted_at)
  where address_level3_deleted_at is not null;
create index if not exists addresses_level3_hidden_at_idx
  on public.addresses_level3 (address_level3_hidden_at)
  where address_level3_hidden_at is not null;
create index if not exists addresses_level3_name_idx
  on public.addresses_level3 (address_level3_name asc nulls last);
create index if not exists addresses_level3_level2_idx
  on public.addresses_level3 (address_level0_id, address_level1_id, address_level2_id);

drop trigger if exists handle_addresses_level3_updated_at on public.addresses_level3;
create trigger handle_addresses_level3_updated_at
  before update on public.addresses_level3
  for each row execute procedure extensions.moddatetime(address_level3_updated_at);

drop trigger if exists soft_delete on public.addresses_level3;
create trigger soft_delete
  before delete on public.addresses_level3
  for each row when (old.address_level3_deleted_at is null)
  execute function internal.soft_delete('address_level3_deleted_at');

revoke all on table public.addresses_level3 from anon, authenticated;
grant select on table public.addresses_level3 to anon, authenticated;

alter table public.addresses_level3 enable row level security;

drop policy if exists "Anyone can select addresses_level3." on public.addresses_level3;
create policy "Anyone can select addresses_level3."
  on public.addresses_level3 for select
  using (address_level3_deleted_at is null);

-- ============================================================
-- profile_identities
-- ============================================================
-- Identity documents (national IDs, passports) used as login aliases. The document is
-- NEVER the auth identifier — Supabase Auth still uses email/phone. It is a lookup
-- alias to find which profile to send the OTP to.
--
-- A profile may carry several documents (RUT + foreign passport) but at most one of
-- each (country, kind) — enforced by UNIQUE (profile_id, address_level0_id, kind).
--
-- Globally, a given (country, kind, value) maps to a single profile_id (Modelo A):
-- the partial unique index `profile_identities_global_unique_idx` guarantees that
-- login by document is deterministic. Partial-on-disabled allows the same value to
-- be re-claimed if the original holder is soft-deleted.

do $$ begin
  create type public.profile_identity_document_kind as enum ('nin', 'passport');
exception when duplicate_object then null; end $$;

-- Normalizer: strips formatting, validates CL+NIN check digit (modulo 11).
-- Returns NULL on invalid input (caller treats NULL as rejection).
create or replace function internal.profile_identity_value_normalize(
  country text,
  kind public.profile_identity_document_kind,
  value text
) returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
    begin
      if value is null then
        return null;
      end if;
      _stripped := upper(regexp_replace(value, '[^0-9a-zA-Z]', '', 'g'));
      _stripped := regexp_replace(_stripped, '^0+', '', '');
      if _stripped = '' or char_length(_stripped) < 4 or char_length(_stripped) > 32 then
        return null;
      end if;
      if country = 'CL' and kind = 'nin' and not public.cl_rut_validate(_stripped) then
        return null;
      end if;
      return _stripped;
    end;
  $$;

create table if not exists public.profile_identities (
  profile_identity_id uuid not null primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles(profile_id) on delete cascade,
  address_level0_id text not null references public.addresses_level0(address_level0_id),
  profile_identity_document_kind public.profile_identity_document_kind not null,
  profile_identity_document_value text not null check (char_length(profile_identity_document_value) between 4 and 32),
  profile_identity_deleted_at timestamptz,
  profile_identity_created_at timestamptz not null default current_timestamp,
  profile_identity_updated_at timestamptz not null default current_timestamp,
  unique (profile_id, address_level0_id, profile_identity_document_kind)
);

create unique index if not exists profile_identities_global_unique_idx
  on public.profile_identities (
    address_level0_id, profile_identity_document_kind, profile_identity_document_value
  ) where profile_identity_deleted_at is null;

create index if not exists profile_identities_profile_idx
  on public.profile_identities (profile_id)
  where profile_identity_deleted_at is null;

drop trigger if exists handle_profile_identities_updated_at on public.profile_identities;
create trigger handle_profile_identities_updated_at
  before update on public.profile_identities
  for each row execute procedure extensions.moddatetime(profile_identity_updated_at);

drop trigger if exists soft_delete on public.profile_identities;
create trigger soft_delete
  before delete on public.profile_identities
  for each row when (old.profile_identity_deleted_at is null)
  execute function internal.soft_delete('profile_identity_deleted_at');

-- Normalize+validate trigger. RAISEs for invalid values (e.g. CL+NIN bad check digit).
create or replace function internal.profile_identities_normalize_value()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      _normalized := internal.profile_identity_value_normalize(
        NEW.address_level0_id,
        NEW.profile_identity_document_kind,
        NEW.profile_identity_document_value
      );
      if _normalized is null then
        raise exception 'Invalid % document value for %: %',
          NEW.profile_identity_document_kind,
          NEW.address_level0_id,
          NEW.profile_identity_document_value;
      end if;
      NEW.profile_identity_document_value := _normalized;
      return NEW;
    end;
  $$;

drop trigger if exists profile_identities_trigger_normalize_value on public.profile_identities;
create trigger profile_identities_trigger_normalize_value
  before insert or update of profile_identity_document_value, address_level0_id, profile_identity_document_kind
  on public.profile_identities
  for each row execute procedure internal.profile_identities_normalize_value();

alter table public.profile_identities enable row level security;

revoke all on table public.profile_identities from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, insert, update on table public.profile_identities to anon, authenticated;

-- SELECT: owner + admins with members_manage in orgs where the owner is a member, + agency affiliates.
-- HR sees the documents of the employees they administer (needed for payroll/contracts).
drop policy if exists "profile_identities select" on public.profile_identities;
create policy "profile_identities select"
  on public.profile_identities for select
  to authenticated
  using (
    profile_id = (select public.viewer_profile_id())
    or exists (
      select 1 from public.organization_memberships m
      where m.profile_id = public.profile_identities.profile_id
        and m.organization_id in (select public.viewer_permission_org_ids('members_manage'))
    )
    or exists (
      select 1 from public.organization_memberships m
      where m.profile_id = public.profile_identities.profile_id
        and m.organization_id in (select public.viewer_agency_permission_org_ids('*'))
    )
  );

-- INSERT/UPDATE: self-write (accept flow runs with auth.uid() = profile_id).
-- Admins do NOT modify employee identities directly — they flow through the invite path.
drop policy if exists "profile_identities write own" on public.profile_identities;
create policy "profile_identities write own"
  on public.profile_identities for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));

-- Anonymous resolver used by /auth/document. Returns the profile_id owning the given
-- document, or NULL if no match (incl. malformed values per the normalizer). Same
-- enumeration-leak posture as email_exists / phone_exists.
create or replace function public.profile_identity_resolve(
  country text,
  kind public.profile_identity_document_kind,
  value text
) returns uuid
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _normalized text;
      _result uuid;
    begin
      _normalized := internal.profile_identity_value_normalize(country, kind, value);
      if _normalized is null then
        return null;
      end if;
      select profile_id into _result
      from public.profile_identities
      where address_level0_id = country
        and profile_identity_document_kind = kind
        and profile_identity_document_value = _normalized
        and profile_identity_deleted_at is null
      limit 1;
      return _result;
    end;
  $$;

grant execute on function public.profile_identity_resolve(text, public.profile_identity_document_kind, text) to anon, authenticated;

-- Computed relationship: exposes a profile's first active identity document via pg_graphql
-- (viewerProfile.profileIdentity). Used by onboarding to check document completion in a
-- single GraphQL round-trip without a separate Supabase SDK count query.
create or replace function public.profile_identity(this public.profiles)
  returns setof public.profile_identities rows 1
  stable
  language sql
  strict
  security invoker
  parallel safe
  set search_path to ''
as $$
  select *
  from public.profile_identities
  where profile_id = this.profile_id
    and profile_identity_deleted_at is null
  order by profile_identity_id desc
  limit 1;
$$;

grant execute on function public.profile_identity(public.profiles) to anon, authenticated;

-- ============================================================
-- tenant tier + custom domains
-- ============================================================
-- A tenant may have many domains (apex + subdomains, staging hosts, etc).
-- Each domain is globally unique.

do $$ begin
  create type public.tenant_tier as enum ('free', 'pro', 'enterprise');
exception when duplicate_object then null; end $$;

alter table public.tenants
  add column if not exists tenant_tier public.tenant_tier not null default 'free';

create table if not exists public.tenant_domains (
  tenant_id int not null references public.tenants (tenant_id) on delete cascade,
  domain_value extensions.citext not null check (char_length(domain_value) between 3 and 253),
  domain_verified_at timestamptz,
  domain_created_at timestamptz not null default current_timestamp,
  domain_updated_at timestamptz not null default current_timestamp,
  primary key (tenant_id, domain_value),
  unique (domain_value)
);

drop trigger if exists handle_tenant_domains_updated_at on public.tenant_domains;
create trigger handle_tenant_domains_updated_at
  before update on public.tenant_domains
  for each row execute procedure extensions.moddatetime(domain_updated_at);

alter table public.tenant_domains enable row level security;

revoke all on table public.tenant_domains from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, insert, update, delete on table public.tenant_domains to anon, authenticated;

drop policy if exists "tenant_domains select by members" on public.tenant_domains;
create policy "tenant_domains select by members"
  on public.tenant_domains for select to authenticated
  using (tenant_id in (select public.viewer_tenant_ids()));

drop policy if exists "tenant_domains write by owner" on public.tenant_domains;
drop policy if exists "tenant_domains write with organization_manage" on public.tenant_domains;
create policy "tenant_domains write with organization_manage"
  on public.tenant_domains for all to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.tenant_id = public.tenant_domains.tenant_id
        and o.organization_id in (select public.viewer_permission_org_ids('organization_manage'))
    )
  );

-- supabase_auth_admin needs read access if we later inject custom_domain into JWT claims.
grant select on table public.tenant_domains to supabase_auth_admin;

drop policy if exists "Allow auth admin to read tenant_domains." on public.tenant_domains;
create policy "Allow auth admin to read tenant_domains."
  on public.tenant_domains as permissive for select to supabase_auth_admin using (true);

-- ============================================================
-- tenant_sso_providers — SAML 2.0 SSO provider per tenant
-- ============================================================

create table if not exists public.tenant_sso_providers (
  tenant_id int not null references public.tenants (tenant_id) on delete cascade,
  sso_provider_id text not null, -- UUID assigned by Supabase GoTrue on creation
  sso_provider_label text not null default '',
  sso_provider_domains text[] not null default '{}',
  sso_provider_enabled bool not null default true,
  sso_provider_created_at timestamptz not null default current_timestamp,
  sso_provider_updated_at timestamptz not null default current_timestamp,
  primary key (tenant_id, sso_provider_id)
);

drop trigger if exists handle_tenant_sso_providers_updated_at on public.tenant_sso_providers;
create trigger handle_tenant_sso_providers_updated_at
  before update on public.tenant_sso_providers
  for each row execute procedure extensions.moddatetime(sso_provider_updated_at);

alter table public.tenant_sso_providers enable row level security;

revoke all on table public.tenant_sso_providers from anon, authenticated;
-- Reads via RLS; writes go through service-role server actions only. RLS has no insert/delete
-- policy, so anon/authenticated are blocked from writes; the grants below only expose the ops to
-- pg_graphql (which introspects as anon). service_role bypasses RLS for the actual writes.
grant select, insert, delete on table public.tenant_sso_providers to anon, authenticated;
grant select, insert, delete on table public.tenant_sso_providers to service_role;

drop policy if exists "tenant_sso_providers select by members" on public.tenant_sso_providers;
create policy "tenant_sso_providers select by members"
  on public.tenant_sso_providers for select to authenticated
  using (tenant_id in (select public.viewer_tenant_ids()));

-- ============================================================
-- email_domain_has_sso — anon-accessible SSO domain lookup for login flow
-- ============================================================

create or replace function public.email_domain_has_sso(email_input text)
  returns text
  language sql
  stable
  security definer
  set search_path to ''
  as $$
    select ssp.sso_provider_id
    from public.tenant_sso_providers ssp
    where ssp.sso_provider_enabled = true
      and lower(split_part(email_input, '@', 2)) = any(ssp.sso_provider_domains)
    limit 1;
  $$;

grant execute on function public.email_domain_has_sso(text) to anon, authenticated;

-- ============================================================
-- organization_memberships — viewer-facing RPCs (pending / accept / reject)
-- ============================================================
-- The legacy `public.invitations` table was folded into `public.organization_memberships` so a single
-- row models the full lifecycle (pending → accepted/rejected/revoked). These helpers
-- expose the invitee side of that lifecycle: list invites that match the viewer, and
-- mutate the row when the viewer accepts or declines.

-- Returns organization_memberships in PENDING state where the viewer's identity (email / phone in
-- auth.users, or any profile_identities row) matches the invite identifier. Uses
-- SECURITY DEFINER so we can read auth.users + bypass the row-level filter on
-- organization_memberships that hides un-claimed invites from non-admins.
create or replace function public.viewer_organization_membership_pending_collection()
  returns setof public.organization_memberships
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _user_id uuid := public.viewer_profile_id();
      _email extensions.citext;
      _phone text;
    begin
      if _user_id is null then
        return;
      end if;
      select lower(u.email)::extensions.citext, nullif('+' || u.phone, '+')
        into _email, _phone
        from auth.users u
        where u.id = _user_id;

      return query
        select m.*
        from public.organization_memberships m
        where m.profile_id is null
          and m.organization_membership_accepted_at is null
          and m.organization_membership_rejected_at is null
          and m.organization_membership_revoked_at is null
          and (m.organization_membership_invite_expires_at is null or m.organization_membership_invite_expires_at > current_timestamp)
          and (
            (_email is not null and m.organization_membership_invite_email = _email)
            or (_phone is not null and m.organization_membership_invite_phone = _phone)
            or exists (
              select 1
                from public.profile_identities pi
                where pi.profile_id = _user_id
                  and pi.profile_identity_deleted_at is null
                  and pi.address_level0_id = m.organization_membership_invite_address_level0_id
                  and pi.profile_identity_document_kind = m.organization_membership_invite_document_kind
                  and pi.profile_identity_document_value = m.organization_membership_invite_document_value
            )
          );
    end;
  $$;

grant execute on function public.viewer_organization_membership_pending_collection() to authenticated;

-- Accept an invite. Sets profile_id to the calling viewer and stamps accepted_at.
-- Validates that the organization_membership is genuinely pending AND that the caller matches the
-- invite identifier (via viewer_organization_membership_pending_collection). SECURITY DEFINER so it can write
-- through the RLS policy (the policy gates writes on members_manage, which the
-- invitee does NOT have yet).
create or replace function public.viewer_organization_membership_accept(organization_membership_id int)
  returns public.organization_memberships
  language plpgsql
  security definer
  set search_path to ''
  as $$
    declare
      _user_id uuid := public.viewer_profile_id();
      _row public.organization_memberships;
    begin
      if _user_id is null then
        raise exception 'not authenticated';
      elsif not exists (
        select 1 from public.viewer_organization_membership_pending_collection() vmp
        where vmp.organization_membership_id = viewer_organization_membership_accept.organization_membership_id
      ) then
        raise exception 'invitation not found or does not match your account';
      end if;
      update public.organization_memberships
        set profile_id = _user_id,
            organization_membership_accepted_at = current_timestamp,
            -- Burn the token; the row is now claimed.
            organization_membership_invite_token = null
        where public.organization_memberships.organization_membership_id = viewer_organization_membership_accept.organization_membership_id
        returning * into _row;
      return _row;
    end;
  $$;

grant execute on function public.viewer_organization_membership_accept(int) to authenticated;

-- Reject an invite. Stamps rejected_at; profile_id stays null. Same matching guard
-- as accept.
create or replace function public.viewer_organization_membership_reject(organization_membership_id int)
  returns public.organization_memberships
  language plpgsql
  security definer
  set search_path to ''
  as $$
    declare
      _row public.organization_memberships;
    begin
      if public.viewer_profile_id() is null then
        raise exception 'not authenticated';
      elsif not exists (
        select 1 from public.viewer_organization_membership_pending_collection() vmp
        where vmp.organization_membership_id = viewer_organization_membership_reject.organization_membership_id
      ) then
        raise exception 'invitation not found or does not match your account';
      end if;
      update public.organization_memberships
        set organization_membership_rejected_at = current_timestamp,
            organization_membership_invite_token = null
        where public.organization_memberships.organization_membership_id = viewer_organization_membership_reject.organization_membership_id
        returning * into _row;
      return _row;
    end;
  $$;

grant execute on function public.viewer_organization_membership_reject(int) to authenticated;

-- Atomically REPLACE a member's permission set with the given slugs (preset apply / MCP).
-- Gated by `members_manage` on the membership's org. Grants are added before removals so
-- swapping one admin slug for another doesn't trip the last-admin trigger mid-operation;
-- clearing the last admin's grants is still blocked by that trigger. Returns the final set.
-- NOTE: The authoritative definition (returning setof permission_grants) is later in this file,
-- after the permission_grants table is created. This stub is kept for forward-reference ordering.
create or replace function public.viewer_organization_membership_set_permissions_collection(
  organization_membership_id int,
  permission_ids extensions.citext[]
)
  returns setof public.organization_membership_permissions
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _organization_id int;
    begin
      select m.organization_id into _organization_id
        from public.organization_memberships m
        where m.organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id;

      if _organization_id is null then
        raise exception 'membership_not_found' using errcode = 'P0001';
      elsif not public.viewer_has_permission(_organization_id, 'members_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;

      -- Every requested slug must exist in the catalog.
      if exists (
        select 1 from unnest(viewer_organization_membership_set_permissions_collection.permission_ids) as s(permission_id)
        where not exists (select 1 from public.permissions p where p.permission_id = s.permission_id)
      ) then
        raise exception 'invalid_permission' using errcode = 'P0001';
      end if;

      -- Add the desired grants that aren't already present (NOT EXISTS rather than ON CONFLICT,
      -- whose conflict-target column would collide with the organization_membership_id param).
      insert into public.organization_membership_permissions (organization_membership_id, permission_id)
        select viewer_organization_membership_set_permissions_collection.organization_membership_id, s.permission_id
        from unnest(viewer_organization_membership_set_permissions_collection.permission_ids) as s(permission_id)
        where not exists (
          select 1 from public.organization_membership_permissions existing
          where existing.organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id
            and existing.permission_id = s.permission_id
        );

      delete from public.organization_membership_permissions mp
        where mp.organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id
          and mp.permission_id <> all (viewer_organization_membership_set_permissions_collection.permission_ids);

      return query
        select mp.*
        from public.organization_membership_permissions mp
        where mp.organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id;
    end;
  $$;

grant execute on function public.viewer_organization_membership_set_permissions_collection(int, extensions.citext[]) to authenticated;

-- Anonymous lookup: given a (country, kind, value), normalize the value and return
-- the pending organization_memberships that match. Used in /auth/document BEFORE the visitor has
-- a session — they're trying to discover their own invites. Returns tenant + org names
-- alongside each row so the picker UI can render without an extra round-trip.
--
-- SECURITY DEFINER + grant to anon so the function can read past RLS on organization_memberships
-- (otherwise anon would see nothing). Safe because the function projects only the
-- public-safe columns and matches on a value the visitor already provided.
create or replace function public.organization_memberships_pending_by_document(
  country text,
  kind public.profile_identity_document_kind,
  value text
)
  returns table (
    organization_membership_id int,
    organization_id int,
    organization_name text,
    tenant_id int,
    tenant_slug text,
    tenant_name text,
    organization_membership_invite_token text,
    organization_membership_invite_expires_at timestamptz
  )
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      _normalized := internal.profile_identity_value_normalize(country, kind, value);
      if _normalized is null then
        return;
      end if;
      return query
        select
          m.organization_membership_id,
          m.organization_id,
          o.organization_name,
          o.tenant_id,
          t.tenant_slug::text,
          t.tenant_name,
          m.organization_membership_invite_token,
          m.organization_membership_invite_expires_at
        from public.organization_memberships m
        join public.organizations o on o.organization_id = m.organization_id
        join public.tenants t on t.tenant_id = o.tenant_id
        where m.profile_id is null
          and m.organization_membership_accepted_at is null
          and m.organization_membership_rejected_at is null
          and m.organization_membership_revoked_at is null
          and (m.organization_membership_invite_expires_at is null or m.organization_membership_invite_expires_at > current_timestamp)
          and m.organization_membership_invite_address_level0_id = country
          and m.organization_membership_invite_document_kind = kind
          and m.organization_membership_invite_document_value = _normalized;
    end;
  $$;

grant execute on function public.organization_memberships_pending_by_document(text, public.profile_identity_document_kind, text) to anon, authenticated;

-- ============================================================
-- users_handle_created — re-definition with identity-aware behavior
-- ============================================================
-- Re-defined here (after public.profile_identities exists) so that signups carrying
-- an optional document triplet in raw_user_meta_data (`profile_identity: {country,
-- kind, value}`) prepopulate public.profile_identities together with the profile row.
-- The profile_identities normalize trigger runs after this and validates the triplet.
-- If invalid, the auth.users INSERT aborts — so signup actions MUST validate the
-- triplet client-side before calling signUp/signInWithOtp.
--
-- Adds `set search_path to ''` which the original definition (~line 229) was missing.

create or replace function public.users_handle_created()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
  as $$
    begin
      insert into public.profiles (profile_id, profile_name_full)
        values (new.id, new.raw_user_meta_data->>'full_name')
        on conflict (profile_id) do nothing;

      if new.raw_user_meta_data ? 'profile_identity'
         and new.raw_user_meta_data->'profile_identity' ? 'country'
         and new.raw_user_meta_data->'profile_identity' ? 'kind'
         and new.raw_user_meta_data->'profile_identity' ? 'value'
      then
        insert into public.profile_identities (
          profile_id,
          address_level0_id,
          profile_identity_document_kind,
          profile_identity_document_value
        ) values (
          new.id,
          new.raw_user_meta_data->'profile_identity'->>'country',
          (new.raw_user_meta_data->'profile_identity'->>'kind')::public.profile_identity_document_kind,
          new.raw_user_meta_data->'profile_identity'->>'value'
        )
        on conflict (profile_id, address_level0_id, profile_identity_document_kind) do nothing;
      end if;
      return new;
    end;
  $$;

-- ============================================================
-- storage.objects RLS — convention-based policies
-- ============================================================
-- Convention enforced here:
--   path_tokens[1] === row PK of the matching table
--   path_tokens[2] === 'avatar' (the only allowed subfolder today)
-- Adding a new subfolder (e.g. `banner`) requires an explicit policy edit.
-- `path_tokens` is a stored generated column, so indexing into it is a plain
-- array read — no per-row function call.
-- Buckets are public, so the `/object/public/...` CDN endpoint bypasses RLS;
-- `list()` and writes still pass through these policies.

drop policy if exists "public buckets: read avatars" on storage.objects;
create policy "public buckets: read avatars"
  on storage.objects for select
  to authenticated, anon
  using (
    bucket_id in ('profiles', 'organizations', 'tenants', 'agencies')
    and path_tokens[2] = 'avatar'
  );

drop policy if exists "profiles bucket: own avatar" on storage.objects;
create policy "profiles bucket: own avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'profiles'
    and path_tokens[1] = (select auth.uid())::text
    and path_tokens[2] = 'avatar'
  )
  with check (
    bucket_id = 'profiles'
    and path_tokens[1] = (select auth.uid())::text
    and path_tokens[2] = 'avatar'
  );

-- Regex-guards the cast so a malformed path can't raise SQLSTATE 22P02 inside the policy.
drop policy if exists "organizations bucket: organization_manage avatar" on storage.objects;
create policy "organizations bucket: organization_manage avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'organizations'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_org_ids('organization_manage'))
  )
  with check (
    bucket_id = 'organizations'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_org_ids('organization_manage'))
  );

drop policy if exists "tenants bucket: tenant_manage avatar" on storage.objects;
create policy "tenants bucket: tenant_manage avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'tenants'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_tenant_ids('tenant_manage'))
  )
  with check (
    bucket_id = 'tenants'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_tenant_ids('tenant_manage'))
  );

-- Agency PK is an int, so guard the cast with a numeric regex before it (avoids 22P02).
-- Any accepted agency member may manage the agency logo (agencies have no granular catalog).
drop policy if exists "agencies bucket: member avatar" on storage.objects;
create policy "agencies bucket: member avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'agencies'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_agency_ids())
  )
  with check (
    bucket_id = 'agencies'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_agency_ids())
  );

-- ============================================================
-- GraphQL views over storage.objects
-- ============================================================
-- One view per bucket. pg_graphql picks up the `@graphql.foreign_keys` comment so
-- a profile/organization exposes its files as a relation. Views run with
-- `security_invoker = on` so storage.objects RLS is the single source of truth —
-- whichever folders RLS allows (today only `avatar/`) flow through automatically.
-- Regex guards in the WHERE keep malformed rows from blowing up the view at SELECT
-- time (the cast would otherwise raise 22P02).

create or replace view public.storage_profiles
  with (security_invoker = on) as
  select
    obj.id                                       as storage_profile_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::uuid                     as profile_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    -- Relative URL — prefix with SUPABASE_URL client-side (or use the storage SDK).
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'profiles'
    and internal.is_uuid(obj.path_tokens[1]);

grant select on public.storage_profiles to authenticated, anon, service_role;

-- pg_graphql foreign_keys naming is counterintuitive: `local_name` is the field name on
-- the PARENT type (here `profiles`) returning a collection back; `foreign_name` is the
-- field name on this view (`storage_profiles`) returning the single parent row.
comment on view public.storage_profiles is e'@graphql({"primary_key_columns": ["storage_profile_id"], "foreign_keys": [{"local_name": "storage_profiles", "local_columns": ["profile_id"], "foreign_name": "profile", "foreign_schema": "public", "foreign_table": "profiles", "foreign_columns": ["profile_id"]}]})';

-- Computed relationship: exposes the viewer's latest avatar as a single object on Profile,
-- replacing the verbose storage_profiles collection query with a simple `profileAvatar { src }`.
create or replace function public.profile_storage_avatar(this public.profiles)
  returns setof public.storage_profiles rows 1
  stable
  strict
  security invoker
  parallel safe
  language sql
  set search_path to ''
as $$
  select *
  from public.storage_profiles
  where profile_id = this.profile_id
    and folder = 'avatar'
  order by created_at desc
  limit 1;
$$;

grant execute on function public.profile_storage_avatar(public.profiles) to anon, authenticated;

create or replace view public.storage_organizations
  with (security_invoker = on) as
  select
    obj.id                                       as storage_organization_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::int                      as organization_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'organizations'
    and obj.path_tokens[1] ~ '^[0-9]+$';

grant select on public.storage_organizations to authenticated, anon, service_role;

comment on view public.storage_organizations is e'@graphql({"primary_key_columns": ["storage_organization_id"], "foreign_keys": [{"local_name": "storage_organizations", "local_columns": ["organization_id"], "foreign_name": "organization", "foreign_schema": "public", "foreign_table": "organizations", "foreign_columns": ["organization_id"]}]})';

create or replace view public.storage_tenants
  with (security_invoker = on) as
  select
    obj.id                                       as storage_tenant_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::int                      as tenant_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'tenants'
    and obj.path_tokens[1] ~ '^[0-9]+$';

grant select on public.storage_tenants to authenticated, anon, service_role;

comment on view public.storage_tenants is e'@graphql({"primary_key_columns": ["storage_tenant_id"], "foreign_keys": [{"local_name": "storage_tenants", "local_columns": ["tenant_id"], "foreign_name": "tenant", "foreign_schema": "public", "foreign_table": "tenants", "foreign_columns": ["tenant_id"]}]})';

create or replace view public.storage_agencies
  with (security_invoker = on) as
  select
    obj.id                                       as storage_agency_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::int                      as agency_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'agencies'
    and obj.path_tokens[1] ~ '^[0-9]+$';

grant select on public.storage_agencies to authenticated, anon, service_role;

comment on view public.storage_agencies is e'@graphql({"primary_key_columns": ["storage_agency_id"], "foreign_keys": [{"local_name": "storage_agencies", "local_columns": ["agency_id"], "foreign_name": "agency", "foreign_schema": "public", "foreign_table": "agencies", "foreign_columns": ["agency_id"]}]})';

-- Sessions: list and revoke the viewer's own auth sessions.
-- Uses security definer to read auth.sessions (not exposed to anon/authenticated).

drop function if exists public.viewer_sessions_collection();

create or replace function public.viewer_sessions_collection()
  returns setof public.user_sessions
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select
      s.id,
      s.user_id,
      s.user_agent,
      s.ip,
      s.created_at,
      s.refreshed_at,
      s.not_after
    from public.user_sessions s
    where s.user_id = auth.uid()
    order by coalesce(s.refreshed_at, s.created_at) desc nulls last;
  $$;

create or replace function public.revoke_session(session_id uuid)
  returns void
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    delete from auth.sessions
    where id = revoke_session.session_id
      and user_id = auth.uid();
  $$;

-- ============================================================
-- Tenant / organization / agency creation
-- ============================================================
-- protected.* owns each transactional workflow. Public viewer wrappers only
-- derive the current profile from the JWT and delegate to that implementation.

create or replace function protected.tenant_create(
  profile_id   uuid,
  tenant_slug  text,
  tenant_name  text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant                      public.tenants;
      _organization_id            int;
      _organization_membership_id int;
    begin
      insert into public.tenants (tenant_slug, tenant_name)
        values (
          $2::extensions.citext,
          $3
        )
        returning * into _tenant;

      insert into public.organizations (tenant_id, organization_slug, organization_name)
        values (
          _tenant.tenant_id,
          $2::extensions.citext,
          $3
        )
        returning organization_id into _organization_id;

      insert into public.organization_memberships (
        organization_id,
        profile_id,
        organization_membership_accepted_at
      )
        values (_organization_id, $1, current_timestamp)
        returning organization_membership_id into _organization_membership_id;

      -- Founder gets the org wildcard plus an explicit tenant_manage grant on the espejo org, so
      -- tenant-level authority (viewer_permission_tenant_ids) is real and grantable, not only a
      -- side effect of holding '*'.
      insert into public.organization_membership_permissions (organization_membership_id, permission_id)
        values
          (_organization_membership_id, '*'),
          (_organization_membership_id, 'tenant_manage');

      -- Dual-write: also populate the new permission_grants model (coexistence).
      -- Legacy insert above is KEPT until Phase E teardown.
      insert into public.permission_grants (subject_organization_membership_id, permission_id)
        values
          (_organization_membership_id, '*'),
          (_organization_membership_id, 'tenant_manage');

      return next _tenant;
    end;
  $$;

revoke execute on function protected.tenant_create(uuid, text, text) from public;
grant execute on function protected.tenant_create(uuid, text, text) to service_role;

create or replace function public.viewer_tenant_create(
  tenant_slug  text,
  tenant_name  text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select t.*
    from protected.tenant_create(
      public.viewer_profile_id(true),
      $1,
      $2
    ) t;
  $$;

revoke execute on function public.viewer_tenant_create(text, text) from public;
grant execute on function public.viewer_tenant_create(text, text) to anon, authenticated;

-- Rename a tenant. Exposed as a pg_graphql Mutation (setof rows 1, volatile) so client
-- components can call it via useGraphyMutation instead of a pass-through Server Action.
-- Gated by tenant_manage; the tenant_name length check on the column enforces 1..256.
create or replace function public.viewer_tenant_update(
  tenant_id    int,
  tenant_name  text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant public.tenants;
    begin
      if not public.viewer_has_tenant_permission($1, 'tenant_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;

      update public.tenants
        set tenant_name = $2,
            tenant_updated_at = current_timestamp
        where public.tenants.tenant_id = $1
        returning * into _tenant;

      return next _tenant;
    end;
  $$;

-- Tenant onboarding finish. Requires tenant_manage on the tenant. Stamps tenant_onboarded_at so
-- the soft banner stops. Steps (logo, first member) are derivable — computed at read time from
-- storage/memberships, never written.
create or replace function public.viewer_tenant_onboarding_finish(tenant_id int)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant public.tenants;
    begin
      if not public.viewer_has_tenant_permission($1, 'tenant_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;

      update public.tenants
        set tenant_onboarded_at = current_timestamp,
            tenant_updated_at = current_timestamp
        where public.tenants.tenant_id = $1
        returning * into _tenant;

      return next _tenant;
    end;
  $$;

create or replace function protected.organization_create(
  profile_id         uuid,
  tenant_id          int,
  organization_slug  text,
  organization_name  text
)
  returns setof public.organizations rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _organization                public.organizations;
      _organization_membership_id  int;
    begin
      if not exists (
        select 1
        from public.organization_memberships m
        join public.organizations o using (organization_id)
        join public.organization_membership_permissions p using (organization_membership_id)
        where o.tenant_id = $2
          and m.profile_id = $1
          and m.organization_membership_accepted_at is not null
          and m.organization_membership_revoked_at is null
          and m.organization_membership_rejected_at is null
          and p.permission_id in ('organization_manage', '*')
      ) then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;

      insert into public.organizations (tenant_id, organization_slug, organization_name)
        values (
          $2,
          $3::extensions.citext,
          $4
        )
        returning * into _organization;

      insert into public.organization_memberships (
        organization_id,
        profile_id,
        organization_membership_accepted_at
      )
        values (_organization.organization_id, $1, current_timestamp)
        returning organization_membership_id into _organization_membership_id;

      insert into public.organization_membership_permissions (organization_membership_id, permission_id)
        values (_organization_membership_id, '*');

      return next _organization;
    end;
  $$;

revoke execute on function protected.organization_create(uuid, int, text, text) from public;
grant execute on function protected.organization_create(uuid, int, text, text) to service_role;

create or replace function public.viewer_organization_create(
  tenant_id          int,
  organization_slug  text,
  organization_name  text
)
  returns setof public.organizations rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select o.*
    from protected.organization_create(
      public.viewer_profile_id(true),
      $1,
      $2,
      $3
    ) o;
  $$;

revoke execute on function public.viewer_organization_create(int, text, text) from public;
grant execute on function public.viewer_organization_create(int, text, text) to anon, authenticated;

create or replace function protected.agency_create(
  profile_id   uuid,
  agency_name  text,
  agency_slug  text
)
  returns setof public.agencies rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _agency                 public.agencies;
      _agency_membership_id   int;
    begin
      begin
        insert into public.agencies (agency_name, agency_slug)
          values (
            $2,
            $3::extensions.citext
          )
          returning * into _agency;
      exception
        when unique_violation then
          raise exception 'slug_taken' using errcode = 'P0001';
      end;

      insert into public.agency_memberships (
        agency_id,
        profile_id,
        agency_membership_accepted_at
      )
        values (_agency.agency_id, $1, current_timestamp)
        returning agency_membership_id into _agency_membership_id;

      -- Founder gets the wildcard so they can manage the agency team from day one.
      insert into public.agency_membership_permissions (agency_membership_id, permission_id)
        values (_agency_membership_id, '*');

      return next _agency;
    end;
  $$;

revoke execute on function protected.agency_create(uuid, text, text) from public;
grant execute on function protected.agency_create(uuid, text, text) to service_role;

create or replace function public.viewer_agency_create(
  agency_name  text,
  agency_slug  text
)
  returns setof public.agencies rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select a.*
    from protected.agency_create(
      public.viewer_profile_id(true),
      $1,
      $2
    ) a;
  $$;

revoke execute on function public.viewer_agency_create(text, text) from public;
grant execute on function public.viewer_agency_create(text, text) to anon, authenticated;

-- ============================================================
-- agency_memberships — mutation RPCs
-- ============================================================
-- Errors use SQLSTATE P0001 with a stable, locale-key message so callers
-- can match the key without parsing prose.

-- All three are viewer-scoped: the caller is resolved from the JWT via the agency
-- team-permission helpers, so they run under the caller's own RLS context (callable
-- from the public SDK and from MCP). They return `setof agency_memberships rows 1`
-- so pg_graphql exposes them as singular Mutation objects.

-- Drop the superseded caller_id/service-role variants.
drop function if exists public.agency_membership_invite(int, uuid, uuid);
drop function if exists public.agency_membership_update(int, int, text, uuid);
drop function if exists public.agency_membership_respond(int, text);

-- Invite an EXISTING registered user (by email) into the agency as a pending affiliate.
-- Gated by `agency_members_manage`; resolves the profile from auth.users internally
-- (SECURITY DEFINER) and raises `user_not_found` when the email isn't registered —
-- creating a brand-new auth user + sending email is a server-only side effect that
-- stays in the web action (GoTrue can't run under RLS). The web action ensures the
-- user exists first, then calls this; MCP calls it directly.
create or replace function public.viewer_agency_membership_invite_by_email(
  agency_id int,
  email     text
)
  returns setof public.agency_memberships rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _profile_id uuid;
      _row        public.agency_memberships;
    begin
      if not public.viewer_has_agency_team_permission(
           viewer_agency_membership_invite_by_email.agency_id, 'agency_members_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;

      if not exists (
        select 1 from public.agencies a
        where a.agency_id = viewer_agency_membership_invite_by_email.agency_id
      ) then
        raise exception 'agency_not_found' using errcode = 'P0001';
      end if;

      select u.id into _profile_id
        from auth.users u
        where lower(u.email) = lower(viewer_agency_membership_invite_by_email.email)
        limit 1;

      if _profile_id is null then
        raise exception 'user_not_found' using errcode = 'P0001';
      end if;

      -- Already an active member (not revoked/rejected)?
      if exists (
        select 1 from public.agency_memberships af
        where af.agency_id = viewer_agency_membership_invite_by_email.agency_id
          and af.profile_id = _profile_id
          and af.agency_membership_accepted_at is not null
          and af.agency_membership_revoked_at is null
          and af.agency_membership_rejected_at is null
      ) then
        raise exception 'already_member' using errcode = 'P0001';
      end if;

      -- Reset any prior (pending/revoked/rejected) row to a fresh pending invite; else insert.
      -- Not ON CONFLICT because the conflict-target column would collide with the agency_id param.
      -- ponytail: tiny update-then-insert race; the unique (agency_id, profile_id) constraint backstops it.
      update public.agency_memberships
        set agency_membership_accepted_at = null,
            agency_membership_revoked_at  = null,
            agency_membership_rejected_at = null
        where public.agency_memberships.agency_id = viewer_agency_membership_invite_by_email.agency_id
          and public.agency_memberships.profile_id = _profile_id
        returning * into _row;

      if not found then
        insert into public.agency_memberships (agency_id, profile_id)
          values (viewer_agency_membership_invite_by_email.agency_id, _profile_id)
          returning * into _row;
      end if;

      return next _row;
    end;
  $$;

grant execute on function public.viewer_agency_membership_invite_by_email(int, text) to authenticated;

-- Revoke or reactivate another affiliate's membership. Gated by `agency_members_manage`;
-- derives the agency from the membership row. Revoke is blocked if it would strip the
-- agency's last active team admin.
create or replace function public.viewer_agency_membership_update(
  agency_membership_id int,
  operation            text  -- 'revoke' | 'reactivate'
)
  returns setof public.agency_memberships rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _agency_id int;
      _row       public.agency_memberships;
    begin
      if viewer_agency_membership_update.operation not in ('revoke', 'reactivate') then
        raise exception 'invalid_operation' using errcode = 'P0001';
      end if;

      select m.agency_id into _agency_id
        from public.agency_memberships m
        where m.agency_membership_id = viewer_agency_membership_update.agency_membership_id;

      if _agency_id is null then
        raise exception 'membership_not_found' using errcode = 'P0001';
      end if;

      if not public.viewer_has_agency_team_permission(_agency_id, 'agency_members_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;

      if viewer_agency_membership_update.operation = 'revoke' then
        if not public.agency_has_other_active_admin(_agency_id, viewer_agency_membership_update.agency_membership_id) then
          raise exception 'last_admin_protected' using errcode = 'P0001';
        end if;
        update public.agency_memberships
          set agency_membership_revoked_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_update.agency_membership_id
          returning * into _row;
      else
        update public.agency_memberships
          set agency_membership_revoked_at  = null,
              agency_membership_rejected_at = null,
              agency_membership_accepted_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_update.agency_membership_id
          returning * into _row;
      end if;

      return next _row;
    end;
  $$;

grant execute on function public.viewer_agency_membership_update(int, text) to authenticated;

-- Respond to your own pending invitation (accept/reject). The caller must own the row.
create or replace function public.viewer_agency_membership_respond(
  agency_membership_id int,
  response             text  -- 'accept' | 'reject'
)
  returns setof public.agency_memberships rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _row       public.agency_memberships;
    begin
      if viewer_agency_membership_respond.response not in ('accept', 'reject') then
        raise exception 'invalid_response' using errcode = 'P0001';
      elsif _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;

      select m.* into _row
        from public.agency_memberships m
        where m.agency_membership_id = viewer_agency_membership_respond.agency_membership_id
          and m.profile_id = _caller_id;

      if not found then
        raise exception 'invitation_not_found' using errcode = 'P0001';
      elsif _row.agency_membership_revoked_at is not null
         or _row.agency_membership_accepted_at is not null
         or _row.agency_membership_rejected_at is not null
      then
        raise exception 'invitation_not_pending' using errcode = 'P0001';
      end if;

      if viewer_agency_membership_respond.response = 'accept' then
        update public.agency_memberships
          set agency_membership_accepted_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_respond.agency_membership_id
          returning * into _row;
      else
        update public.agency_memberships
          set agency_membership_rejected_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_respond.agency_membership_id
          returning * into _row;
      end if;

      return next _row;
    end;
  $$;

grant execute on function public.viewer_agency_membership_respond(int, text) to authenticated;

-- ============================================================
-- conversations + messaging
-- ============================================================
-- Every notification is a `conversation`.
-- Messages in the thread are `conversation_messages`.
-- Outbound delivery attempts are tracked in `conversation_message_deliveries`.
-- Per-profile channel preferences live in `profile_topic_channels`.
-- Contact addresses (email, phone, push endpoint) in `profile_contacts` /
-- `profile_push_subscriptions`.

-- ============================================================
-- Enums
-- ============================================================

do $$ begin
  create type public.message_channel as enum ('in_app', 'email', 'web_push', 'whatsapp', 'sms');
exception when duplicate_object then null; end $$;

-- ============================================================
-- conversations
-- ============================================================

create table if not exists public.conversations (
  conversation_id   uuid primary key default internal.uuid_generate_v7(),
  profile_id        uuid not null references public.profiles (profile_id) on delete cascade,
  tenant_id         int  references public.tenants (tenant_id) on delete cascade,
  organization_id   int  references public.organizations (organization_id) on delete cascade,
  agency_id         int  references public.agencies (agency_id) on delete cascade,
  conversation_subject text check (char_length(conversation_subject) <= 200),
  conversation_kind   text not null default 'notification'
                        check (conversation_kind in ('notification', 'agent', 'support', 'system')),
  conversation_status text not null default 'open'
                        check (conversation_status in ('open', 'resolved', 'archived')),
  conversation_last_message_at  timestamptz not null default current_timestamp,
  conversation_created_at timestamptz not null default current_timestamp,
  conversation_updated_at timestamptz not null default current_timestamp
);

create index if not exists conversations_inbox_idx
  on public.conversations (profile_id, conversation_last_message_at desc)
  where conversation_status <> 'archived';

create index if not exists conversations_org_idx
  on public.conversations (organization_id)
  where organization_id is not null;

drop trigger if exists handle_conversations_updated_at on public.conversations;
create trigger handle_conversations_updated_at
  before update on public.conversations
  for each row execute procedure extensions.moddatetime(conversation_updated_at);

-- ============================================================
-- conversation_messages
-- ============================================================

create table if not exists public.conversation_messages (
  conversation_message_id uuid primary key default internal.uuid_generate_v7(),
  conversation_id   uuid not null references public.conversations (conversation_id) on delete cascade,
  message_author    text not null check (message_author in ('system', 'agent', 'user')),
  message_direction text not null check (message_direction in ('outbound', 'inbound')),
  conversation_topic_slug extensions.citext references public.conversation_topics (conversation_topic_slug) on delete restrict,
  message_channel   public.message_channel,
  message_body      text,
  message_payload   jsonb not null default '{}',
  message_priority  public.notification_priority,
  message_read_at   timestamptz,
  message_created_at timestamptz not null default current_timestamp
);

create index if not exists conversation_messages_thread_idx
  on public.conversation_messages (conversation_id, message_created_at);

create index if not exists conversation_messages_unread_idx
  on public.conversation_messages (conversation_id)
  where message_read_at is null and message_direction = 'outbound';

-- Trigger: bump conversation_last_message_at + update conversation_status on new message
create or replace function internal.conversation_messages_bump_last_message()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    begin
      -- Use greatest(new_ts, clock_timestamp()) so both explicit future timestamps and
      -- same-transaction inserts produce a strictly increasing last_message_at.
      update public.conversations
        set conversation_last_message_at = greatest(conversation_last_message_at, NEW.message_created_at, clock_timestamp())
        where conversation_id = NEW.conversation_id;
      return NEW;
    end;
  $$;

drop trigger if exists conversation_messages_trigger_bump_last_message on public.conversation_messages;
create trigger conversation_messages_trigger_bump_last_message
  after insert on public.conversation_messages
  for each row execute procedure internal.conversation_messages_bump_last_message();

-- ============================================================
-- conversation_message_deliveries
-- ============================================================

create table if not exists public.conversation_message_deliveries (
  conversation_message_delivery_id uuid primary key default internal.uuid_generate_v7(),
  conversation_message_id uuid not null references public.conversation_messages (conversation_message_id) on delete cascade,
  message_channel public.message_channel not null,
  delivery_status text not null default 'queued'
    check (delivery_status in ('queued', 'sent', 'delivered', 'failed', 'skipped')),
  provider_message_id text,
  delivery_error text,
  delivery_created_at timestamptz not null default current_timestamp,
  delivery_sent_at timestamptz,
  unique (conversation_message_id, message_channel)
);

-- ============================================================
-- profile_topic_channels  (per-profile channel preferences)
-- ============================================================

create table if not exists public.profile_topic_channels (
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  conversation_topic_slug extensions.citext not null references public.conversation_topics (conversation_topic_slug) on delete restrict,
  message_channel public.message_channel not null,
  enabled boolean not null default true,
  profile_topic_channel_created_at timestamptz not null default current_timestamp,
  profile_topic_channel_updated_at timestamptz not null default current_timestamp,
  primary key (profile_id, conversation_topic_slug, message_channel)
);

drop trigger if exists handle_profile_topic_channels_updated_at on public.profile_topic_channels;
create trigger handle_profile_topic_channels_updated_at
  before update on public.profile_topic_channels
  for each row execute procedure extensions.moddatetime(profile_topic_channel_updated_at);

-- ============================================================
-- profile_contacts  (per-profile contact addresses for delivery)
-- ============================================================

create table if not exists public.profile_contacts (
  profile_contact_id uuid primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  message_channel public.message_channel not null,
  contact_value extensions.citext not null,
  contact_verified_at timestamptz,
  profile_contact_created_at timestamptz not null default current_timestamp,
  profile_contact_updated_at timestamptz not null default current_timestamp,
  unique (message_channel, contact_value)
);

drop trigger if exists handle_profile_contacts_updated_at on public.profile_contacts;
create trigger handle_profile_contacts_updated_at
  before update on public.profile_contacts
  for each row execute procedure extensions.moddatetime(profile_contact_updated_at);

-- ============================================================
-- profile_push_subscriptions
-- ============================================================

create table if not exists public.profile_push_subscriptions (
  profile_push_subscription_id uuid primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  profile_push_subscription_created_at timestamptz not null default current_timestamp,
  profile_push_subscription_updated_at timestamptz not null default current_timestamp
);

drop trigger if exists handle_profile_push_subscriptions_updated_at on public.profile_push_subscriptions;
create trigger handle_profile_push_subscriptions_updated_at
  before update on public.profile_push_subscriptions
  for each row execute procedure extensions.moddatetime(profile_push_subscription_updated_at);

-- ============================================================
-- RLS: conversations + messages + deliveries
-- ============================================================
-- Owner-only for direct table access; writes go through security-definer RPCs.

alter table public.conversations enable row level security;

revoke all on table public.conversations from anon, authenticated;
-- `anon` grant is for pg_graphql schema visibility only; the select policy below is
-- `to authenticated`, so anon matches no policy and sees zero rows (RLS default-deny).
grant select on table public.conversations to anon, authenticated;
grant select, insert, update, delete on table public.conversations to service_role;

drop policy if exists "conversations select own" on public.conversations;
create policy "conversations select own"
  on public.conversations for select
  to authenticated
  using (profile_id = (select public.viewer_profile_id()));

-- -------

alter table public.conversation_messages enable row level security;

revoke all on table public.conversation_messages from anon, authenticated;
-- `anon` grant is for pg_graphql schema visibility only (exposes the
-- conversationMessagesCollection relationship); RLS below still default-denies anon rows.
grant select on table public.conversation_messages to anon, authenticated;
grant select, insert, update, delete on table public.conversation_messages to service_role;

drop policy if exists "conversation_messages select own" on public.conversation_messages;
create policy "conversation_messages select own"
  on public.conversation_messages for select
  to authenticated
  using (
    conversation_id in (
      select conversation_id from public.conversations
      where profile_id = (select public.viewer_profile_id())
    )
  );

-- Stream inbox updates to the in-app bell via Supabase Realtime. RLS above
-- still applies to the change stream for authenticated clients, so each viewer
-- only receives inserts for their own conversations.
do $$ begin
  alter publication supabase_realtime add table public.conversation_messages;
exception
  when duplicate_object then null;  -- already in the publication
  when undefined_object then null;  -- publication not present (non-Supabase env)
end $$;

-- -------

alter table public.conversation_message_deliveries enable row level security;

revoke all on table public.conversation_message_deliveries from anon, authenticated;
grant select on table public.conversation_message_deliveries to authenticated;
grant select, insert, update, delete on table public.conversation_message_deliveries to service_role;

drop policy if exists "conversation_message_deliveries select own" on public.conversation_message_deliveries;
create policy "conversation_message_deliveries select own"
  on public.conversation_message_deliveries for select
  to authenticated
  using (
    conversation_message_id in (
      select cm.conversation_message_id
      from public.conversation_messages cm
      join public.conversations c using (conversation_id)
      where c.profile_id = (select public.viewer_profile_id())
    )
  );

-- ============================================================
-- RLS: profile_topic_channels, profile_contacts, profile_push_subscriptions
-- ============================================================

alter table public.profile_topic_channels enable row level security;

revoke all on table public.profile_topic_channels from anon, authenticated;
grant select, insert, update, delete on table public.profile_topic_channels to authenticated;
grant select, insert, update, delete on table public.profile_topic_channels to service_role;

drop policy if exists "profile_topic_channels own" on public.profile_topic_channels;
create policy "profile_topic_channels own"
  on public.profile_topic_channels for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));

-- -------

alter table public.profile_contacts enable row level security;

revoke all on table public.profile_contacts from anon, authenticated;
-- `anon` grant is for pg_graphql schema visibility only (introspection runs as anon); RLS below still gates every row to the owner.
grant select, insert, delete on table public.profile_contacts to anon;
grant select, insert, update, delete on table public.profile_contacts to authenticated;
grant select, insert, update, delete on table public.profile_contacts to service_role;

drop policy if exists "profile_contacts own" on public.profile_contacts;
create policy "profile_contacts own"
  on public.profile_contacts for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));

-- -------

alter table public.profile_push_subscriptions enable row level security;

revoke all on table public.profile_push_subscriptions from anon, authenticated;
grant select, insert, update, delete on table public.profile_push_subscriptions to authenticated;
grant select, insert, update, delete on table public.profile_push_subscriptions to service_role;

drop policy if exists "profile_push_subscriptions own" on public.profile_push_subscriptions;
create policy "profile_push_subscriptions own"
  on public.profile_push_subscriptions for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));

-- ============================================================
-- RPCs: conversation_emit, conversation_mark_read, conversation_archive
-- ============================================================

-- conversation_emit: system/agent emits an outbound notification to a profile.
-- Creates (or appends to an existing) conversation, inserts a message row, and
-- inserts queued delivery rows for each enabled channel.
-- Returns the (conversation_id, conversation_message_id) pair.
create or replace function public.conversation_emit(
  recipient_profile_id uuid,
  slug                 extensions.citext,
  body                 text    default null,
  payload              jsonb   default '{}',
  subject              text    default null,
  organization_id      int     default null,
  agency_id            int     default null,
  conversation_id      uuid    default null
)
  returns table (out_conversation_id uuid, out_conversation_message_id uuid)
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant_id          int;
      _conv_id            uuid;
      _msg_id             uuid;
      _topic_priority     public.notification_priority;
      _topic_kind         public.notification_kind;
      _delivery_id        uuid;
      _ch                 public.message_channel;
    begin
      -- Resolve tenant from organization when provided.
      if conversation_emit.organization_id is not null then
        select o.tenant_id into _tenant_id
          from public.organizations o
          where o.organization_id = conversation_emit.organization_id;
      end if;

      -- Look up topic defaults.
      select ct.conversation_topic_priority, ct.conversation_topic_kind
        into _topic_priority, _topic_kind
        from public.conversation_topics ct
        where ct.conversation_topic_slug = conversation_emit.slug
          and ct.conversation_topic_deleted_at is null;

      if not found then
        raise exception 'conversation_topic_not_found' using errcode = 'P0001';
      end if;

      -- Upsert conversation: use provided id to append, else create new.
      if conversation_emit.conversation_id is not null then
        _conv_id := conversation_emit.conversation_id;

        -- Validate conversation belongs to the recipient.
        if not exists (
          select 1 from public.conversations c
          where c.conversation_id = _conv_id
            and c.profile_id = conversation_emit.recipient_profile_id
        ) then
          raise exception 'conversation_not_found' using errcode = 'P0001';
        end if;
      else
        insert into public.conversations (
          profile_id, tenant_id, organization_id, agency_id,
          conversation_subject, conversation_kind
        )
        values (
          conversation_emit.recipient_profile_id, _tenant_id,
          conversation_emit.organization_id, conversation_emit.agency_id,
          conversation_emit.subject, 'notification'
        )
        returning conversations.conversation_id into _conv_id;
      end if;

      -- Insert message.
      insert into public.conversation_messages (
        conversation_id, message_author, message_direction,
        conversation_topic_slug, message_body, message_payload, message_priority
      )
      values (
        _conv_id, 'system', 'outbound',
        conversation_emit.slug, conversation_emit.body,
        coalesce(conversation_emit.payload, '{}'), _topic_priority
      )
      returning conversation_messages.conversation_message_id into _msg_id;

      -- Always insert in_app delivery (not enqueued — inbox is the surface).
      insert into public.conversation_message_deliveries (
        conversation_message_id, message_channel, delivery_status
      )
      values (_msg_id, 'in_app', 'queued')
      on conflict (conversation_message_id, message_channel) do nothing;

      -- Fan out to each external channel that is enabled for this (recipient, topic) and has a
      -- usable destination. Absence of a preference row = enabled by default.
      foreach _ch in array array['email', 'whatsapp', 'sms']::public.message_channel[] loop
        -- Skip if the recipient has explicitly disabled this channel for this topic.
        if exists (
          select 1 from public.profile_topic_channels ptc
          where ptc.profile_id = conversation_emit.recipient_profile_id
            and ptc.conversation_topic_slug = conversation_emit.slug
            and ptc.message_channel = _ch
            and ptc.enabled = false
        ) then
          continue;
        end if;

        -- Skip if no verified contact exists for this channel.
        if not exists (
          select 1 from public.profile_contacts pc
          where pc.profile_id = conversation_emit.recipient_profile_id
            and pc.message_channel = _ch
            and pc.contact_verified_at is not null
        ) then
          continue;
        end if;

        -- Insert delivery row.
        insert into public.conversation_message_deliveries (
          conversation_message_id, message_channel, delivery_status
        )
        values (_msg_id, _ch, 'queued')
        on conflict (conversation_message_id, message_channel) do nothing
        returning conversation_message_delivery_id into _delivery_id;

        -- Enqueue outbound job only when a new row was inserted.
        if _delivery_id is not null then
          perform pgmq.send(
            'conversation_outbound',
            jsonb_build_object(
              'delivery_id', _delivery_id,
              'message_id',  _msg_id,
              'channel',     _ch
            )
          );
        end if;
      end loop;

      -- Fan out web_push if enabled for this (recipient, topic) and a subscription exists.
      if not exists (
        select 1 from public.profile_topic_channels ptc
        where ptc.profile_id = conversation_emit.recipient_profile_id
          and ptc.conversation_topic_slug = conversation_emit.slug
          and ptc.message_channel = 'web_push'
          and ptc.enabled = false
      ) and exists (
        select 1 from public.profile_push_subscriptions pps
        where pps.profile_id = conversation_emit.recipient_profile_id
      ) then
        insert into public.conversation_message_deliveries (
          conversation_message_id, message_channel, delivery_status
        )
        values (_msg_id, 'web_push', 'queued')
        on conflict (conversation_message_id, message_channel) do nothing
        returning conversation_message_delivery_id into _delivery_id;

        if _delivery_id is not null then
          perform pgmq.send(
            'conversation_outbound',
            jsonb_build_object(
              'delivery_id', _delivery_id,
              'message_id',  _msg_id,
              'channel',     'web_push'
            )
          );
        end if;
      end if;

      return query select _conv_id, _msg_id;
    end;
  $$;

grant execute on function public.conversation_emit(uuid, extensions.citext, text, jsonb, text, int, int, uuid) to service_role;

-- conversation_mark_read: mark a set of messages as read (owner only).
create or replace function public.conversation_mark_read(message_ids uuid[])
  returns int
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _count     int;
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;

      update public.conversation_messages cm
        set message_read_at = current_timestamp
        from public.conversations c
        where cm.conversation_id = c.conversation_id
          and c.profile_id = _caller_id
          and cm.conversation_message_id = any(conversation_mark_read.message_ids)
          and cm.message_read_at is null
          and cm.message_direction = 'outbound';

      get diagnostics _count = row_count;
      return _count;
    end;
  $$;

grant execute on function public.conversation_mark_read(uuid[]) to authenticated;

-- conversation_archive: soft-archive a conversation (owner only).
create or replace function public.conversation_archive(p_conversation_id uuid)
  returns void
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;

      update public.conversations
        set conversation_status = 'archived'
        where conversation_id = conversation_archive.p_conversation_id
          and profile_id = _caller_id;

      if not found then
        raise exception 'conversation_not_found' using errcode = 'P0001';
      end if;
    end;
  $$;

grant execute on function public.conversation_archive(uuid) to authenticated;

-- ============================================================
-- RPCs: viewer helpers
-- ============================================================

-- viewer_conversations_collection: list the caller's conversations (excludes archived by default).
-- p_scope filters by conversation scope:
--   'personal'     → organization_id IS NULL AND agency_id IS NULL
--   'organization' → organization_id = p_organization_id
--   'agency'       → agency_id = p_agency_id
--   NULL (default) → no scope filter (legacy: all caller's conversations)
create or replace function public.viewer_conversations_collection(
  include_archived  boolean default false,
  p_organization_id int     default null,
  p_agency_id       int     default null,
  p_scope           text    default null
)
  returns setof public.conversations
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select c.*
    from public.conversations c
    where c.profile_id = (select public.viewer_profile_id())
      and (viewer_conversations_collection.include_archived or c.conversation_status <> 'archived')
      and (
        viewer_conversations_collection.p_scope is null
        or (viewer_conversations_collection.p_scope = 'personal'      and c.organization_id is null and c.agency_id is null)
        or (viewer_conversations_collection.p_scope = 'organization'  and c.organization_id = viewer_conversations_collection.p_organization_id)
        or (viewer_conversations_collection.p_scope = 'agency'        and c.agency_id = viewer_conversations_collection.p_agency_id)
      )
    order by c.conversation_last_message_at desc;
  $$;

grant execute on function public.viewer_conversations_collection(boolean, int, int, text) to authenticated;

-- viewer_conversation_by_id: single conversation owned by caller, by id.
-- `setof ... rows 1` + stable → pg_graphql exposes it as the singular `viewerConversationById`
-- Query object (not a connection). Pair with the conversationMessagesCollection relationship to
-- fetch a conversation + its thread in one round-trip.
create or replace function public.viewer_conversation_by_id(conversation_id uuid)
  returns setof public.conversations rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select c.*
    from public.conversations c
    where c.conversation_id = viewer_conversation_by_id.conversation_id
      and c.profile_id = (select public.viewer_profile_id())
    limit 1;
  $$;

grant execute on function public.viewer_conversation_by_id(uuid) to authenticated;

-- viewer_conversation_messages_collection: thread messages for a conversation owned by caller.
create or replace function public.viewer_conversation_messages_collection(p_conversation_id uuid)
  returns setof public.conversation_messages
  stable
  security definer
  parallel safe
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
    begin
      if _caller_id is null then
        return;
      end if;

      if not exists (
        select 1 from public.conversations c
        where c.conversation_id = viewer_conversation_messages_collection.p_conversation_id
          and c.profile_id = _caller_id
      ) then
        return;
      end if;

      return query
        select cm.*
        from public.conversation_messages cm
        where cm.conversation_id = viewer_conversation_messages_collection.p_conversation_id
        order by cm.message_created_at;
    end;
  $$;

grant execute on function public.viewer_conversation_messages_collection(uuid) to authenticated;

-- viewer_unread_count: count of unread outbound messages across non-archived conversations.
-- p_scope filters by conversation scope:
--   'personal'     → organization_id IS NULL AND agency_id IS NULL
--   'organization' → organization_id = p_organization_id
--   'agency'       → agency_id = p_agency_id
--   NULL (default) → no scope filter (legacy: all caller's conversations)
create or replace function public.viewer_unread_count(
  p_organization_id int  default null,
  p_agency_id       int  default null,
  p_scope           text default null
)
  returns int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select count(*)::int
    from public.conversation_messages cm
    join public.conversations c using (conversation_id)
    where c.profile_id = (select public.viewer_profile_id())
      and c.conversation_status <> 'archived'
      and cm.message_direction = 'outbound'
      and cm.message_read_at is null
      and (
        viewer_unread_count.p_scope is null
        or (viewer_unread_count.p_scope = 'personal'      and c.organization_id is null and c.agency_id is null)
        or (viewer_unread_count.p_scope = 'organization'  and c.organization_id = viewer_unread_count.p_organization_id)
        or (viewer_unread_count.p_scope = 'agency'        and c.agency_id = viewer_unread_count.p_agency_id)
      );
  $$;

grant execute on function public.viewer_unread_count(int, int, text) to authenticated;

-- ============================================================
-- pgmq queue helpers (Agent D — dispatch worker)
-- ============================================================
-- The `pgmq` schema is not exposed through the Data API / PostgREST by default.
-- These SECURITY DEFINER wrappers in `public` make pgmq operations callable via
-- `supabase.rpc()` from the service-role client in the drain route without granting
-- broad access to the pgmq schema.
-- ============================================================

-- Read up to `qty` messages from the conversation_outbound queue with a visibility
-- timeout of `vt` seconds (messages are invisible to other readers until vt elapses).
-- Returns the raw pgmq message rows: (msg_id bigint, read_ct int, enqueued_at, vt, message jsonb).
create or replace function public.conversation_outbound_read(vt int, qty int)
  returns setof pgmq.message_record
  security definer
  language sql
  set search_path to ''
  as $$
    select * from pgmq.read('conversation_outbound', vt, qty);
  $$;

grant execute on function public.conversation_outbound_read(int, int) to service_role;

-- Permanently delete a message from the queue after successful processing.
-- Returns true when the message was found and deleted.
create or replace function public.conversation_outbound_delete(msg_id bigint)
  returns boolean
  security definer
  language sql
  set search_path to ''
  as $$
    select pgmq.delete('conversation_outbound', msg_id);
  $$;

grant execute on function public.conversation_outbound_delete(bigint) to service_role;

-- Archive a message (move to pgmq archive table) instead of deleting.
-- Useful for inspecting processed messages for debugging.
create or replace function public.conversation_outbound_archive(msg_id bigint)
  returns boolean
  security definer
  language sql
  set search_path to ''
  as $$
    select pgmq.archive('conversation_outbound', msg_id);
  $$;

grant execute on function public.conversation_outbound_archive(bigint) to service_role;

-- ============================================================
-- pg_cron + pg_net drain scheduling (Agent D)
-- ============================================================
-- Schedules a POST to the drain route every minute.  In production, set the real URL
-- and secret in the environment.  Locally, Docker→host networking may prevent this from
-- working — use the manual trigger (curl) documented in apps/platform/app/api/internal/conversations/drain/route.ts.
--
-- The pg_cron + pg_net calls are intentionally wrapped in a DO block with an exception
-- handler so that replay on `pnpm db:reset` is safe even when the env vars are unset.
-- Set APP_DRAIN_URL and CONVERSATIONS_DRAIN_SECRET in the Supabase service env to
-- activate the schedule.
-- ============================================================

-- ============================================================
-- pg_cron + pg_net drain scheduling (Agent D)
-- ============================================================

do $$
  declare
    _drain_url text := coalesce(current_setting('app.drain_url', true), '');
    _drain_secret text := coalesce(current_setting('app.drain_secret', true), '');
  begin
    -- Remove any previous schedule to keep this idempotent on re-run.
    perform cron.unschedule('conversation_outbound_drain')
      where exists (
        select 1 from cron.job where jobname = 'conversation_outbound_drain'
      );

    if _drain_url <> '' and _drain_secret <> '' then
      -- Schedule: every minute, POST to the drain endpoint with shared-secret header.
      perform cron.schedule(
        'conversation_outbound_drain',
        '* * * * *',
        format(
          $cron$
            select net.http_post(
              url     := %L,
              headers := jsonb_build_object('x-drain-secret', %L, 'content-type', 'application/json'),
              body    := '{}'::jsonb
            );
          $cron$,
          _drain_url,
          _drain_secret
        )
      );
    end if;
  exception
    when others then
      -- pg_cron/pg_net may not be available in all environments; log and continue.
      raise notice 'conversation_outbound_drain schedule skipped: %', sqlerrm;
  end;
$$;

-- ============================================================
-- pg_graphql table-level configuration
-- Enable totalCount and aggregate on every table so callers
-- can always request counts and aggregations without schema changes.
-- max_rows per table requires pg_graphql ≥ 1.5.12 (current: 1.5.11);
-- once upgraded, move schema-wide max_rows here per-table.
-- ============================================================

comment on table public.profiles is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversation_topics is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.reserved_slugs is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.tenants is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.organizations is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level0 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level1 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level2 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level3 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.organization_memberships is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.permissions is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.organization_membership_permissions is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.permission_presets is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.agencies is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.agency_memberships is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.agencies_organizations_grants is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_identities is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.tenant_domains is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.tenant_sso_providers is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversations is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversation_messages is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversation_message_deliveries is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_topic_channels is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_contacts is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_push_subscriptions is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
-- ============================================================
-- Computed fields on organization_memberships
-- ============================================================

-- Returns the auth.users email for active members (profile_id set).
-- Pending invitations return NULL. Security definer to read auth.users.
create or replace function public.organization_membership_email(this public.organization_memberships)
  returns text
  stable strict security definer parallel safe
  language sql set search_path to ''
as $$
  select u.email::text from auth.users u where u.id = this.profile_id;
$$;

grant execute on function public.organization_membership_email(public.organization_memberships) to anon, authenticated;

-- Returns a human-readable display label:
--   active  → profile_name_full → auth.users.email → profile_id[:8]
--   pending → invite_email → invite_phone → country · document
-- Security definer required to read auth.users.email.
create or replace function public.organization_membership_label(this public.organization_memberships)
  returns text
  stable strict security definer parallel safe
  language sql set search_path to ''
as $$
  select case
    when this.profile_id is not null then
      coalesce(
        (select p.profile_name_full from public.profiles p where p.profile_id = this.profile_id),
        (select u.email::text        from auth.users u         where u.id        = this.profile_id),
        left(this.profile_id::text, 8)
      )
    when this.organization_membership_invite_email is not null then
      this.organization_membership_invite_email::text
    when this.organization_membership_invite_phone is not null then
      this.organization_membership_invite_phone
    when this.organization_membership_invite_document_value is not null then
      coalesce(this.organization_membership_invite_address_level0_id, '') || ' · ' || this.organization_membership_invite_document_value
    else '—'
  end;
$$;

grant execute on function public.organization_membership_label(public.organization_memberships) to anon, authenticated;

-- ============================================================
-- Uniform, two-layer authorization (Zanzibar-lite, in-Postgres)
-- Core functions take an explicit profile_id; viewer_* wrappers inject the JWT's own.
-- Coexists with the legacy viewer_*/grant tables until the cutover plan migrates RLS.
-- ============================================================

-- Enum: permission_object_type
do $$ begin
  create type public.permission_object_type as enum ('organization', 'tenant', 'agency');
exception when duplicate_object then null;
end $$;

create table if not exists public.permission_grants (
  permission_grant_id bigint generated always as identity primary key,
  -- subject: exactly one (mirrors the 3 legacy grant tables)
  subject_organization_membership_id int
    references public.organization_memberships (organization_membership_id) on delete cascade,
  subject_agency_membership_id int
    references public.agency_memberships (agency_membership_id) on delete cascade,
  subject_agency_id int
    references public.agencies (agency_id) on delete cascade,
  -- object: only the agency->org reach carries one; NULL with an agency subject = "all orgs"
  object_organization_id int
    references public.organizations (organization_id) on delete cascade,
  permission_id extensions.citext not null
    references public.permissions (permission_id) on delete cascade,
  permission_grant_created_at timestamptz not null default current_timestamp,
  constraint permission_grants_one_subject check (
    (subject_organization_membership_id is not null)::int
    + (subject_agency_membership_id is not null)::int
    + (subject_agency_id is not null)::int = 1
  ),
  constraint permission_grants_object_only_for_agency check (
    object_organization_id is null or subject_agency_id is not null
  )
);

-- uniqueness per legacy table (NULL-safe partial uniques for the agency reach)
create unique index if not exists permission_grants_org_membership_unique
  on public.permission_grants (subject_organization_membership_id, permission_id)
  where subject_organization_membership_id is not null;
create unique index if not exists permission_grants_agency_membership_unique
  on public.permission_grants (subject_agency_membership_id, permission_id)
  where subject_agency_membership_id is not null;
create unique index if not exists permission_grants_agency_org_unique
  on public.permission_grants (subject_agency_id, object_organization_id, permission_id)
  where subject_agency_id is not null and object_organization_id is not null;
create unique index if not exists permission_grants_agency_all_orgs_unique
  on public.permission_grants (subject_agency_id, permission_id)
  where subject_agency_id is not null and object_organization_id is null;

-- RLS: managed by viewer_* checks in the cutover plan. Enable + lock down for now.
alter table public.permission_grants enable row level security;
revoke all on table public.permission_grants from anon, authenticated;
grant select, insert, update, delete on table public.permission_grants to anon, authenticated;

-- ------------------------------------------------------------
-- internal: active-membership helpers
-- ------------------------------------------------------------

create or replace function internal.is_active_org_member(profile_id uuid, organization_id int)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select exists (
      select 1 from public.organization_memberships m
      where m.profile_id = is_active_org_member.profile_id
        and m.organization_id = is_active_org_member.organization_id
        and m.organization_membership_accepted_at is not null
        and m.organization_membership_revoked_at is null
        and m.organization_membership_rejected_at is null
    );
  $$;

create or replace function internal.is_active_agency_member(profile_id uuid, agency_id int)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select exists (
      select 1 from public.agency_memberships am
      join public.agencies a on a.agency_id = am.agency_id and a.agency_deleted_at is null
      where am.profile_id = is_active_agency_member.profile_id
        and am.agency_id = is_active_agency_member.agency_id
        and am.agency_membership_accepted_at is not null
        and am.agency_membership_revoked_at is null
        and am.agency_membership_rejected_at is null
    );
  $$;

-- ------------------------------------------------------------
-- protected.member_objects — orgs/tenants/agencies the profile actively belongs to
-- ------------------------------------------------------------

create or replace function protected.member_objects(profile_id uuid, object_type public.permission_object_type)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select m.organization_id::bigint
    from public.organization_memberships m
    where member_objects.object_type = 'organization'
      and m.profile_id = member_objects.profile_id
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
    union
    select o.tenant_id::bigint
    from public.organization_memberships m
    join public.organizations o on o.organization_id = m.organization_id
    where member_objects.object_type = 'tenant'
      and m.profile_id = member_objects.profile_id
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
    union
    select am.agency_id::bigint
    from public.agency_memberships am
    join public.agencies a on a.agency_id = am.agency_id and a.agency_deleted_at is null
    where member_objects.object_type = 'agency'
      and am.profile_id = member_objects.profile_id
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null;
  $$;

revoke execute on function protected.member_objects(uuid, public.permission_object_type) from public;
revoke execute on function protected.member_objects(uuid, public.permission_object_type) from anon, authenticated;
grant execute on function protected.member_objects(uuid, public.permission_object_type) to service_role;

-- ------------------------------------------------------------
-- protected.check_permission — core resolution (direct + agency bridge + wildcard)
-- ------------------------------------------------------------

create or replace function protected.check_permission(
  profile_id uuid,
  permission_id extensions.citext,
  object_type public.permission_object_type,
  object_id bigint
)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select case check_permission.object_type
      when 'organization' then (
        -- direct: a grant on the viewer's active org membership in this org
        exists (
          select 1
          from public.permission_grants g
          join public.organization_memberships m
            on m.organization_membership_id = g.subject_organization_membership_id
          where m.organization_id = check_permission.object_id::int
            and m.profile_id = check_permission.profile_id
            and m.organization_membership_accepted_at is not null
            and m.organization_membership_revoked_at is null
            and m.organization_membership_rejected_at is null
            and (g.permission_id = check_permission.permission_id or g.permission_id = '*')
        )
        or exists ( -- agency reach
          select 1
          from public.permission_grants g
          join public.agency_memberships am on am.agency_id = g.subject_agency_id
          join public.agencies a on a.agency_id = g.subject_agency_id and a.agency_deleted_at is null
          where g.subject_agency_id is not null
            and (g.object_organization_id = check_permission.object_id::int
                 or g.object_organization_id is null)
            and (g.permission_id = check_permission.permission_id or g.permission_id = '*')
            and am.profile_id = check_permission.profile_id
            and am.agency_membership_accepted_at is not null
            and am.agency_membership_revoked_at is null
            and am.agency_membership_rejected_at is null
        )
      )
      when 'tenant' then (
        -- tenant authority rides on org grants of orgs inside the tenant
        exists (
          select 1
          from public.permission_grants g
          join public.organization_memberships m
            on m.organization_membership_id = g.subject_organization_membership_id
          join public.organizations o on o.organization_id = m.organization_id
          where o.tenant_id = check_permission.object_id::int
            and m.profile_id = check_permission.profile_id
            and m.organization_membership_accepted_at is not null
            and m.organization_membership_revoked_at is null
            and m.organization_membership_rejected_at is null
            and (g.permission_id = check_permission.permission_id or g.permission_id = '*')
        )
      )
      when 'agency' then (
        -- manage-the-agency-itself: active agency-membership grant
        exists (
          select 1
          from public.permission_grants g
          join public.agency_memberships am
            on am.agency_membership_id = g.subject_agency_membership_id
          join public.agencies a on a.agency_id = am.agency_id and a.agency_deleted_at is null
          where am.agency_id = check_permission.object_id::int
            and am.profile_id = check_permission.profile_id
            and am.agency_membership_accepted_at is not null
            and am.agency_membership_revoked_at is null
            and am.agency_membership_rejected_at is null
            and (g.permission_id = check_permission.permission_id or g.permission_id = '*')
        )
      )
    end;
  $$;

revoke execute on function protected.check_permission(uuid, extensions.citext, public.permission_object_type, bigint) from public;
revoke execute on function protected.check_permission(uuid, extensions.citext, public.permission_object_type, bigint) from anon, authenticated;
grant execute on function protected.check_permission(uuid, extensions.citext, public.permission_object_type, bigint) to service_role;

-- ------------------------------------------------------------
-- protected.lookup_objects — set form of check_permission (object ids where check_permission is true)
-- ------------------------------------------------------------

create or replace function protected.lookup_objects(
  profile_id uuid,
  permission_id extensions.citext,
  object_type public.permission_object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    -- organization: direct org-membership grants
    select m.organization_id::bigint
    from public.permission_grants g
    join public.organization_memberships m
      on m.organization_membership_id = g.subject_organization_membership_id
    where lookup_objects.object_type = 'organization'
      and m.profile_id = lookup_objects.profile_id
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and (g.permission_id = lookup_objects.permission_id or g.permission_id = '*')
    union
    -- organization: via agency bridge (specific org grant OR all-orgs wildcard)
    -- CRITICAL: exclude soft-deleted agencies (agency_deleted_at is null)
    select o.organization_id::bigint
    from public.permission_grants g
    join public.agency_memberships am on am.agency_id = g.subject_agency_id
    join public.agencies a on a.agency_id = g.subject_agency_id and a.agency_deleted_at is null
    join public.organizations o on (
      o.organization_id = g.object_organization_id
      -- all-orgs wildcard: agency grant with no object set → matches every org
      or g.object_organization_id is null
    )
    where lookup_objects.object_type = 'organization'
      and g.subject_agency_id is not null
      and (g.permission_id = lookup_objects.permission_id or g.permission_id = '*')
      and am.profile_id = lookup_objects.profile_id
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null
    union
    -- tenant: ride on org grants of orgs inside the tenant
    select o.tenant_id::bigint
    from public.permission_grants g
    join public.organization_memberships m
      on m.organization_membership_id = g.subject_organization_membership_id
    join public.organizations o on o.organization_id = m.organization_id
    where lookup_objects.object_type = 'tenant'
      and m.profile_id = lookup_objects.profile_id
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and (g.permission_id = lookup_objects.permission_id or g.permission_id = '*')
    union
    -- agency: active agency-membership grants
    select am.agency_id::bigint
    from public.permission_grants g
    join public.agency_memberships am
      on am.agency_membership_id = g.subject_agency_membership_id
    join public.agencies a on a.agency_id = am.agency_id and a.agency_deleted_at is null
    where lookup_objects.object_type = 'agency'
      and am.profile_id = lookup_objects.profile_id
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null
      and (g.permission_id = lookup_objects.permission_id or g.permission_id = '*');
  $$;

revoke execute on function protected.lookup_objects(uuid, extensions.citext, public.permission_object_type) from public;
revoke execute on function protected.lookup_objects(uuid, extensions.citext, public.permission_object_type) from anon, authenticated;
grant execute on function protected.lookup_objects(uuid, extensions.citext, public.permission_object_type) to service_role;

-- ------------------------------------------------------------
-- protected.list_object_permissions — slugs the profile holds on one object (UI)
-- ------------------------------------------------------------

create or replace function protected.list_object_permissions(
  profile_id uuid,
  object_type public.permission_object_type,
  object_id bigint
)
  returns setof extensions.citext stable security definer parallel safe language sql set search_path to '' as $$
    select distinct p.permission_id
    from public.permissions p
    where protected.check_permission(list_object_permissions.profile_id, p.permission_id, list_object_permissions.object_type, list_object_permissions.object_id);
  $$;

revoke execute on function protected.list_object_permissions(uuid, public.permission_object_type, bigint) from public;
revoke execute on function protected.list_object_permissions(uuid, public.permission_object_type, bigint) from anon, authenticated;
grant execute on function protected.list_object_permissions(uuid, public.permission_object_type, bigint) to service_role;

-- ------------------------------------------------------------
-- protected.agency_reachable_objects — objects where the profile's
-- active (non-deleted) agency has ≥1 grant (visibility, not action)
-- ------------------------------------------------------------

create or replace function protected.agency_reachable_objects(
  profile_id uuid,
  object_type public.permission_object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    -- organization: specific-org grant OR all-orgs wildcard (object_organization_id IS NULL)
    -- mirrors lookup_objects agency branch; soft-deleted agencies excluded
    select distinct o.organization_id::bigint
    from public.permission_grants g
    join public.agency_memberships am on am.agency_id = g.subject_agency_id
    join public.agencies a on a.agency_id = g.subject_agency_id and a.agency_deleted_at is null
    join public.organizations o on (
      o.organization_id = g.object_organization_id
      -- all-orgs wildcard: grant with no object set → matches every org
      or g.object_organization_id is null
    )
    where agency_reachable_objects.object_type = 'organization'
      and g.subject_agency_id is not null
      and am.profile_id = agency_reachable_objects.profile_id
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null
    union
    -- tenant: via orgs in the tenant that the agency reaches (same all-orgs handling)
    select distinct o.tenant_id::bigint
    from public.permission_grants g
    join public.agency_memberships am on am.agency_id = g.subject_agency_id
    join public.agencies a on a.agency_id = g.subject_agency_id and a.agency_deleted_at is null
    join public.organizations o on (
      o.organization_id = g.object_organization_id
      -- all-orgs wildcard: agency grant with no object set → every org's tenant reachable
      or g.object_organization_id is null
    )
    where agency_reachable_objects.object_type = 'tenant'
      and g.subject_agency_id is not null
      and am.profile_id = agency_reachable_objects.profile_id
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null;
  $$;

revoke execute on function protected.agency_reachable_objects(uuid, public.permission_object_type) from public;
revoke execute on function protected.agency_reachable_objects(uuid, public.permission_object_type) from anon, authenticated;
grant execute on function protected.agency_reachable_objects(uuid, public.permission_object_type) to service_role;

-- ------------------------------------------------------------
-- public.viewer_* wrappers — inject the JWT's own profile_id
-- (in public so GraphQL and RLS can reach them)
-- ------------------------------------------------------------

create or replace function public.viewer_can(
  permission_id extensions.citext,
  object_type public.permission_object_type,
  object_id bigint
)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select protected.check_permission(public.viewer_profile_id(true), viewer_can.permission_id, viewer_can.object_type, viewer_can.object_id);
  $$;

grant execute on function public.viewer_can(extensions.citext, public.permission_object_type, bigint) to anon, authenticated;

create or replace function public.viewer_can_objects(
  permission_id extensions.citext,
  object_type public.permission_object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select protected.lookup_objects(public.viewer_profile_id(true), viewer_can_objects.permission_id, viewer_can_objects.object_type);
  $$;

grant execute on function public.viewer_can_objects(extensions.citext, public.permission_object_type) to anon, authenticated;

create or replace function public.viewer_object_permissions(
  object_type public.permission_object_type,
  object_id bigint
)
  returns setof extensions.citext stable security definer parallel safe language sql set search_path to '' as $$
    select protected.list_object_permissions(public.viewer_profile_id(true), viewer_object_permissions.object_type, viewer_object_permissions.object_id);
  $$;

grant execute on function public.viewer_object_permissions(public.permission_object_type, bigint) to anon, authenticated;

create or replace function public.viewer_member_objects(
  object_type public.permission_object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select protected.member_objects(public.viewer_profile_id(true), viewer_member_objects.object_type);
  $$;

grant execute on function public.viewer_member_objects(public.permission_object_type) to anon, authenticated;

create or replace function public.viewer_agency_reachable_objects(
  object_type public.permission_object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select protected.agency_reachable_objects(public.viewer_profile_id(true), viewer_agency_reachable_objects.object_type);
  $$;

grant execute on function public.viewer_agency_reachable_objects(public.permission_object_type) to anon, authenticated;

-- ============================================================
-- PHASE C: Migrate resource RLS policies to permission_grants helpers
-- (Defined here — after viewer_can/viewer_can_objects/viewer_member_objects/
--  viewer_agency_reachable_objects — so those functions exist at create time.
--  Each block re-drops the legacy version and creates the new one. Idempotent.)
-- ============================================================

-- ------------------------------------------------------------
-- agencies
-- ------------------------------------------------------------
drop policy if exists "agencies select by affiliates" on public.agencies;
create policy "agencies select by affiliates"
  on public.agencies for select to authenticated
  using (agency_id in (select public.viewer_member_objects('agency')));

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
drop policy if exists "Profiles visible to self or org co-members or agency affiliates" on public.profiles;
create policy "Profiles visible to self or org co-members or agency affiliates"
  on public.profiles for select
  to authenticated
  using (
    profile_deleted_at is null
    and (
      profile_id = (select public.viewer_profile_id())
      or exists (
        select 1
        from public.organization_memberships me
        join public.organization_memberships them using (organization_id)
        where me.profile_id = (select public.viewer_profile_id())
          and them.profile_id = public.profiles.profile_id
          and me.organization_membership_accepted_at is not null
          and me.organization_membership_revoked_at is null
          and me.organization_membership_rejected_at is null
          and them.organization_membership_accepted_at is not null
          and them.organization_membership_revoked_at is null
          and them.organization_membership_rejected_at is null
      )
      or exists (
        select 1 from public.organization_memberships m
        where m.profile_id = public.profiles.profile_id
          and m.organization_id in (select public.viewer_agency_reachable_objects('organization'))
      )
    )
  );

-- ------------------------------------------------------------
-- tenants
-- ------------------------------------------------------------
drop policy if exists "tenants select by members or agency affiliates" on public.tenants;
create policy "tenants select by members or agency affiliates"
  on public.tenants for select
  to authenticated
  using (
    tenant_id in (select public.viewer_member_objects('tenant'))
    or tenant_id in (select public.viewer_agency_reachable_objects('tenant'))
  );

drop policy if exists "tenants update with tenant_manage" on public.tenants;
create policy "tenants update with tenant_manage"
  on public.tenants for update
  to authenticated
  using (tenant_id in (select public.viewer_can_objects('tenant_manage','tenant')))
  with check (tenant_id in (select public.viewer_can_objects('tenant_manage','tenant')));

-- ------------------------------------------------------------
-- organizations
-- ------------------------------------------------------------
drop policy if exists "organizations select by members or agency affiliates" on public.organizations;
create policy "organizations select by members or agency affiliates"
  on public.organizations for select
  to authenticated
  using (
    organization_id in (select public.viewer_member_objects('organization'))
    or organization_id in (select public.viewer_agency_reachable_objects('organization'))
  );

drop policy if exists "organizations update with organization_manage" on public.organizations;
create policy "organizations update with organization_manage"
  on public.organizations for update
  to authenticated
  using (organization_id in (select public.viewer_can_objects('organization_manage','organization')));

-- ------------------------------------------------------------
-- organization_memberships
-- ------------------------------------------------------------
drop policy if exists "organization_memberships select by co-members or agency affiliates" on public.organization_memberships;
create policy "organization_memberships select by co-members or agency affiliates"
  on public.organization_memberships for select
  to authenticated
  using (
    organization_id in (select public.viewer_member_objects('organization'))
    or organization_id in (select public.viewer_agency_reachable_objects('organization'))
  );

drop policy if exists "organization_memberships write with members_manage" on public.organization_memberships;
create policy "organization_memberships write with members_manage"
  on public.organization_memberships for all
  to authenticated
  using (organization_id in (select public.viewer_can_objects('members_manage','organization')))
  with check (organization_id in (select public.viewer_can_objects('members_manage','organization')));

-- ------------------------------------------------------------
-- permission_presets
-- ------------------------------------------------------------
drop policy if exists "permission_presets select globals or own org or agency affiliates" on public.permission_presets;
create policy "permission_presets select globals or own org or agency affiliates"
  on public.permission_presets for select
  to authenticated
  using (
    organization_id is null
    or organization_id in (select public.viewer_member_objects('organization'))
    or organization_id in (select public.viewer_agency_reachable_objects('organization'))
  );

drop policy if exists "permission_presets write with presets_manage" on public.permission_presets;
create policy "permission_presets write with presets_manage"
  on public.permission_presets for all
  to authenticated
  using (
    organization_id is not null
    and organization_id in (select public.viewer_can_objects('presets_manage','organization'))
  )
  with check (
    organization_id is not null
    and organization_id in (select public.viewer_can_objects('presets_manage','organization'))
  );

-- ------------------------------------------------------------
-- profile_identities
-- ------------------------------------------------------------
drop policy if exists "profile_identities select" on public.profile_identities;
create policy "profile_identities select"
  on public.profile_identities for select
  to authenticated
  using (
    profile_id = (select public.viewer_profile_id())
    or exists (
      select 1 from public.organization_memberships m
      where m.profile_id = public.profile_identities.profile_id
        and m.organization_id in (select public.viewer_can_objects('members_manage','organization'))
    )
    or exists (
      select 1 from public.organization_memberships m
      where m.profile_id = public.profile_identities.profile_id
        and m.organization_id in (select public.viewer_agency_reachable_objects('organization'))
    )
  );

-- ------------------------------------------------------------
-- tenant_domains
-- ------------------------------------------------------------
drop policy if exists "tenant_domains select by members" on public.tenant_domains;
create policy "tenant_domains select by members"
  on public.tenant_domains for select to authenticated
  using (tenant_id in (select public.viewer_member_objects('tenant')));

drop policy if exists "tenant_domains write with organization_manage" on public.tenant_domains;
create policy "tenant_domains write with organization_manage"
  on public.tenant_domains for all to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.tenant_id = public.tenant_domains.tenant_id
        and o.organization_id in (select public.viewer_can_objects('organization_manage','organization'))
    )
  );

-- ------------------------------------------------------------
-- tenant_sso_providers
-- ------------------------------------------------------------
drop policy if exists "tenant_sso_providers select by members" on public.tenant_sso_providers;
create policy "tenant_sso_providers select by members"
  on public.tenant_sso_providers for select to authenticated
  using (tenant_id in (select public.viewer_member_objects('tenant')));

-- ------------------------------------------------------------
-- storage.objects
-- ------------------------------------------------------------
drop policy if exists "organizations bucket: organization_manage avatar" on storage.objects;
create policy "organizations bucket: organization_manage avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'organizations'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_can_objects('organization_manage','organization'))
  )
  with check (
    bucket_id = 'organizations'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_can_objects('organization_manage','organization'))
  );

drop policy if exists "tenants bucket: tenant_manage avatar" on storage.objects;
create policy "tenants bucket: tenant_manage avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'tenants'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_can_objects('tenant_manage','tenant'))
  )
  with check (
    bucket_id = 'tenants'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_can_objects('tenant_manage','tenant'))
  );

drop policy if exists "agencies bucket: member avatar" on storage.objects;
create policy "agencies bucket: member avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'agencies'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_member_objects('agency'))
  )
  with check (
    bucket_id = 'agencies'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_member_objects('agency'))
  );

-- ============================================================
-- D1: RLS policies on permission_grants
-- ============================================================

drop policy if exists "permission_grants select by scope members" on public.permission_grants;
create policy "permission_grants select by scope members"
  on public.permission_grants for select
  to authenticated
  using (
    -- org-membership grant: co-members in that org
    (subject_organization_membership_id is not null and exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.permission_grants.subject_organization_membership_id
        and m.organization_id in (select public.viewer_member_objects('organization'))
    ))
    -- agency-membership grant: co-affiliates of that agency
    or (subject_agency_membership_id is not null and exists (
      select 1 from public.agency_memberships am
      where am.agency_membership_id = public.permission_grants.subject_agency_membership_id
        and am.agency_id in (select public.viewer_member_objects('agency'))
    ))
    -- agency→org reach grant: affiliates of that agency
    or (subject_agency_id is not null
        and subject_agency_id in (select public.viewer_member_objects('agency')))
  );

drop policy if exists "permission_grants write by permission holders" on public.permission_grants;
create policy "permission_grants write by permission holders"
  on public.permission_grants for all
  to authenticated
  using (
    -- org-membership grant: require members_manage on that membership's org
    (subject_organization_membership_id is not null and exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.permission_grants.subject_organization_membership_id
        and m.organization_id in (select public.viewer_can_objects('members_manage','organization'))
    ))
    -- agency→org reach grant: require organization_manage on the target org (NULL excluded)
    or (subject_agency_id is not null
        and object_organization_id is not null
        and object_organization_id in (select public.viewer_can_objects('organization_manage','organization')))
    -- agency-membership grant: require agency_members_manage on that membership's agency
    or (subject_agency_membership_id is not null and exists (
      select 1 from public.agency_memberships am
      where am.agency_membership_id = public.permission_grants.subject_agency_membership_id
        and am.agency_id in (select public.viewer_agency_team_permission_ids('agency_members_manage'))
    ))
  )
  with check (
    (subject_organization_membership_id is not null and exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.permission_grants.subject_organization_membership_id
        and m.organization_id in (select public.viewer_can_objects('members_manage','organization'))
    ))
    or (subject_agency_id is not null
        and object_organization_id is not null
        and object_organization_id in (select public.viewer_can_objects('organization_manage','organization')))
    or (subject_agency_membership_id is not null and exists (
      select 1 from public.agency_memberships am
      where am.agency_membership_id = public.permission_grants.subject_agency_membership_id
        and am.agency_id in (select public.viewer_agency_team_permission_ids('agency_members_manage'))
    ))
  );

-- ============================================================
-- D2a: org_has_other_active_admin_from_grants helper
-- ============================================================

create or replace function public.org_has_other_active_admin_from_grants(
  _organization_id int,
  _excluded_organization_membership_id int
) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select exists (
    select 1
    from public.organization_memberships m
    join public.permission_grants g on g.subject_organization_membership_id = m.organization_membership_id
    where m.organization_id = _organization_id
      and m.organization_membership_id <> _excluded_organization_membership_id
      and m.profile_id is not null
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and g.permission_id in ('members_manage', '*')
  );
$$;

revoke execute on function public.org_has_other_active_admin_from_grants(int, int) from public;
grant execute on function public.org_has_other_active_admin_from_grants(int, int) to authenticated;

-- ============================================================
-- D2b: protect-last-admin trigger on permission_grants
-- ============================================================

create or replace function public.permission_grants_protect_last_admin()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  _organization_id int;
  _profile_id uuid;
begin
  -- Only fires for org-membership grants.
  if old.subject_organization_membership_id is null then
    return old;
  end if;

  -- service_role bypass.
  if public.viewer_profile_id() is null then
    return old;
  elsif old.permission_id not in ('members_manage', '*') then
    return old;
  end if;

  select organization_id, profile_id into _organization_id, _profile_id
  from public.organization_memberships
  where organization_membership_id = old.subject_organization_membership_id;

  -- Pending invites carry no live access — cannot lock anyone out.
  if _profile_id is null then
    return old;
  -- If the same membership still holds the OTHER admin permission, no lockout.
  elsif exists (
    select 1 from public.permission_grants
    where subject_organization_membership_id = old.subject_organization_membership_id
      and permission_id in ('members_manage', '*')
      and permission_id <> old.permission_id
  ) then
    return old;
  end if;

  -- Stripping admin from this membership — ensure another active admin exists.
  if not public.org_has_other_active_admin_from_grants(_organization_id, old.subject_organization_membership_id) then
    raise exception 'last_admin_protected'
      using hint = 'cannot revoke the last admin permission in the organization';
  end if;

  return old;
end;
$$;

drop trigger if exists permission_grants_trigger_protect_last_admin on public.permission_grants;
create trigger permission_grants_trigger_protect_last_admin
  before delete on public.permission_grants
  for each row execute procedure public.permission_grants_protect_last_admin();

-- ============================================================
-- D2c: Rewrite viewer_organization_membership_set_permissions_collection
-- Now writes to permission_grants and returns setof permission_grants.
-- Must be defined AFTER the permission_grants table (line ~4843).
-- Drop the old version (return type changed) then recreate.
-- ============================================================

drop function if exists public.viewer_organization_membership_set_permissions_collection(int, extensions.citext[]);

-- Atomically REPLACE a member's permission set with the given slugs (preset apply / MCP).
-- Gated by `members_manage` on the membership's org. Grants are added before removals so
-- swapping one admin slug for another doesn't trip the last-admin trigger mid-operation;
-- clearing the last admin's grants is still blocked by that trigger. Returns the final set.
create function public.viewer_organization_membership_set_permissions_collection(
  organization_membership_id int,
  permission_ids extensions.citext[]
)
  returns setof public.permission_grants
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _organization_id int;
    begin
      select m.organization_id into _organization_id
        from public.organization_memberships m
        where m.organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id;

      if _organization_id is null then
        raise exception 'membership_not_found' using errcode = 'P0001';
      elsif not public.viewer_has_permission(_organization_id, 'members_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;

      -- Every requested slug must exist in the catalog.
      if exists (
        select 1 from unnest(viewer_organization_membership_set_permissions_collection.permission_ids) as s(permission_id)
        where not exists (select 1 from public.permissions p where p.permission_id = s.permission_id)
      ) then
        raise exception 'invalid_permission' using errcode = 'P0001';
      end if;

      -- Add the desired grants not already present (insert-before-delete avoids tripping
      -- the last-admin trigger mid-swap).
      insert into public.permission_grants (subject_organization_membership_id, permission_id)
        select viewer_organization_membership_set_permissions_collection.organization_membership_id, s.permission_id
        from unnest(viewer_organization_membership_set_permissions_collection.permission_ids) as s(permission_id)
        where not exists (
          select 1 from public.permission_grants existing
          where existing.subject_organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id
            and existing.permission_id = s.permission_id
        );

      delete from public.permission_grants g
        where g.subject_organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id
          and g.permission_id <> all (viewer_organization_membership_set_permissions_collection.permission_ids);

      return query
        select g.*
        from public.permission_grants g
        where g.subject_organization_membership_id = viewer_organization_membership_set_permissions_collection.organization_membership_id;
    end;
  $$;

grant execute on function public.viewer_organization_membership_set_permissions_collection(int, extensions.citext[]) to authenticated;
