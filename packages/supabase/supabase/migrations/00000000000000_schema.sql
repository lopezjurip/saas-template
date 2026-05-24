-- Humane schema (prototype phase)
-- Edit this file directly, then run: pnpm db:reset && pnpm generate:types

-- Extensions
create extension if not exists "moddatetime" schema extensions;
create extension if not exists "citext" schema extensions;

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
    and profile_id = (select auth.uid())
  );

-- Storage
insert into storage.buckets (id, name, public)
  values ('profiles', 'profiles', true)
  on conflict do nothing;

update storage.buckets
  set file_size_limit = 5242880  -- 5 MiB
  where id = 'profiles';

-- ============================================================
-- tenants + organizations + memberships + permissions
-- ============================================================
--
-- A `tenant` is the billing / customer relationship (e.g. "Walmart").
-- A tenant has one or more `organizations` — the actual operating units (e.g. "Walmart Chile").
-- Most tenants have exactly one organization that mirrors the tenant.
--
-- Users belong to *organizations* via `public.memberships`. The set of tenants a user can
-- access is derived from the tenants of the organizations they're a member of.
-- The subdomain `{tenant_slug}.humane.cl` routes to the tenant; org switching happens in-app.
--
-- Access control is permission-based (not role-based). Capabilities are atomic slugs in
-- `public.permissions` (e.g. `organization_manage`, `payroll_run`). A grant lives in
-- `public.membership_permissions` for a (org, profile, permission) triple. The reserved
-- slug `*` is the wildcard: anyone who has `(org, profile, '*')` passes every permission
-- check inside that org — convenient for the tenant creator and for any other "full
-- admin" relationship without forcing the catalog to be backfilled when a new permission
-- is added later. `public.permission_presets` is a UX helper (catalog of named bundles
-- to apply in the admin UI); it carries no enforcement.

