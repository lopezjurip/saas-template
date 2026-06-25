# Authz Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new authorization layer (typed relation-tuple grants + a uniform two-layer `check`/`lookup` API) that lives **alongside** the current `viewer_*`/grant-table system without changing any existing behavior yet.

**Architecture:** A `public.permission_grants` table (subject·relation·object as discriminated FK unions) + a **core** function family in `protected.*` that always takes an explicit `profile_id` + active-membership helpers in `internal.*`. A thin **viewer** wrapper family in `public` injects the JWT's own `profile_id`. The old layer remains authoritative; this plan only adds the new layer and proves it with pgTAP. RLS/TS/MCP/storage cutover and old-layer teardown are separate follow-on plans.

**Tech Stack:** Postgres (Supabase local), plpgsql/SQL functions, pgTAP (`supabase test db`), single-file schema at `packages/supabase/supabase/migrations/00000000000000_schema.sql` (prototype phase — no incremental migrations; `pnpm db:reset` replays the whole file).

## Global Constraints

- **Package manager:** `pnpm` only. Never npm/yarn.
- **Schema is one file:** all DDL goes in `packages/supabase/supabase/migrations/00000000000000_schema.sql`. After any edit: `pnpm db:reset` (drop + replay + seed), then `pnpm generate:types` if types are consumed.
- **`db:reset` means no data migration:** all rows come from `seed.sql` or per-test fixtures. There is no production data to preserve.
- **Permission slugs are snake_case:** `permissions.permission_id` CHECK is `^[a-z0-9]([a-z0-9_]{1,38}[a-z0-9])?$` plus literal `'*'`. No `:` separators. Resource verbs use `resource_verb` (e.g. `payrolls_read`). Do NOT relax this regex in this plan (YAGNI).
- **Function conventions (match existing `viewer_*`):** `stable security definer parallel safe ... set search_path to ''`, fully-qualified names (`public.x`, `protected.x`, `internal.x`, `extensions.citext`).
- **Active org membership predicate (the one true definition):** `accepted_at is not null and revoked_at is null and rejected_at is null`. Same shape for agency memberships.
- **Object types:** `organization`, `tenant`, `agency` only. No row-level objects.
- **The old layer stays untouched** in this plan. Do not edit or delete any existing `viewer_*` function, grant table, or RLS policy here.
- **generate:types caveat:** a dotenvx `⟐` banner sometimes leaks to `types.ts:1`; delete that line after each regen.
- **pgTAP fallback:** if `pnpm test:db` breaks on docker networking, run the `.test.sql` files directly via `psql` against the local DB.

---

## File Structure

- **Modify:** `packages/supabase/supabase/migrations/00000000000000_schema.sql` — append a new authorization section near the end of the DDL (after the agency tables/helpers, before RLS policies). All new objects live here.
- **Create:** `packages/supabase/supabase/tests/permission_grants.test.sql` — pgTAP for the `public.permission_grants` table constraints.
- **Create:** `packages/supabase/supabase/tests/check_permission.test.sql` — pgTAP for the core `protected.check_permission` resolution (direct + agency + wildcard).
- **Create:** `packages/supabase/supabase/tests/lookup_objects.test.sql` — pgTAP for `protected.lookup_objects` / `protected.member_objects` / `protected.agency_reachable_objects` / `protected.list_object_permissions`.
- **Create:** `packages/supabase/supabase/tests/viewer_can.test.sql` — pgTAP for the `viewer_*` wrappers (JWT-claim form).

> All new schema objects are appended in one contiguous block so they are easy to delete wholesale if the design is abandoned.

---

### Task 1: `public.permission_object_type` enum

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql` (append authorization section)

**Interfaces:**
- Produces: enum `public.permission_object_type` with values `('organization','tenant','agency')`.

- [ ] **Step 1: Add the enum to `schema.sql`**

Append (new section header) after the agency block:

```sql
-- ============================================================
-- Uniform, two-layer authorization (Zanzibar-lite, in-Postgres)
-- Core functions take an explicit profile_id; viewer_* wrappers inject the JWT's own.
-- Coexists with the legacy viewer_*/grant tables until the cutover plan migrates RLS.
-- ============================================================

