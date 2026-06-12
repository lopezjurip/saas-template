-- SaaS Template schema (prototype phase)
-- Edit this file directly, then run: pnpm db:reset && pnpm generate:types

-- Extensions
create extension if not exists "moddatetime" schema extensions;
create extension if not exists "citext" schema extensions;
-- pgTAP powers `supabase test db` (see packages/supabase/supabase/tests/). The extension
-- only ships SQL helpers (plan/ok/is/throws_ok/…); it doesn't alter runtime behavior.
create extension if not exists "pgtap" schema extensions;

-- ============================================================
-- Schemas
-- ============================================================
-- private   : sensitive data, no API access, not callable from public schemas
-- internal  : utilities callable by other schemas (via security definer), no API access
-- protected : admin data, API access requires service_role key, not callable from public schemas
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
--   comment on table public.addresses_level0 is e'@graphql({"max_rows": 250})';
comment on schema public is e'@graphql({"max_rows": 250})';

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
  profile_disabled_at timestamptz,
  profile_created_at timestamptz not null default current_timestamp,
  profile_updated_at timestamptz not null default current_timestamp
);

-- Indexes
create index if not exists profiles_disabled_at_idx
  on public.profiles (profile_disabled_at)
  where profile_disabled_at is not null;

-- Auto-update updated_at
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure extensions.moddatetime(profile_updated_at);

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
    profile_disabled_at is null
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
  tenant_disabled_at timestamptz,
  tenant_created_at timestamptz not null default current_timestamp,
  tenant_updated_at timestamptz not null default current_timestamp
);

create index if not exists tenants_disabled_at_idx
  on public.tenants (tenant_disabled_at) where tenant_disabled_at is not null;

drop trigger if exists handle_tenants_updated_at on public.tenants;
create trigger handle_tenants_updated_at
  before update on public.tenants
  for each row execute procedure extensions.moddatetime(tenant_updated_at);

drop trigger if exists tenants_trigger_normalize_name on public.tenants;
create trigger tenants_trigger_normalize_name
  before insert or update of tenant_name on public.tenants
  for each row execute procedure internal.column_normalize_text(tenant_name);

create table if not exists public.organizations (
  organization_id serial primary key,
  tenant_id int not null references public.tenants (tenant_id) on delete cascade,
  organization_slug extensions.citext not null check (internal.slug_validate(organization_slug::text)),
  organization_name text not null check (char_length(organization_name) between 1 and 256),
  organization_disabled_at timestamptz,
  organization_created_at timestamptz not null default current_timestamp,
  organization_updated_at timestamptz not null default current_timestamp,
  unique (tenant_id, organization_slug)
);

create index if not exists organizations_tenant_idx
  on public.organizations (tenant_id) where organization_disabled_at is null;

drop trigger if exists handle_organizations_updated_at on public.organizations;
create trigger handle_organizations_updated_at
  before update on public.organizations
  for each row execute procedure extensions.moddatetime(organization_updated_at);

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

-- Forward declarations needed before `public.organization_memberships` so its invite columns + triggers
-- can reference them. The full `public.addresses_level0` table (with seed + indexes) and
-- the `profile_identities` section appear later in the file with their RLS policies; this
-- block only puts the pieces in place that organization_memberships requires.

create table if not exists public.addresses_level0 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level0_name text not null check (length(address_level0_name) <= 100),
  address_level0_emoji text check (char_length(address_level0_emoji) between 1 and 8),
  address_level0_disabled_at timestamptz,
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
-- so the invitee can match it via viewer_organization_membership_pending(). The shareable accept link
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

-- Lookups for viewer_organization_membership_pending: scan by identifier.
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
  ('organization_manage',  'Edit the name, settings, and domains of the tenant/organization.'),
  ('members_manage',       'Invite, remove, and reassign permissions to members.'),
  ('presets_manage',       'Create and edit the organization''s permission presets.')
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
  agency_id uuid not null primary key default internal.uuid_generate_v7(),
  agency_name text not null check (char_length(agency_name) between 1 and 100),
  agency_slug extensions.citext not null unique,
  agency_disabled_at timestamptz,
  agency_created_at timestamptz not null default current_timestamp,
  agency_updated_at timestamptz not null default current_timestamp
);

drop trigger if exists handle_agencies_updated_at on public.agencies;
create trigger handle_agencies_updated_at
  before update on public.agencies
  for each row execute procedure extensions.moddatetime(agency_updated_at);

