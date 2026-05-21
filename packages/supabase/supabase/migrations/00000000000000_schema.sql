-- Humane schema (prototype phase)
-- Edit this file directly, then run: pnpm db:reset && pnpm generate:types

-- Extensions
create extension if not exists "moddatetime" schema extensions;

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
revoke usage on schema private   from public;
revoke usage on schema internal  from public;
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

-- ============================================================
-- profiles
-- ============================================================

create table if not exists public.profiles (
  profile_id          uuid        not null primary key references auth.users on delete cascade,
  profile_name_full   text        check (char_length(profile_name_full) <= 256),
  profile_disabled_at timestamptz,
  profile_created_at  timestamptz not null default current_timestamp,
  profile_updated_at  timestamptz not null default current_timestamp
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

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "Users can select their own profiles." on public.profiles;
create policy "Users can select their own profiles."
  on public.profiles for select
  to authenticated
  using (
    profile_disabled_at is null
    and profile_id = (select auth.uid())
  );

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