create table if not exists public.tenants (
  tenant_id serial primary key,
  tenant_slug extensions.citext not null unique check (internal.slug_validate(tenant_slug::text)),
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

create table if not exists public.memberships (
  organization_id int not null references public.organizations (organization_id) on delete cascade,
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  membership_disabled_at timestamptz,
  membership_created_at timestamptz not null default current_timestamp,
  membership_updated_at timestamptz not null default current_timestamp,
  primary key (organization_id, profile_id)
);

create index if not exists memberships_profile_idx
  on public.memberships (profile_id) where membership_disabled_at is null;

drop trigger if exists handle_memberships_updated_at on public.memberships;
create trigger handle_memberships_updated_at
  before update on public.memberships
  for each row execute procedure extensions.moddatetime(membership_updated_at);

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

-- Grants: one row per (membership, permission). Composite FK back to memberships so a
-- deleted membership cascades to all its grants. Cascade from permissions too — deleting
-- a permission slug revokes it everywhere.
create table if not exists public.membership_permissions (
  organization_id int not null,
  profile_id uuid not null,
  permission_id extensions.citext not null
    references public.permissions (permission_id) on delete cascade,
  membership_permission_created_at timestamptz not null default current_timestamp,
  primary key (organization_id, profile_id, permission_id),
  foreign key (organization_id, profile_id)
    references public.memberships (organization_id, profile_id) on delete cascade
);

-- Secondary index for "what orgs grant permission X to this profile?" lookups —
-- the PK ordering (org, profile, permission) is great for "does X have perm Y in org Z"
-- but not for the cross-org scan that RLS subqueries do.
create index if not exists membership_permissions_profile_permission_idx
  on public.membership_permissions (profile_id, permission_id);

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
  ('*',                    'Comodín: cubre cualquier permiso dentro de la organización (uso típico: fundador).'),
  ('organization_manage',  'Editar nombre, configuración y dominios del tenant/organización.'),
  ('members_manage',       'Invitar, remover y reasignar permisos a miembros.'),
  ('presets_manage',       'Crear/editar permission_presets de la organización.'),
  ('payroll_run',          'Ejecutar el ciclo mensual de nómina y emitir liquidaciones.'),
  ('payroll_view',         'Ver liquidaciones y datos de nómina del equipo.'),
  ('vacations_approve',    'Aprobar o rechazar solicitudes de vacaciones.'),
  ('vacations_request',    'Solicitar vacaciones para uno mismo.'),
  ('terminations_create',  'Crear finiquitos.'),
  ('previred_export',      'Exportar archivo Previred.'),
  ('lre_export',           'Exportar Libro de Remuneraciones Electrónico.'),
  ('banco_export',         'Exportar nómina bancaria (Shinkansen u otra).')
on conflict (permission_id) do nothing;

-- Seed global presets (organization_id IS NULL → visibles para cualquier tenant).
insert into public.permission_presets (organization_id, permission_preset_name, permission_preset_slugs) values
  (null, 'Dueño',     array['*']::extensions.citext[]),
  (null, 'Contadora', array[
    'payroll_run','payroll_view','previred_export','lre_export','banco_export','terminations_create'
  ]::extensions.citext[]),
  (null, 'Manager',   array['payroll_view','vacations_approve']::extensions.citext[]),
  (null, 'Empleado',  array['vacations_request']::extensions.citext[])
on conflict do nothing;

-- ============================================================
-- concierge (global internal role, separate from per-org permissions)
-- ============================================================

create table if not exists protected.concierges (
  concierge_id uuid not null primary key default internal.uuid_generate_v7(),
  profile_id uuid not null unique references public.profiles (profile_id) on delete cascade,
  concierge_disabled_at timestamptz,
  concierge_created_at timestamptz not null default current_timestamp,
  concierge_updated_at timestamptz not null default current_timestamp
);

grant select, insert, update, delete on protected.concierges to service_role;

drop trigger if exists handle_concierges_updated_at on protected.concierges;
create trigger handle_concierges_updated_at
  before update on protected.concierges
  for each row execute procedure extensions.moddatetime(concierge_updated_at);

-- ============================================================
-- webauthn (passkeys)
-- ============================================================
-- Custom SimpleWebAuthn-backed implementation. Two tables:
--   webauthn_challenges  : transient challenges; one per profile during registration,
--                          NULL profile_id for anonymous sign-in challenges.
--   webauthn_credentials : persistent passkeys per profile.
-- The sign-in flow runs anonymously and goes through service-role; the registration
-- flow runs as the authenticated user. RLS is locked down so anon/authenticated
-- cannot touch challenges directly — only the credentials they own.

-- WebAuthn columns are stored as `text` (not enum) because some spec literals
-- contain hyphens (e.g. credential type `'public-key'`), which pg_graphql
-- rejects as enum value names — see CLAUDE.md "No hyphens in SQL identifiers
-- or enum values". `check` constraints preserve enum-like safety at the DB.

create table if not exists public.webauthn_challenges (
  webauthn_challenge_id uuid not null primary key default internal.uuid_generate_v7(),
  profile_id uuid references public.profiles (profile_id) on delete cascade,
  webauthn_challenge_value text not null unique,
  webauthn_challenge_created_at timestamptz not null default current_timestamp,
  -- One registration challenge per profile. Postgres treats NULLs as distinct, so
  -- many anonymous sign-in challenges can coexist while each user has at most one
  -- pending registration challenge (upserts on profile_id).
  unique (profile_id)
);

create index if not exists webauthn_challenges_created_at_idx
  on public.webauthn_challenges (webauthn_challenge_created_at);

create table if not exists public.webauthn_credentials (
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

create index if not exists webauthn_credentials_profile_idx
  on public.webauthn_credentials (profile_id);

drop trigger if exists handle_webauthn_credentials_updated_at on public.webauthn_credentials;
create trigger handle_webauthn_credentials_updated_at
  before update on public.webauthn_credentials
  for each row execute procedure extensions.moddatetime(webauthn_credential_updated_at);

alter table public.webauthn_challenges enable row level security;
alter table public.webauthn_credentials enable row level security;

-- Challenges: authenticated users can manage their own (registration flow).
-- Anonymous sign-in challenges (profile_id IS NULL) go through service-role only
-- (RLS does not apply to service-role).
drop policy if exists "webauthn_challenges select own" on public.webauthn_challenges;
create policy "webauthn_challenges select own"
  on public.webauthn_challenges for select
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists "webauthn_challenges insert own" on public.webauthn_challenges;
create policy "webauthn_challenges insert own"
  on public.webauthn_challenges for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

drop policy if exists "webauthn_challenges update own" on public.webauthn_challenges;
create policy "webauthn_challenges update own"
  on public.webauthn_challenges for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists "webauthn_challenges delete own" on public.webauthn_challenges;
create policy "webauthn_challenges delete own"
  on public.webauthn_challenges for delete
  to authenticated
  using (profile_id = (select auth.uid()));

-- Credentials: users see and manage only their own.
drop policy if exists "webauthn_credentials select own" on public.webauthn_credentials;
create policy "webauthn_credentials select own"
  on public.webauthn_credentials for select
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists "webauthn_credentials insert own" on public.webauthn_credentials;
create policy "webauthn_credentials insert own"
  on public.webauthn_credentials for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

drop policy if exists "webauthn_credentials update own" on public.webauthn_credentials;
create policy "webauthn_credentials update own"
  on public.webauthn_credentials for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists "webauthn_credentials delete own" on public.webauthn_credentials;
create policy "webauthn_credentials delete own"
  on public.webauthn_credentials for delete
  to authenticated
  using (profile_id = (select auth.uid()));

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
      join public.webauthn_credentials c on c.profile_id = u.id
      where lower(u.email) = lower(email_to_check)
    );
  $$;

grant execute on function public.email_has_passkey(text) to anon, authenticated;

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
--   viewer_is_concierge                 : true iff caller has the global concierge claim
--
-- Permissions (DB lookup — `security definer` to bypass recursive RLS):
--   viewer_permission_org_ids(perm)     : setof org_id where the caller has `perm` OR `*`
--   viewer_has_permission(org, perm)    : boolean shortcut for a single (org, perm) check
--   viewer_membership_permissions()     : setof (org_id, permission_id) — for UI listing
--
-- Convenience over the join:
--   tenants_organizations_profiles (view)  : active tenant-org memberships for the viewer
--   viewer_tenants() / viewer_organizations() / viewer_tenant_by_id() / viewer_organization_by_id()

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
      _user_id := auth.uid();
      return query
        select * from public.profiles
        where profile_id = _user_id and profile_disabled_at is null
        limit 1;
      if not found and $1 is true then
        raise exception 'Not logged-in or profile not found for user_id: %', _user_id;
      end if;
    end;
  $$;

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
        raise exception 'Not logged-in';
      end if;
      return _user_id;
    end;
  $$;

create or replace function public.viewer_tenant_ids()
  returns setof int
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select (t->>'id')::int
    from jsonb_array_elements(
      coalesce(
        nullif(current_setting('request.jwt.claims', true), '')::jsonb
          -> 'app_metadata' -> 'tenants',
        '[]'::jsonb
      )
    ) as t;
  $$;

create or replace function public.viewer_tenant_validate(target_tenant_id int)
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1
      from jsonb_array_elements(
        coalesce(
          nullif(current_setting('request.jwt.claims', true), '')::jsonb
            -> 'app_metadata' -> 'tenants',
          '[]'::jsonb
        )
      ) as t
      where (t->>'id')::int = target_tenant_id
    );
  $$;

