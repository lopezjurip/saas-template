---
name: my-supabase
description: Repository-specific Supabase Postgres schema, multi-tenancy, RLS, SQL naming, functions, triggers, storage, seed, and pgTAP workflow.
---

# Supabase SQL

Source of truth:

```text
packages/supabase/supabase/migrations/00000000000000_schema.sql
```

Prototype workflow: edit this file directly, then `pnpm db:reset`. Never `DROP ... CASCADE`.

## Core model

```sql
tenants(
  tenant_id serial,
  tenant_slug citext,
  tenant_name text
)

organizations(
  organization_id serial,
  tenant_id int,
  organization_slug citext,
  organization_name text
)

organization_memberships(
  organization_membership_id serial,
  organization_id int,
  profile_id uuid,
  organization_membership_accepted_at timestamptz,
  organization_membership_rejected_at timestamptz,
  organization_membership_revoked_at timestamptz,
  ...
)
```

Tenant-scoped product tables carry `tenant_id int`; org-scoped tables also carry
`organization_id int`. Use indexed filters plus RLS.

## Naming

- `snake_case` only.
- No hyphens in identifiers or enum values. pg_graphql can lose whole schema.
- External spec hyphen literal: `text` + `check`, not enum.
- PK/columns use semantic prefixes already present (`tenant_id`, `profile_created_at`).
- `timestamptz`, not timestamp without timezone.
- plpgsql locals start `_`.
- Pure SQL/TS helpers follow repository uppercase convention where applicable.

## RLS

Every exposed table:

```sql
alter table public.example enable row level security;
revoke all on table public.example from anon, authenticated;
grant select, insert, update, delete
  on table public.example to anon, authenticated;
```

`anon` grants may be needed for GraphQL schema visibility. RLS still gates rows.

Prefer viewer helpers:

```sql
tenant_id in (select public.viewer_tenant_ids())
organization_id in (select public.viewer_organization_ids())
organization_id in (
  select public.viewer_permission_org_ids('members_manage')
)
```

Do not parse JWT ad hoc in each policy. Do not rely on app filtering.

## Security-definer functions

Use `set search_path to ''` and schema-qualify objects:

```sql
create or replace function public.example(...)
returns ...
security definer
language sql
set search_path to ''
as $$
  select ... from public.table_name;
$$;
```

Grant execute narrowly. Review privilege escalation and recursive RLS.

For a mutation that creates one table row, return the complete composite row:

```sql
create or replace function protected.tenant_create(
  profile_id uuid,
  tenant_slug text,
  tenant_name text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    -- Perform the complete transactional workflow.
  $$;

create or replace function public.viewer_tenant_create(
  tenant_slug text,
  tenant_name text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select tenant.*
    from protected.tenant_create(
      public.viewer_profile_id(true),
      $1,
      $2
    ) tenant;
  $$;
```

- `protected.*_create(profile_id, ...)` owns the transaction and is the single source of truth.
- `public.viewer_*_create(...)` only resolves the current profile and delegates.
- Declare mutation functions explicitly `volatile`.
- Use `returns setof public.<table> rows 1`, not a scalar ID. Supabase types preserve the
  complete row and mark the result one-to-one.
- Revoke protected execution from `public`; grant it only to trusted server roles.
- Grant the viewer wrapper to `anon, authenticated` when pg_graphql needs anon visibility.

## plpgsql style

Prefer `if / elsif` over consecutive `if … end if; if … end if;` blocks. Consecutive guards
waste lines and force the reader to scan more `end if`s. Chain with `elsif`, or combine with `or`
when the body is identical:

```sql
-- ❌ Two separate blocks
if public.viewer_profile_id() is null then
  return old;
end if;
if old.permission_id not in ('members_manage', '*') then
  return old;
end if;

-- ✅ Single block, elsif
if public.viewer_profile_id() is null then
  return old;
elsif old.permission_id not in ('members_manage', '*') then
  return old;
end if;

-- ✅ Same action → combine with `or`
if old.organization_membership_revoked_at is not null or new.organization_membership_revoked_at is null then
  return new;
end if;
```

## Multi-step DB writes must be a single RPC

