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

-- internal: callable from security definer functions (which run as postgres)
grant usage on schema internal to postgres;

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
    unix_ts_ms bytea;
    uuid_bytes bytea;
  begin
    unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
    uuid_bytes = uuid_send(gen_random_uuid());
    uuid_bytes = overlay(uuid_bytes placing unix_ts_ms from 1 for 6);
    uuid_bytes = set_byte(uuid_bytes, 6, (b'0111' || get_byte(uuid_bytes, 6)::bit(4))::bit(8)::int);
    return encode(uuid_bytes, 'hex')::uuid;
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

grant execute on function public.email_exists(text) to anon, authenticated;

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

grant execute on function public.health_current_timestamp() to anon, authenticated;

-- ============================================================
-- profiles
-- ============================================================

create table if not exists public.profiles (
  profile_id uuid not null primary key references auth.users on delete cascade,
  profile_name_full text check (char_length(profile_name_full) <= 256),
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
-- tenants + organizations + memberships
-- ============================================================
--
-- A `tenant` is the billing / customer relationship (e.g. "Walmart").
-- A tenant has one or more `organizations` — the actual operating units (e.g. "Walmart Chile").
-- Most tenants have exactly one organization that mirrors the tenant.
--
-- Users belong to *organizations*, not directly to tenants. The set of tenants a user can
-- access is derived from the tenants of the organizations they're a member of.
-- The subdomain `{tenant_slug}.humane.cl` routes to the tenant; org switching happens in-app.

-- Role at the organization level. Concierge (global internal role) lives in protected.concierge_users.
do $$ begin
  create type public.organization_member_role as enum ('employee', 'manager', 'accountant', 'owner');
exception when duplicate_object then null; end $$;

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

create table if not exists public.organization_members (
  organization_id int not null references public.organizations (organization_id) on delete cascade,
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  organization_member_role public.organization_member_role not null,
  organization_member_disabled_at timestamptz,
  organization_member_created_at timestamptz not null default current_timestamp,
  organization_member_updated_at timestamptz not null default current_timestamp,
  primary key (organization_id, profile_id)
);

create index if not exists organization_members_profile_idx
  on public.organization_members (profile_id) where organization_member_disabled_at is null;
create index if not exists organization_members_org_role_idx
  on public.organization_members (organization_id, organization_member_role)
  where organization_member_disabled_at is null;

drop trigger if exists handle_organization_members_updated_at on public.organization_members;
create trigger handle_organization_members_updated_at
  before update on public.organization_members
  for each row execute procedure extensions.moddatetime(organization_member_updated_at);

-- ============================================================
-- concierge (global internal role, separate from per-tenant roles)
-- ============================================================

create table if not exists protected.concierge_users (
  concierge_user_id uuid not null primary key default internal.uuid_generate_v7(),
  profile_id uuid not null unique references public.profiles (profile_id) on delete cascade,
  concierge_user_disabled_at timestamptz,
  concierge_user_created_at timestamptz not null default current_timestamp,
  concierge_user_updated_at timestamptz not null default current_timestamp
);

grant select, insert, update, delete on protected.concierge_users to service_role;

drop trigger if exists handle_concierge_users_updated_at on protected.concierge_users;
create trigger handle_concierge_users_updated_at
  before update on protected.concierge_users
  for each row execute procedure extensions.moddatetime(concierge_user_updated_at);

-- ============================================================
-- viewer_* helpers
-- ============================================================
-- These are the RLS / app-layer API for "who is the caller".
-- viewer_profile / viewer_profile_id           : current user's profile
-- viewer_tenant_ids                            : tenants the caller has access to (from JWT)
-- viewer_tenant_validate(tenant)               : true iff caller belongs to any org in this tenant
-- viewer_organization_ids                      : organizations the caller is a member of (from JWT)
-- viewer_organization_validate(org, roles)     : true iff caller is a member of `org`, optionally role-restricted
-- viewer_is_concierge                          : true iff caller has the global concierge claim
-- tenants_organizations_profiles (view)        : active tenant-org memberships for the current viewer
-- viewer_tenants()                             : setof public.tenants the viewer has access to
-- viewer_organizations()                       : setof public.organizations the viewer is a member of
-- viewer_tenant_by_id(id)                      : single tenant by id if the viewer has access
-- viewer_organization_by_id(id)                : single organization by id if the viewer has access

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

create or replace function public.viewer_organization_validate(
  target_organization_id int,
  required_roles public.organization_member_role[] default null
)
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
        and (
          required_roles is null
          or (o->>'role')::public.organization_member_role = any (required_roles)
        )
    );
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