-- AgencyMemberships: a profile belongs to an agency. Mirrors public.organization_memberships.
create table if not exists public.agency_memberships (
  agency_membership_id serial primary key,
  agency_id uuid not null references public.agencies (agency_id) on delete cascade,
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
  agency_id uuid not null references public.agencies (agency_id) on delete cascade,
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

-- RLS for agency tables.
alter table public.agencies enable row level security;
alter table public.agency_memberships enable row level security;
alter table public.agencies_organizations_grants enable row level security;

revoke all on table public.agencies from anon, authenticated;
grant select on table public.agencies to anon, authenticated;
grant select, insert, update, delete on table public.agencies to service_role;

revoke all on table public.agency_memberships from anon, authenticated;
grant select on table public.agency_memberships to anon, authenticated;
grant select, insert, update, delete on table public.agency_memberships to service_role;
grant usage, select on sequence public.agency_memberships_agency_membership_id_seq to service_role;

revoke all on table public.agencies_organizations_grants from anon, authenticated;
grant select on table public.agencies_organizations_grants to anon, authenticated;
grant select, insert, update, delete on table public.agencies_organizations_grants to service_role;

-- Writes on agency tables: service_role only (no authenticated write policies).
-- RLS SELECT policies for agency tables are defined after viewer_agency_ids() is created.

-- ============================================================
-- webauthn (passkeys)
-- ============================================================
-- Custom SimpleWebAuthn-backed implementation. Two tables:
--   profile_webauthn_challenges  : transient challenges; one per profile during registration,
--                          NULL profile_id for anonymous sign-in challenges.
--   profile_webauthn_credentials : persistent passkeys per profile.
-- The sign-in flow runs anonymously and goes through service-role; the registration
-- flow runs as the authenticated user. RLS is locked down so anon/authenticated
-- cannot touch challenges directly — only the credentials they own.

-- WebAuthn columns are stored as `text` (not enum) because some spec literals
-- contain hyphens (e.g. credential type `'public-key'`), which pg_graphql
-- rejects as enum value names — see CLAUDE.md "No hyphens in SQL identifiers
-- or enum values". `check` constraints preserve enum-like safety at the DB.

create table if not exists public.profile_webauthn_challenges (
  webauthn_challenge_id uuid not null primary key default internal.uuid_generate_v7(),
  profile_id uuid references public.profiles (profile_id) on delete cascade,
  webauthn_challenge_value text not null unique,
  webauthn_challenge_created_at timestamptz not null default current_timestamp,
  -- One registration challenge per profile. Postgres treats NULLs as distinct, so
  -- many anonymous sign-in challenges can coexist while each user has at most one
  -- pending registration challenge (upserts on profile_id).
  unique (profile_id)
);

create index if not exists profile_webauthn_challenges_created_at_idx
  on public.profile_webauthn_challenges (webauthn_challenge_created_at);

create table if not exists public.profile_webauthn_credentials (
  webauthn_credential_id uuid not null primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  webauthn_credential_external_id varchar not null unique,
  webauthn_credential_friendly_name text,
  webauthn_credential_type text not null
    check (webauthn_credential_type in ('public-key')),
  webauthn_credential_aaguid varchar not null default '00000000-0000-0000-0000-000000000000',
  webauthn_credential_sign_count integer not null,
  webauthn_credential_transports text[] not null,
  webauthn_credential_user_verification_status text not null
    check (webauthn_credential_user_verification_status in ('unverified', 'verified')),
  webauthn_credential_device_type text not null
    check (webauthn_credential_device_type in ('single_device', 'multi_device')),
  webauthn_credential_backup_state text not null
    check (webauthn_credential_backup_state in ('not_backed_up', 'backed_up')),
  webauthn_credential_public_key text not null,
  webauthn_credential_last_used_at timestamptz,
  webauthn_credential_created_at timestamptz not null default current_timestamp,
  webauthn_credential_updated_at timestamptz not null default current_timestamp
);

create index if not exists profile_webauthn_credentials_profile_idx
  on public.profile_webauthn_credentials (profile_id);

drop trigger if exists handle_profile_webauthn_credentials_updated_at on public.profile_webauthn_credentials;
create trigger handle_profile_webauthn_credentials_updated_at
  before update on public.profile_webauthn_credentials
  for each row execute procedure extensions.moddatetime(webauthn_credential_updated_at);

alter table public.profile_webauthn_challenges enable row level security;
alter table public.profile_webauthn_credentials enable row level security;

revoke all on table public.profile_webauthn_challenges from anon, authenticated;
grant select, insert, delete on table public.profile_webauthn_challenges to anon, authenticated;

revoke all on table public.profile_webauthn_credentials from anon, authenticated;
grant select, insert, update, delete on table public.profile_webauthn_credentials to anon, authenticated;

-- Challenges: 100% server-side via service-role (Server Actions in
-- apps/platform/lib/passkeys.actions.ts). No authenticated policies — clients
-- never touch this table directly. Default-deny keeps anon + authenticated out.

-- Credentials: clients only read their own list (/home/account/security) and delete their own
-- (passkey revocation). Inserts + updates happen exclusively via service-role
-- Server Actions, so authenticated INSERT/UPDATE policies are intentionally absent
-- — that closes the "user fabricates rows bypassing the WebAuthn ceremony" vector.
drop policy if exists "profile_webauthn_credentials select own" on public.profile_webauthn_credentials;
create policy "profile_webauthn_credentials select own"
  on public.profile_webauthn_credentials for select
  to authenticated
  using (profile_id = (select public.viewer_profile_id()));

drop policy if exists "profile_webauthn_credentials delete own" on public.profile_webauthn_credentials;
create policy "profile_webauthn_credentials delete own"
  on public.profile_webauthn_credentials for delete
  to authenticated
  using (profile_id = (select public.viewer_profile_id()));

-- Anonymous lookup used by /auth root to surface the passkey button only when the
-- entered email has a passkey registered. Same enumeration-leak posture as email_exists.
create or replace function public.email_has_passkey(email_to_check text)
  returns boolean
  language sql
  stable
  security definer
  set search_path to ''
  as $$
    select exists (
      select 1
      from auth.users u
      join public.profile_webauthn_credentials c on c.profile_id = u.id
      where lower(u.email) = lower(email_to_check)
    );
  $$;

grant execute on function public.email_has_passkey(text) to anon, authenticated;

-- Anonymous lookup used by /auth/email step-2 to surface the password field only when the
-- entered email has a password set. Same enumeration-leak posture as email_has_passkey.
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

-- Anonymous lookup used by /auth/phone step-2 to surface the passkey button only when the
-- entered phone resolves to an account with a passkey. gotrue stores phones without the
-- leading '+', so we strip it before comparing.
create or replace function public.phone_has_passkey(phone_to_check text, default_code text default '+56')
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
        join public.profile_webauthn_credentials c on c.profile_id = u.id
        where u.phone = ltrim(_canonical, '+')
      ) into _result;
      return _result;
    end;
  $$;