do $$ begin
  create type public.permission_object_type as enum ('organization', 'tenant', 'agency');
exception when duplicate_object then null;
end $$;
```

- [ ] **Step 2: Apply and verify it replays clean**

Run: `pnpm db:reset`
Expected: completes without error (look for `Finished supabase db reset`).

- [ ] **Step 3: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql
git commit -m "feat(authz): add authz schema and object_type enum"
```

---

### Task 2: `public.permission_grants` table

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/permission_grants.test.sql`

**Interfaces:**
- Produces: table `public.permission_grants(permission_grant_id, subject_profile_id, subject_agency_id, object_organization_id, object_tenant_id, object_agency_id, permission_id, permission_grant_created_at)` with: exactly-one-subject, at-most-one-object, and "all-object-null only when subject is an agency" (= the agency "all orgs" wildcard) CHECK constraints; FK to `public.permissions`.

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/permission_grants.test.sql`:

```sql
begin;
select plan(5);

-- table exists
select has_table('public', 'permission_grants', 'public.permission_grants exists');

-- two subjects set → rejected by permission_grants_one_subject CHECK
select throws_ok(
  $$ insert into public.permission_grants (subject_profile_id, subject_agency_id, object_organization_id, permission_id)
     values ('00000000-0000-0000-0000-00000000a11c', 1, 1, 'members_manage') $$,
  null, null, 'two subjects rejected');

-- two objects set → rejected by permission_grants_one_object CHECK
select throws_ok(
  $$ insert into public.permission_grants (subject_profile_id, object_organization_id, object_tenant_id, permission_id)
     values ('00000000-0000-0000-0000-00000000a11c', 1, 1, 'members_manage') $$,
  null, null, 'two objects rejected');

-- profile subject with NO object → rejected by permission_grants_all_orgs_only_agency CHECK
select throws_ok(
  $$ insert into public.permission_grants (subject_profile_id, permission_id)
     values ('00000000-0000-0000-0000-00000000a11c', 'members_manage') $$,
  null, null, 'profile grant without object rejected');

-- agency subject with NO object → allowed (means "all orgs" wildcard)
select lives_ok(
  $$ insert into public.permission_grants (subject_agency_id, permission_id)
     values (1, '*') $$,
  'agency grant with all-null object allowed (all-orgs wildcard)');

select * from finish();
rollback;
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- permission_grants`
Expected: FAIL — `relation "public.permission_grants" does not exist`.

- [ ] **Step 3: Add the table to `schema.sql`** (immediately after the enum)

```sql
create table if not exists public.permission_grants (
  permission_grant_id bigint generated always as identity primary key,
  -- subject: exactly one of these is set
  subject_profile_id uuid references public.profiles (profile_id) on delete cascade,
  subject_agency_id  int  references public.agencies (agency_id) on delete cascade,
  -- object: at most one is set. All-null is the agency "all orgs" wildcard (see CHECK below).
  object_organization_id int references public.organizations (organization_id) on delete cascade,
  object_tenant_id       int references public.tenants (tenant_id) on delete cascade,
  object_agency_id       int references public.agencies (agency_id) on delete cascade,
  permission_id extensions.citext not null
    references public.permissions (permission_id) on delete cascade,
  permission_grant_created_at timestamptz not null default current_timestamp,
  constraint permission_grants_one_subject check (
    (subject_profile_id is not null)::int + (subject_agency_id is not null)::int = 1
  ),
  constraint permission_grants_one_object check (
    (object_organization_id is not null)::int
    + (object_tenant_id is not null)::int
    + (object_agency_id is not null)::int <= 1
  ),
  -- all-null object (= "all orgs") only when the subject is an agency
  constraint permission_grants_all_orgs_only_agency check (
    object_organization_id is not null
    or object_tenant_id is not null
    or object_agency_id is not null
    or subject_agency_id is not null
  )
);

-- lookup indexes
create index if not exists permission_grants_subject_profile_idx
  on public.permission_grants (subject_profile_id, permission_id) where subject_profile_id is not null;
create index if not exists permission_grants_subject_agency_idx
  on public.permission_grants (subject_agency_id, permission_id) where subject_agency_id is not null;
create index if not exists permission_grants_object_org_idx
  on public.permission_grants (object_organization_id) where object_organization_id is not null;

-- RLS: managed by viewer_* checks in the cutover plan. Enable + lock down for now.
alter table public.permission_grants enable row level security;
revoke all on table public.permission_grants from anon, authenticated;
grant select, insert, update, delete on table public.permission_grants to anon, authenticated;
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- permission_grants`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/permission_grants.test.sql
git commit -m "refactor(authz): rename authz.grants to public.permission_grants with convention-compliant columns/constraints"
```

---

### Task 3: active-membership helpers + `protected.member_objects`

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/lookup_objects.test.sql` (member_objects portion)