grant execute on function public.viewer_profile(boolean) to authenticated;
grant execute on function public.viewer_profile_id(boolean) to authenticated;
grant execute on function public.viewer_tenant_ids() to authenticated;
grant execute on function public.viewer_tenant_validate(int) to authenticated;
grant execute on function public.viewer_organization_ids() to authenticated;
grant execute on function public.viewer_organization_validate(int, public.organization_member_role[]) to authenticated;
grant execute on function public.viewer_is_concierge() to authenticated;

-- Active tenant-org memberships for the current viewer.
-- Runs as view owner (postgres), bypassing RLS; scoped to the caller
-- via viewer_profile_id(). Null uid → no rows (safe for unauthenticated).
-- Used by viewer_tenants/viewer_organizations family below.
create or replace view public.tenants_organizations_profiles as
  select
    t.tenant_id,
    t.tenant_slug,
    t.tenant_name,
    t.tenant_disabled_at,
    t.tenant_created_at,
    t.tenant_updated_at,
    o.organization_id,
    o.tenant_id             as organization_tenant_id,
    o.organization_slug,
    o.organization_name,
    o.organization_disabled_at,
    o.organization_created_at,
    o.organization_updated_at,
    om.profile_id,
    om.organization_member_role
  from public.organization_members om
  join public.organizations o on o.organization_id = om.organization_id
  join public.tenants t on t.tenant_id = o.tenant_id
  where om.profile_id = public.viewer_profile_id()
    and om.organization_member_disabled_at is null
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

grant execute on function public.viewer_tenants() to authenticated;
grant execute on function public.viewer_organizations() to authenticated;
grant execute on function public.viewer_tenant_by_id(int) to authenticated;
grant execute on function public.viewer_organization_by_id(int) to authenticated;

-- ============================================================
-- profiles SELECT policy (now that organization_members exists)
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
        from public.organization_members me
        join public.organization_members them on them.organization_id = me.organization_id
        where me.profile_id = (select auth.uid())
          and them.profile_id = public.profiles.profile_id
          and me.organization_member_disabled_at is null
          and them.organization_member_disabled_at is null
      )
      or public.viewer_is_concierge()
    )
  );

-- ============================================================
-- RLS policies for tenants + organizations + organization_members
-- ============================================================

alter table public.tenants enable row level security;

drop policy if exists "tenants select by members or concierge" on public.tenants;
create policy "tenants select by members or concierge"
  on public.tenants for select
  to authenticated
  using (
    public.viewer_tenant_validate(tenant_id)
    or public.viewer_is_concierge()
  );

drop policy if exists "tenants update by owner" on public.tenants;
create policy "tenants update by owner"
  on public.tenants for update
  to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.tenant_id = public.tenants.tenant_id
        and public.viewer_organization_validate(o.organization_id, array['owner']::public.organization_member_role[])
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.tenant_id = public.tenants.tenant_id
        and public.viewer_organization_validate(o.organization_id, array['owner']::public.organization_member_role[])
    )
  );

-- INSERT/DELETE on tenants: service_role only. No authenticated policy -> default deny.

alter table public.organizations enable row level security;

drop policy if exists "organizations select by members or concierge" on public.organizations;
create policy "organizations select by members or concierge"
  on public.organizations for select
  to authenticated
  using (
    public.viewer_organization_validate(organization_id)
    or public.viewer_is_concierge()
  );