create or replace function public.viewer_organization_ids()
  returns setof int
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select (o->>'id')::int
    from jsonb_array_elements(
      coalesce(
        nullif(current_setting('request.jwt.claims', true), '')::jsonb
          -> 'app_metadata' -> 'organizations',
        '[]'::jsonb
      )
    ) as o;
  $$;

create or replace function public.viewer_organization_validate(target_organization_id int)
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1
      from jsonb_array_elements(
        coalesce(
          nullif(current_setting('request.jwt.claims', true), '')::jsonb
            -> 'app_metadata' -> 'organizations',
          '[]'::jsonb
        )
      ) as o
      where (o->>'id')::int = target_organization_id
    );
  $$;

-- Permission-based RLS helpers. SECURITY DEFINER so they bypass RLS on
-- membership_permissions itself (otherwise SELECT-RLS on the very table we're checking
-- could deadlock the logic). Both return wildcard-aware results: an `(org, profile, '*')`
-- grant satisfies every permission check inside that org.

create or replace function public.viewer_permission_org_ids(target_permission_id extensions.citext)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct organization_id
    from public.membership_permissions
    where profile_id = (select auth.uid())
      and (permission_id = target_permission_id or permission_id = '*');
  $$;

create or replace function public.viewer_has_permission(
  target_organization_id int,
  target_permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1 from public.membership_permissions
      where organization_id = target_organization_id
        and profile_id = (select auth.uid())
        and (permission_id = target_permission_id or permission_id = '*')
    );
  $$;

create or replace function public.viewer_membership_permissions()
  returns table (organization_id int, permission_id extensions.citext)
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select mp.organization_id, mp.permission_id
    from public.membership_permissions mp
    where mp.profile_id = (select auth.uid());
  $$;

create or replace function public.viewer_is_concierge()
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select coalesce(
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb
        -> 'app_metadata' ->> 'is_concierge')::boolean,
      false
    );
  $$;

-- Active tenant-org memberships for the current viewer.
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
  from public.memberships m
  join public.organizations o using (organization_id)
  join public.tenants t using (tenant_id)
  where m.profile_id = public.viewer_profile_id()
    and m.membership_disabled_at is null
    and o.organization_disabled_at is null
    and t.tenant_disabled_at is null;