**Interfaces:**
- Produces:
  - `internal.is_active_org_member(profile_id uuid, organization_id int) → boolean`
  - `internal.is_active_agency_member(profile_id uuid, agency_id int) → boolean`
  - `protected.member_objects(profile_id uuid, object_type public.permission_object_type) → setof bigint`

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/lookup_objects.test.sql`:

```sql
begin;
select plan(3);

-- seed a profile + org membership fixture
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a1', 'a1@test.dev')
  on conflict do nothing;
-- (public.profiles row is created by the auth.users trigger)

-- make org 1 visible to this profile via an active membership
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000a1', current_timestamp);

select set_eq(
  $$ select protected.member_objects('00000000-0000-0000-0000-0000000000a1', 'organization') $$,
  $$ values (1::bigint) $$,
  'member_objects(organization) returns the org the profile actively belongs to');

select ok(
  internal.is_active_org_member('00000000-0000-0000-0000-0000000000a1', 1),
  'is_active_org_member true for active membership');

select ok(
  not internal.is_active_org_member('00000000-0000-0000-0000-0000000000a1', 999),
  'is_active_org_member false for non-member org');

select * from finish();
rollback;
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- lookup_objects`
Expected: FAIL — `function protected.member_objects(...) does not exist`.

- [ ] **Step 3: Add the helpers to `schema.sql`**

```sql
create or replace function internal.is_active_org_member(profile_id uuid, organization_id int)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select exists (
      select 1 from public.organization_memberships m
      where m.profile_id = internal.is_active_org_member.profile_id
        and m.organization_id = internal.is_active_org_member.organization_id
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
      where am.profile_id = internal.is_active_agency_member.profile_id
        and am.agency_id = internal.is_active_agency_member.agency_id
        and am.agency_membership_accepted_at is not null
        and am.agency_membership_revoked_at is null
        and am.agency_membership_rejected_at is null
    );
  $$;

create or replace function protected.member_objects(profile_id uuid, object_type public.permission_object_type)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select m.organization_id::bigint
    from public.organization_memberships m
    where protected.member_objects.object_type = 'organization'
      and m.profile_id = protected.member_objects.profile_id
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
    union
    select o.tenant_id::bigint
    from public.organization_memberships m
    join public.organizations o on o.organization_id = m.organization_id
    where protected.member_objects.object_type = 'tenant'
      and m.profile_id = protected.member_objects.profile_id
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
    union
    select am.agency_id::bigint
    from public.agency_memberships am
    join public.agencies a on a.agency_id = am.agency_id and a.agency_deleted_at is null
    where protected.member_objects.object_type = 'agency'
      and am.profile_id = protected.member_objects.profile_id
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null;
  $$;
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- lookup_objects`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/lookup_objects.test.sql
git commit -m "refactor(authz): move membership helpers to internal.*, member_objects to protected.*"
```

---