Never sequence multiple `.from().insert()` / `.update()` for one logical operation — each call is
its own round-trip and transaction; a crash or race between them leaves the DB partial. Write one
`security definer` plpgsql function doing read-check + write atomically, call via `.rpc()`.

- DB mutations (insert, update, upsert, permission checks) → SQL RPC, `security definer`.
- External side effects (`auth.admin.*`, GoTrue user creation, email send) → stay in the action; can't be transactional.
- RPCs raise with a stable locale key as the message; the action matches `rpcError.message` against
  LOCALES keys — never parse prose:
  ```sql
  raise exception 'already_member' using errcode = 'P0001';
  ```

**Client choice** (which client calls the RPC):
- **Service-role client** — RPCs requiring `caller_id` passed explicitly (service role has no JWT `sub`).
- **Authenticated server client** — RPCs calling `viewer_profile_id()` internally (e.g. `actionRespondInvitation`).
- **`useGraphyMutation` from the client component — DEFAULT for viewer-scoped mutations.** If the whole
  workflow is transactional SQL, calls `viewer_*` internally, and needs no server-only API/secret,
  expose it through pg_graphql and call it as a GraphQL mutation. Do NOT wrap it in a pass-through
  Server Action. (GraphQL exposure + return shape: see `my-graphql`.)

## pg_graphql computed relationships

Use a computed relationship to expose a related row as a single object field on a parent type,
avoiding an extra SDK call. pg_graphql detects functions whose first argument is a row type.

```sql
create or replace function public.profile_identity(this public.profiles)
  returns setof public.profile_identities rows 1
  stable
  strict
  security invoker
  parallel safe
  language sql
  set search_path to ''
as $$
  select *
  from public.profile_identities
  where profile_id = this.profile_id
    and profile_identity_disabled_at is null
  limit 1;
$$;

grant execute on function public.profile_identity(public.profiles) to anon, authenticated;
```

Works equally well for views — if the target is a `security_invoker` view (e.g. `storage_profiles`),
the view's own RLS applies through the caller. Example: `profile_avatar` returns the latest avatar
from the `storage_profiles` view with `folder = 'avatar' order by created_at desc limit 1`,
replacing a verbose connection query (`edges[0].node.src`) with a plain object field (`avatar { src }`).

Key attributes:
- `rows 1` — tells pg_graphql to expose the result as a single object (not a connection).
- `strict` — returns NULL automatically when `this` is NULL; no defensive null-check needed.
- `security invoker` — runs as the calling user so RLS on the target table still applies; prefer over `security definer` unless you explicitly need to bypass RLS.
- `parallel safe` — lets the planner parallelize queries that include this function.
- Grant `execute` to `anon, authenticated` so pg_graphql can introspect and call it.

After adding the function run `pnpm generate:graphql:schema` then `pnpm --filter @apps/platform run generate:graphql` to pick up the new field.

## Lifecycle/invariants

Use constraints/triggers for facts that must survive every caller. Current schema protects
membership claim consistency, last admin, self-revocation, permission preset slugs, normalized
identity/invite values, reserved tenant slugs.

## Storage

Bucket name matches owner table (`profiles`, `organizations`). First object path segment is row
PK. Public buckets allow URL reads; `storage.objects` RLS gates writes. Add storage pgTAP when
changing policies.

## Seed

`packages/supabase/supabase/seed.sql` owns reserved slugs, permission catalog/presets, local
fixtures. Make reset idempotent.

## Tests

```bash
pnpm db:start
pnpm test:db
```

Test file:

```sql
begin;
select plan(N);
set local role authenticated;
set local request.jwt.claims to '...'::jsonb::text;
-- assertions
select * from finish();
rollback;
```

Without authenticated role, postgres bypasses RLS.

## After schema change

```bash
pnpm db:reset
pnpm generate:types                               # Supabase TS types from DB
pnpm generate:graphql:schema                      # GraphQL schema JSON/SDL from live DB
pnpm --filter @apps/platform run generate:graphql # TS operation types from schema + operations
pnpm test:db
```

`generate:graphql:schema` must run before `generate:graphql` — the latter reads the schema JSON output of the former.