grant execute on function public.phone_has_passkey(text, text) to anon, authenticated;

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

-- Resolve profile_id (= auth.uid) from email. Used by the anonymous sign-in challenge
-- route to scope allowCredentials to the entered email's owner — avoids paging through
-- admin.listUsers. Service-role only; the route already runs with service-role.
create or replace function public.profile_id_by_email(email_to_check text)
  returns uuid
  language sql
  stable
  security definer
  set search_path to ''
  as $$
    select u.id
    from auth.users u
    where lower(u.email) = lower(email_to_check)
    limit 1;
  $$;

grant execute on function public.profile_id_by_email(text) to service_role;

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
--   viewer_tenants() / viewer_organizations() / viewer_tenant_by_id() / viewer_tenant_by_slug() / viewer_organization_by_id()

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
        where profile_id = _user_id and profile_disabled_at is null
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
      and o.organization_disabled_at is null
      and t.tenant_disabled_at is null;
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
      and o.organization_disabled_at is null
      and t.tenant_disabled_at is null;
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
  returns setof uuid
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
      and a.agency_disabled_at is null;
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

create or replace function public.viewer_agencies()
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

create or replace function public.viewer_agency_by_id(agency_id uuid)
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

-- Active tenant-org organization_memberships for the current viewer.
-- Runs as view owner (postgres), bypassing RLS; scoped to the caller
-- via viewer_profile_id(). Null uid → no rows (safe for unauthenticated).
-- Used by viewer_tenants/viewer_organizations family below.
drop view if exists public.tenants_organizations_profiles;
create view public.tenants_organizations_profiles as
  select
    t.tenant_id,
    t.tenant_slug,
    t.tenant_name,
    t.tenant_disabled_at,
    t.tenant_created_at,
    t.tenant_updated_at,
    o.organization_id,
    o.tenant_id as organization_tenant_id,
    o.organization_slug,
    o.organization_name,
    o.organization_disabled_at,
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
    and o.organization_disabled_at is null
    and t.tenant_disabled_at is null;

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

create or replace function public.viewer_sessions()
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

create or replace function public.viewer_tenants()
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