### Task 4: `protected.check_permission` (core resolution)

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/check_permission.test.sql`

**Interfaces:**
- Consumes: `public.permission_grants`, `internal.is_active_org_member`, `internal.is_active_agency_member`.
- Produces: `protected.check_permission(profile_id uuid, permission_id extensions.citext, object_type public.permission_object_type, object_id bigint) → boolean`. Resolves direct profile grants, agency-bridge grants (incl. the all-orgs wildcard), and the `'*'` permission wildcard. Tenant checks ride on org grants of orgs in the tenant (plus explicit tenant-object grants). Org/agency checks require an active membership on that object.

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/check_permission.test.sql`:

```sql
begin;
select plan(6);

-- fixtures: profile P1 (direct member of org 1), profile P2 (member of agency A reaching org 1)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000b1', 'b1@test.dev'),
  ('00000000-0000-0000-0000-0000000000b2', 'b2@test.dev')
  on conflict do nothing;

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000b1', current_timestamp);

-- P1 gets a direct payrolls_read grant on org 1
insert into public.permission_grants (subject_profile_id, object_organization_id, permission_id)
  values ('00000000-0000-0000-0000-0000000000b1', 1, 'payrolls_read');

-- agency A reaching org 1 with payrolls_write; P2 an active affiliate of A
insert into public.agencies (agency_name, agency_slug)
  values ('Test Agency', 'test-agency-check-permission');
insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values (
    (select agency_id from public.agencies where agency_slug = 'test-agency-check-permission'),
    '00000000-0000-0000-0000-0000000000b2',
    current_timestamp
  );
insert into public.permission_grants (subject_agency_id, object_organization_id, permission_id)
  values (
    (select agency_id from public.agencies where agency_slug = 'test-agency-check-permission'),
    1,
    'payrolls_write'
  );

-- need payrolls_read/payrolls_write in the catalog for FK
insert into public.permissions (permission_id) values ('payrolls_read'), ('payrolls_write')
  on conflict do nothing;

select ok( protected.check_permission('00000000-0000-0000-0000-0000000000b1','payrolls_read','organization',1),
  'P1 has direct payrolls_read on org 1');
select ok( not protected.check_permission('00000000-0000-0000-0000-0000000000b1','payrolls_write','organization',1),
  'P1 lacks payrolls_write on org 1');
select ok( protected.check_permission('00000000-0000-0000-0000-0000000000b2','payrolls_write','organization',1),
  'P2 reaches payrolls_write on org 1 via agency');
select ok( not protected.check_permission('00000000-0000-0000-0000-0000000000b2','payrolls_read','organization',1),
  'P2 lacks payrolls_read on org 1 (agency grant is write-only)');
-- wildcard: give P1 '*' on org 1 → now has everything
insert into public.permission_grants (subject_profile_id, object_organization_id, permission_id)
  values ('00000000-0000-0000-0000-0000000000b1', 1, '*');
select ok( protected.check_permission('00000000-0000-0000-0000-0000000000b1','payrolls_write','organization',1),
  'P1 with * now has payrolls_write on org 1');
-- soft-delete the agency → affiliate loses access
update public.agencies set agency_deleted_at = current_timestamp
  where agency_slug = 'test-agency-check-permission';
select ok( not protected.check_permission('00000000-0000-0000-0000-0000000000b2','payrolls_write','organization',1),
  'soft-deleted agency denies the bridge');

select * from finish();
rollback;
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- check_permission`
Expected: FAIL — `function protected.check_permission(...) does not exist`.

- [ ] **Step 3: Add `protected.check_permission` to `schema.sql`**

See the implementation in `00000000000000_schema.sql` (delegates to `internal.is_active_org_member` / `internal.is_active_agency_member`, reads from `public.permission_grants`).

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- check_permission`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/check_permission.test.sql
git commit -m "refactor(authz): move check to protected.check_permission"
```

---