revoke all on public.tenants_organizations_profiles from anon, authenticated;
grant select on public.tenants_organizations_profiles to authenticated;

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

create or replace function public.viewer_tenant_by_id(target_tenant_id int)
  returns setof public.tenants rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select t.*
    from public.tenants t
    where t.tenant_id = target_tenant_id
      and t.tenant_id in (select tenant_id from public.tenants_organizations_profiles)
    limit 1;
  $$;

create or replace function public.viewer_organization_by_id(target_organization_id int)
  returns setof public.organizations rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select o.*
    from public.organizations o
    where o.organization_id = target_organization_id
      and o.organization_id in (select organization_id from public.tenants_organizations_profiles)
    limit 1;
  $$;

-- ============================================================
-- profiles SELECT policy (now that memberships exists)
-- ============================================================
-- Profiles are visible to: self, organization co-members, and concierge.

drop policy if exists "Users can select their own profiles." on public.profiles;
drop policy if exists "Profiles visible to self or tenant co-members or concierge" on public.profiles;
drop policy if exists "Profiles visible to self or org co-members or concierge" on public.profiles;
create policy "Profiles visible to self or org co-members or concierge"
  on public.profiles for select
  to authenticated
  using (
    profile_disabled_at is null
    and (
      profile_id = (select auth.uid())
      or exists (
        select 1
        from public.memberships me
        join public.memberships them using (organization_id)
        where me.profile_id = (select auth.uid())
          and them.profile_id = public.profiles.profile_id
          and me.membership_disabled_at is null
          and them.membership_disabled_at is null
      )
      or public.viewer_is_concierge()
    )
  );

-- ============================================================
-- RLS policies for tenants + organizations + memberships + permissions
-- ============================================================

alter table public.tenants enable row level security;

revoke all on table public.tenants from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, update on table public.tenants to anon, authenticated;

drop policy if exists "tenants select by members or concierge" on public.tenants;
create policy "tenants select by members or concierge"
  on public.tenants for select
  to authenticated
  using (
    tenant_id in (select public.viewer_tenant_ids())
    or public.viewer_is_concierge()
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

drop policy if exists "organizations select by members or concierge" on public.organizations;
create policy "organizations select by members or concierge"
  on public.organizations for select
  to authenticated
  using (
    organization_id in (select public.viewer_organization_ids())
    or public.viewer_is_concierge()
  );

drop policy if exists "organizations update by owner" on public.organizations;
drop policy if exists "organizations update with organization_manage" on public.organizations;
create policy "organizations update with organization_manage"
  on public.organizations for update
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('organization_manage')));

-- INSERT/DELETE on organizations: service_role only. No authenticated policy -> default deny.

alter table public.memberships enable row level security;

revoke all on table public.memberships from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, insert, update, delete on table public.memberships to anon, authenticated;

drop policy if exists "memberships select by co-members" on public.memberships;
create policy "memberships select by co-members"
  on public.memberships for select
  to authenticated
  using (
    organization_id in (select public.viewer_organization_ids())
    or public.viewer_is_concierge()
  );

drop policy if exists "memberships write with members_manage" on public.memberships;
create policy "memberships write with members_manage"
  on public.memberships for all
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

drop policy if exists "permissions select to all authenticated" on public.permissions;
create policy "permissions select to all authenticated"
  on public.permissions for select
  to authenticated
  using (true);

-- ============================================================
-- RLS for membership_permissions
-- ============================================================

alter table public.membership_permissions enable row level security;

revoke all on table public.membership_permissions from anon, authenticated;
grant select, insert, update, delete on table public.membership_permissions to anon, authenticated;

-- Co-members in the same organization can see the grants in that organization.
drop policy if exists "membership_permissions select by co-members" on public.membership_permissions;
create policy "membership_permissions select by co-members"
  on public.membership_permissions for select
  to authenticated
  using (
    organization_id in (select public.viewer_organization_ids())
    or public.viewer_is_concierge()
  );

-- Only users with `members_manage` in the organization can grant/revoke.
drop policy if exists "membership_permissions write with members_manage" on public.membership_permissions;
create policy "membership_permissions write with members_manage"
  on public.membership_permissions for all
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('members_manage')))
  with check (organization_id in (select public.viewer_permission_org_ids('members_manage')));

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