create or replace function public.viewer_organizations()
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
    profile_disabled_at is null
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
create policy "tenants update with organization_manage"
  on public.tenants for update
  to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.tenant_id = public.tenants.tenant_id
        and o.organization_id in (select public.viewer_permission_org_ids('organization_manage'))
    )
  );

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
  address_level0_disabled_at timestamptz,
  address_level0_hidden_at timestamptz,
  address_level0_created_at timestamptz not null default current_timestamp,
  address_level0_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id)
);

comment on column public.addresses_level0.address_level0_id is e'ISO 3166-1 alpha-2 country code';

create index if not exists addresses_level0_disabled_at_idx
  on public.addresses_level0 (address_level0_disabled_at)
  where address_level0_disabled_at is not null;
create index if not exists addresses_level0_hidden_at_idx
  on public.addresses_level0 (address_level0_hidden_at)
  where address_level0_hidden_at is not null;
create index if not exists addresses_level0_name_idx
  on public.addresses_level0 (address_level0_name asc nulls last);

drop trigger if exists handle_addresses_level0_updated_at on public.addresses_level0;
create trigger handle_addresses_level0_updated_at
  before update on public.addresses_level0
  for each row execute procedure extensions.moddatetime(address_level0_updated_at);

revoke all on table public.addresses_level0 from anon, authenticated;
grant select on table public.addresses_level0 to anon, authenticated;

alter table public.addresses_level0 enable row level security;

drop policy if exists "Anyone can select addresses_level0." on public.addresses_level0;
create policy "Anyone can select addresses_level0."
  on public.addresses_level0 for select
  using (address_level0_disabled_at is null);

-- ============================================================

create table if not exists public.addresses_level1 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),

  address_level1_name text not null check (length(address_level1_name) <= 100),
  address_level1_disabled_at timestamptz,
  address_level1_hidden_at timestamptz,
  address_level1_created_at timestamptz not null default current_timestamp,
  address_level1_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id, address_level1_id),

  constraint fk_addresses_level1_addresses_level0 foreign key (address_level0_id)
    references public.addresses_level0 (address_level0_id) on delete no action
);

comment on column public.addresses_level1.address_level1_id is e'ISO 3166-2 code';

create index if not exists addresses_level1_disabled_at_idx
  on public.addresses_level1 (address_level1_disabled_at)
  where address_level1_disabled_at is not null;
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

revoke all on table public.addresses_level1 from anon, authenticated;
grant select on table public.addresses_level1 to anon, authenticated;

alter table public.addresses_level1 enable row level security;

drop policy if exists "Anyone can select addresses_level1." on public.addresses_level1;
create policy "Anyone can select addresses_level1."
  on public.addresses_level1 for select
  using (address_level1_disabled_at is null);

-- ============================================================

create table if not exists public.addresses_level2 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),
  address_level2_id text not null check (length(address_level2_id) <= 100),

  address_level2_name text not null check (length(address_level2_name) <= 100),
  address_level2_disabled_at timestamptz,
  address_level2_hidden_at timestamptz,
  address_level2_created_at timestamptz not null default current_timestamp,
  address_level2_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id, address_level1_id, address_level2_id),

  constraint fk_addresses_level2_addresses_level1 foreign key (address_level0_id, address_level1_id)
    references public.addresses_level1 (address_level0_id, address_level1_id) on delete no action
);

comment on column public.addresses_level2.address_level2_id is e'Slug';

create index if not exists addresses_level2_disabled_at_idx
  on public.addresses_level2 (address_level2_disabled_at)
  where address_level2_disabled_at is not null;
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

revoke all on table public.addresses_level2 from anon, authenticated;
grant select on table public.addresses_level2 to anon, authenticated;

alter table public.addresses_level2 enable row level security;

drop policy if exists "Anyone can select addresses_level2." on public.addresses_level2;
create policy "Anyone can select addresses_level2."
  on public.addresses_level2 for select
  using (address_level2_disabled_at is null);

-- ============================================================

create table if not exists public.addresses_level3 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),
  address_level2_id text not null check (length(address_level2_id) <= 100),
  address_level3_id text not null check (length(address_level3_id) <= 100),

  address_level3_name text not null check (length(address_level3_name) <= 100),
  address_level3_disabled_at timestamptz,
  address_level3_hidden_at timestamptz,
  address_level3_created_at timestamptz not null default current_timestamp,
  address_level3_updated_at timestamptz not null default current_timestamp,

  primary key (address_level0_id, address_level1_id, address_level2_id, address_level3_id),

  constraint fk_addresses_level3_addresses_level2 foreign key (address_level0_id, address_level1_id, address_level2_id)
    references public.addresses_level2 (address_level0_id, address_level1_id, address_level2_id) on delete no action
);