### Task 5: `protected.lookup_objects`, `protected.list_object_permissions`, `protected.agency_reachable_objects`

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/lookup_objects.test.sql` (extend)

**Interfaces:**
- Produces:
  - `protected.lookup_objects(profile_id uuid, permission_id extensions.citext, object_type public.permission_object_type) → setof bigint` — object ids where `protected.check_permission` would be true (set form for RLS InitPlan).
  - `protected.list_object_permissions(profile_id uuid, object_type public.permission_object_type, object_id bigint) → setof extensions.citext` — the permission slugs the profile holds on one object (UI).
  - `protected.agency_reachable_objects(profile_id uuid, object_type public.permission_object_type) → setof bigint` — objects where the profile's active agency has ≥1 grant (visibility, not action).

- [ ] **Step 1: Extend the failing pgTAP test**

Extend `packages/supabase/supabase/tests/lookup_objects.test.sql` (bump `plan(3)` → `plan(8)` and add fixtures mirroring check_permission.test.sql):

```sql
select set_eq(
  $$ select protected.lookup_objects('00000000-0000-0000-0000-0000000000b1','payrolls_read','organization') $$,
  $$ values (1::bigint) $$,
  'lookup_objects(payrolls_read, organization) returns org 1 for B1');

select set_eq(
  $$ select protected.list_object_permissions('00000000-0000-0000-0000-0000000000b1','organization',1) $$,
  $$ values ('payrolls_read'::extensions.citext) $$,
  'list_object_permissions lists B1''s slugs on org 1');

select set_eq(
  $$ select protected.agency_reachable_objects('00000000-0000-0000-0000-0000000000b2','organization') $$,
  $$ values (1::bigint) $$,
  'agency_reachable_objects returns org 1 for B2 (any agency grant)');
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- lookup_objects`
Expected: FAIL — `function protected.lookup_objects(...) does not exist`.

- [ ] **Step 3: Add the three functions to `schema.sql`**

See the implementation in `00000000000000_schema.sql`. All read from `public.permission_grants`, delegate membership checks to `internal.is_active_*`.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- lookup_objects`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/lookup_objects.test.sql
git commit -m "refactor(authz): move lookup/relations/agency_reachable_objects to protected.*"
```

---

### Task 6: `public.viewer_*` wrappers (the JWT-injecting layer)

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/viewer_can.test.sql`

**Interfaces:**
- Consumes: `protected.check_permission`, `protected.lookup_objects`, `protected.list_object_permissions`, `protected.member_objects`, `protected.agency_reachable_objects`, `public.viewer_profile_id`.
- Produces (in `public`, so GraphQL/RLS reach them):
  - `viewer_can(permission_id extensions.citext, object_type public.permission_object_type, object_id bigint) → boolean`
  - `viewer_can_objects(permission_id extensions.citext, object_type public.permission_object_type) → setof bigint`
  - `viewer_object_permissions(object_type public.permission_object_type, object_id bigint) → setof extensions.citext` (renamed from `viewer_relations`)
  - `viewer_member_objects(object_type public.permission_object_type) → setof bigint`
  - `viewer_agency_reachable_objects(object_type public.permission_object_type) → setof bigint`

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/viewer_can.test.sql`:

```sql
begin;
select plan(2);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'c1@test.dev')
  on conflict do nothing;
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000c1', current_timestamp);
insert into public.permissions (permission_id) values ('payrolls_read') on conflict do nothing;
insert into public.permission_grants (subject_profile_id, object_organization_id, permission_id)
  values ('00000000-0000-0000-0000-0000000000c1', 1, 'payrolls_read');

-- act as this user via JWT claims
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c1"}';

select ok( public.viewer_can('payrolls_read','organization',1),
  'viewer_can resolves the JWT subject''s own grant');
select set_eq(
  $$ select public.viewer_can_objects('payrolls_read','organization') $$,
  $$ values (1::bigint) $$,
  'viewer_can_objects returns org 1 for the JWT subject');

select * from finish();
rollback;
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- viewer_can`
Expected: FAIL — `function public.viewer_can(...) does not exist`.

- [ ] **Step 3: Add the wrappers to `schema.sql`**

See the implementation in `00000000000000_schema.sql`. Each wrapper calls the corresponding `protected.*` function, injecting `public.viewer_profile_id(true)`.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- viewer_can`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full pgTAP suite + regen types**

