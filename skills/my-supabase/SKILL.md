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
pnpm generate:types
pnpm generate:graphql:schema
pnpm generate:graphql:platform
pnpm test:db
```