drop policy if exists "organizations update by owner" on public.organizations;
create policy "organizations update by owner"
  on public.organizations for update
  to authenticated
  using (public.viewer_organization_validate(organization_id, array['owner']::public.organization_member_role[]))
  with check (public.viewer_organization_validate(organization_id, array['owner']::public.organization_member_role[]));

-- INSERT/DELETE on organizations: service_role only. No authenticated policy -> default deny.

alter table public.organization_members enable row level security;

drop policy if exists "organization_members select by co-members" on public.organization_members;
create policy "organization_members select by co-members"
  on public.organization_members for select
  to authenticated
  using (
    public.viewer_organization_validate(organization_id)
    or public.viewer_is_concierge()
  );

drop policy if exists "organization_members insert by accountant/owner" on public.organization_members;
create policy "organization_members insert by accountant/owner"
  on public.organization_members for insert
  to authenticated
  with check (public.viewer_organization_validate(organization_id, array['accountant','owner']::public.organization_member_role[]));

drop policy if exists "organization_members update by accountant/owner" on public.organization_members;
create policy "organization_members update by accountant/owner"
  on public.organization_members for update
  to authenticated
  using (public.viewer_organization_validate(organization_id, array['accountant','owner']::public.organization_member_role[]))
  with check (public.viewer_organization_validate(organization_id, array['accountant','owner']::public.organization_member_role[]));

drop policy if exists "organization_members delete by owner" on public.organization_members;
create policy "organization_members delete by owner"
  on public.organization_members for delete
  to authenticated
  using (public.viewer_organization_validate(organization_id, array['owner']::public.organization_member_role[]));

-- ============================================================
-- Custom access token hook
-- ============================================================
-- Injects two JWT arrays into the token when issued:
--   app_metadata.tenants       : [{id, slug}]       — distinct tenants the user has any org membership in
--   app_metadata.organizations : [{id, role}]       — every organization the user is a member of
-- Plus app_metadata.is_concierge (global internal role) and app_metadata.onboarded (gate).
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
        from public.organization_members om
        join public.organizations o on o.organization_id = om.organization_id
        join public.tenants t on t.tenant_id = o.tenant_id
        where om.profile_id = _user_id
          and om.organization_member_disabled_at is null
          and o.organization_disabled_at is null
          and t.tenant_disabled_at is null;

        select coalesce(jsonb_agg(jsonb_build_object(
          'id', om.organization_id,
          'role', om.organization_member_role
        )), '[]'::jsonb)
        into _organizations
        from public.organization_members om
        join public.organizations o on o.organization_id = om.organization_id
        join public.tenants t on t.tenant_id = o.tenant_id
        where om.profile_id = _user_id
          and om.organization_member_disabled_at is null
          and o.organization_disabled_at is null
          and t.tenant_disabled_at is null;

        select exists (
          select 1 from protected.concierge_users cu
          where cu.profile_id = _user_id
            and cu.concierge_user_disabled_at is null
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
grant select on table public.tenants, public.organizations, public.organization_members, protected.concierge_users to supabase_auth_admin;
grant select (profile_id, profile_onboarded_at) on public.profiles to supabase_auth_admin;

drop policy if exists "Allow auth admin to read tenants." on public.tenants;
create policy "Allow auth admin to read tenants."
  on public.tenants as permissive for select to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin to read organizations." on public.organizations;
create policy "Allow auth admin to read organizations."
  on public.organizations as permissive for select to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin to read tenant_members." on public.organization_members;
drop policy if exists "Allow auth admin to read organization_members." on public.organization_members;
create policy "Allow auth admin to read organization_members."
  on public.organization_members as permissive for select to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin to read concierge_users." on protected.concierge_users;
create policy "Allow auth admin to read concierge_users."
  on protected.concierge_users as permissive for select to supabase_auth_admin using (true);

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