Run: `pnpm test:db`
Expected: all suites PASS.
Run: `pnpm generate:types` then delete the `⟐` dotenvx banner line if it appears at `types.ts:1`.

- [ ] **Step 6: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/viewer_can.test.sql packages/supabase/src/types.ts
git commit -m "refactor(authz): move into internal/protected/public schemas and follow naming conventions"
```

---

## Self-Review

**Spec coverage:**
- Two-layer API (core `protected.*` + viewer `public.viewer_*`) → Tasks 4–6. ✓
- `public.permission_object_type` enum, no row-level → Task 1. ✓
- Typed `public.permission_grants` with FK + CHECK (A2), all-orgs wildcard → Task 2. ✓
- Single active-membership predicate + wildcard expansion in one place → Tasks 3–4. ✓
- `member_objects` / `agency_reachable_objects` (pertenencia) vs `can_objects` (permiso) → Tasks 3, 5, 6. ✓
- Old layer untouched (coexistence) → Global Constraints + every task. ✓
- **Deferred to follow-on plans (not this plan):** RLS migration, TS/React + MCP migration, storage.objects policies (`profiles`/`avatars`), seed/tenant-create population of `public.permission_grants`, teardown of the 3 legacy grant tables + ~15 legacy helpers. Listed in "Follow-on plans" below — intentional scope boundary, not a gap.

**Type consistency:** `protected.check_permission`/`lookup_objects`/`list_object_permissions` take `extensions.citext` permission_id + `public.permission_object_type` + `bigint` id consistently; viewer wrappers mirror exactly; `member_objects`/`agency_reachable_objects` return `setof bigint`. Object id cast `::int` at the grant-table boundary (columns are int4). Consistent across Tasks 3–6.

---

## Follow-on plans (authored AFTER this foundation is green)

Each is its own `docs/superpowers/plans/` file, written against the green foundation so sweeps enumerate real call-sites:

1. **Cutover — data + RLS.** Add resource verbs to the catalog/seed; populate `public.permission_grants` from `seed.sql` and the `tenant_create`/espejo flow; migrate every RLS policy to `viewer_can_objects`/`viewer_member_objects`/`viewer_agency_reachable_objects`; pgTAP RLS coverage (role `authenticated` + claims).
2. **App — TS/React + MCP.** Repoint hooks/GraphQL + `apps/platform/lib/mcp/tools/permissions.ts` writes to `public.permission_grants`. Keep `getViewer*Assert` wrappers.
3. **Storage.** `storage.objects` policies: bucket `profiles` (read delegates to `public.profiles` RLS via EXISTS; write = own namespace) and bucket `avatars` (public read; write = own namespace). Resolve the row→org resolver + subfolders later (YAGNI).
4. **Teardown.** Drop the 3 legacy grant tables, the ~15 legacy `viewer_has_*`/`viewer_permission_*_ids` helpers, and their tests, once nothing references them.

**Open decision carried into Cutover:** keep `public.permission_grants.object_organization_id = NULL` as the agency "all orgs" wildcard, or force every agency grant to name its org. The foundation supports both; Cutover picks one.

**Carried Minor findings (from the foundation's final review — address during Cutover/Teardown):**
- Add a regression test proving a soft-deleted agency denies the `protected.lookup_objects` org-bridge branch (today only `protected.check_permission` and `protected.agency_reachable_objects` have that regression; `lookup_objects`'s bridge is correct but untested).
- Reword the `public.permission_grants` "lock down for now" comment: the table is privilege-open (`grant select,insert,update,delete to authenticated`) and gated only by RLS-enabled-with-no-policies; the comment misleads. Reword when the Cutover adds RLS policies.
- Optional data-hygiene CHECK: agency-subject grants should only carry `object_organization_id` or all-null (today the constraints structurally permit an agency subject with `object_tenant_id`/`object_agency_id`; no code path reads that shape, so it is dead-but-harmless).