drop policy if exists "permission_presets select globals or own org" on public.permission_presets;
create policy "permission_presets select globals or own org"
  on public.permission_presets for select
  to authenticated
  using (
    organization_id is null
    or organization_id in (select public.viewer_organization_ids())
    or public.viewer_is_concierge()
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
-- Injects two JWT arrays into the token when issued:
--   app_metadata.tenants       : [{id, slug}]       — distinct tenants the user has any org membership in
--   app_metadata.organizations : [{id}]             — every organization the user is a member of
-- Plus app_metadata.is_concierge (global internal role) and app_metadata.onboarded (gate).
-- Permissions are deliberately NOT included in the JWT — a single user may have many
-- per-org permissions, and putting them here can balloon cookie size past the 4KB limit.
-- Permission checks happen at query time via viewer_has_permission / viewer_permission_org_ids,
-- which hit the indexed membership_permissions table.
-- Lives in `public`, NOT security definer — supabase_auth_admin gets direct grants
-- + permissive SELECT policies on the source tables (pattern from sibling project).

create or replace function public.user_auth_hook(event jsonb)
  returns jsonb
  language plpgsql
  stable
  parallel safe
  set search_path to ''
  as $$
    declare
      _claims jsonb;
      _user_id uuid;
      _tenants jsonb;
      _organizations jsonb;
      _is_concierge boolean;
      _onboarded boolean;
    begin
      _claims := event->'claims';
      _user_id := nullif(event->>'user_id', '')::uuid;

      if jsonb_typeof(_claims->'app_metadata') is null then
        _claims := jsonb_set(_claims, '{app_metadata}', '{}'::jsonb);
      end if;

      if _user_id is not null then
        select coalesce(jsonb_agg(distinct jsonb_build_object(
          'id', t.tenant_id,
          'slug', t.tenant_slug::text
        )), '[]'::jsonb)
        into _tenants
        from public.memberships m
        join public.organizations o using (organization_id)
        join public.tenants t using (tenant_id)
        where m.profile_id = _user_id
          and m.membership_disabled_at is null
          and o.organization_disabled_at is null
          and t.tenant_disabled_at is null;

        select coalesce(jsonb_agg(jsonb_build_object(
          'id', m.organization_id
        )), '[]'::jsonb)
        into _organizations
        from public.memberships m
        join public.organizations o using (organization_id)
        join public.tenants t using (tenant_id)
        where m.profile_id = _user_id
          and m.membership_disabled_at is null
          and o.organization_disabled_at is null
          and t.tenant_disabled_at is null;

        select exists (
          select 1 from protected.concierges c
          where c.profile_id = _user_id
            and c.concierge_disabled_at is null
        ) into _is_concierge;

        select coalesce(p.profile_onboarded_at is not null, false)
        into _onboarded
        from public.profiles p
        where p.profile_id = _user_id;

        _onboarded := coalesce(_onboarded, false);
      else
        _tenants := '[]'::jsonb;
        _organizations := '[]'::jsonb;
        _is_concierge := false;
        _onboarded := false;
      end if;

      _claims := jsonb_set(_claims, '{app_metadata,tenants}', _tenants);
      _claims := jsonb_set(_claims, '{app_metadata,organizations}', _organizations);
      _claims := jsonb_set(_claims, '{app_metadata,is_concierge}', to_jsonb(_is_concierge));
      _claims := jsonb_set(_claims, '{app_metadata,onboarded}', to_jsonb(_onboarded));

      event := jsonb_set(event, '{claims}', _claims);
      return event;
    end;
  $$;

revoke execute on function public.user_auth_hook(jsonb) from authenticated, anon, public;
grant execute on function public.user_auth_hook(jsonb) to supabase_auth_admin;

-- Hook is not security definer; grant supabase_auth_admin direct read on source tables.
grant usage on schema public, protected to supabase_auth_admin;
grant select on table public.tenants, public.organizations, public.memberships, protected.concierges to supabase_auth_admin;
grant select (profile_id, profile_onboarded_at) on public.profiles to supabase_auth_admin;

drop policy if exists "Allow auth admin to read tenants." on public.tenants;
create policy "Allow auth admin to read tenants."
  on public.tenants as permissive for select to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin to read organizations." on public.organizations;
create policy "Allow auth admin to read organizations."
  on public.organizations as permissive for select to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin to read memberships." on public.memberships;
create policy "Allow auth admin to read memberships."
  on public.memberships as permissive for select to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin to read concierge_users." on protected.concierges;
drop policy if exists "Allow auth admin to read concierges." on protected.concierges;
create policy "Allow auth admin to read concierges."
  on protected.concierges as permissive for select to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin to read profile onboarding state." on public.profiles;
create policy "Allow auth admin to read profile onboarding state."
  on public.profiles as permissive for select to supabase_auth_admin using (true);

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