create index if not exists addresses_level3_disabled_at_idx
  on public.addresses_level3 (address_level3_disabled_at)
  where address_level3_disabled_at is not null;
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

revoke all on table public.addresses_level3 from anon, authenticated;
grant select on table public.addresses_level3 to anon, authenticated;

alter table public.addresses_level3 enable row level security;

drop policy if exists "Anyone can select addresses_level3." on public.addresses_level3;
create policy "Anyone can select addresses_level3."
  on public.addresses_level3 for select
  using (address_level3_disabled_at is null);

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
  profile_identity_disabled_at timestamptz,
  profile_identity_created_at timestamptz not null default current_timestamp,
  profile_identity_updated_at timestamptz not null default current_timestamp,
  unique (profile_id, address_level0_id, profile_identity_document_kind)
);

create unique index if not exists profile_identities_global_unique_idx
  on public.profile_identities (
    address_level0_id, profile_identity_document_kind, profile_identity_document_value
  ) where profile_identity_disabled_at is null;

create index if not exists profile_identities_profile_idx
  on public.profile_identities (profile_id)
  where profile_identity_disabled_at is null;

drop trigger if exists handle_profile_identities_updated_at on public.profile_identities;
create trigger handle_profile_identities_updated_at
  before update on public.profile_identities
  for each row execute procedure extensions.moddatetime(profile_identity_updated_at);

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
        and profile_identity_disabled_at is null
      limit 1;
      return _result;
    end;
  $$;

grant execute on function public.profile_identity_resolve(text, public.profile_identity_document_kind, text) to anon, authenticated;

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
create or replace function public.viewer_organization_membership_pending()
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
                  and pi.profile_identity_disabled_at is null
                  and pi.address_level0_id = m.organization_membership_invite_address_level0_id
                  and pi.profile_identity_document_kind = m.organization_membership_invite_document_kind
                  and pi.profile_identity_document_value = m.organization_membership_invite_document_value
            )
          );
    end;
  $$;

grant execute on function public.viewer_organization_membership_pending() to authenticated;

-- Accept an invite. Sets profile_id to the calling viewer and stamps accepted_at.
-- Validates that the organization_membership is genuinely pending AND that the caller matches the
-- invite identifier (via viewer_organization_membership_pending). SECURITY DEFINER so it can write
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
        select 1 from public.viewer_organization_membership_pending() vmp
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
        select 1 from public.viewer_organization_membership_pending() vmp
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
    bucket_id in ('profiles', 'organizations')
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

grant select on public.storage_profiles to authenticated, anon;

-- pg_graphql foreign_keys naming is counterintuitive: `local_name` is the field name on
-- the PARENT type (here `profiles`) returning a collection back; `foreign_name` is the
-- field name on this view (`storage_profiles`) returning the single parent row.
comment on view public.storage_profiles is e'@graphql({"primary_key_columns": ["storage_profile_id"], "foreign_keys": [{"local_name": "storage_profiles", "local_columns": ["profile_id"], "foreign_name": "profile", "foreign_schema": "public", "foreign_table": "profiles", "foreign_columns": ["profile_id"]}]})';

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

grant select on public.storage_organizations to authenticated, anon;

comment on view public.storage_organizations is e'@graphql({"primary_key_columns": ["storage_organization_id"], "foreign_keys": [{"local_name": "storage_organizations", "local_columns": ["organization_id"], "foreign_name": "organization", "foreign_schema": "public", "foreign_table": "organizations", "foreign_columns": ["organization_id"]}]})';

-- Sessions: list and revoke the viewer's own auth sessions.
-- Uses security definer to read auth.sessions (not exposed to anon/authenticated).

create or replace function public.viewer_sessions()
  returns table (
    id          uuid,
    user_agent  text,
    ip          text,
    created_at  timestamptz,
    refreshed_at timestamptz,
    not_after   timestamptz
  )
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select
      s.id,
      s.user_agent,
      s.ip::text,
      s.created_at,
      s.refreshed_at,
      s.not_after
    from auth.sessions s
    where s.user_id = auth.uid()
    order by coalesce(s.refreshed_at, s.created_at) desc nulls last;
  $$;

create or replace function public.revoke_session(session_id uuid)
  returns void
  security definer
  language sql
  set search_path to ''
  as $$
    delete from auth.sessions
    where id = revoke_session.session_id
      and user_id = auth.uid();
  $$;
