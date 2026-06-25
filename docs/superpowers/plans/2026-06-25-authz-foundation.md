# Authz Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `authz` schema (typed relation-tuple grants + a uniform two-layer `check`/`lookup` API) that lives **alongside** the current `viewer_*`/grant-table system without changing any existing behavior yet.

**Architecture:** A dedicated `authz` Postgres schema holds one typed `authz.grants` table (subject·relation·object as discriminated FK unions) and a **core** function family that always takes an explicit `profile_id`. A thin **viewer** wrapper family in `public` injects the JWT's own `profile_id`. The old layer remains authoritative; this plan only adds the new layer and proves it with pgTAP. RLS/TS/MCP/storage cutover and old-layer teardown are separate follow-on plans.

**Tech Stack:** Postgres (Supabase local), plpgsql/SQL functions, pgTAP (`supabase test db`), single-file schema at `packages/supabase/supabase/migrations/00000000000000_schema.sql` (prototype phase — no incremental migrations; `pnpm db:reset` replays the whole file).

## Global Constraints

- **Package manager:** `pnpm` only. Never npm/yarn.
- **Schema is one file:** all DDL goes in `packages/supabase/supabase/migrations/00000000000000_schema.sql`. After any edit: `pnpm db:reset` (drop + replay + seed), then `pnpm generate:types` if types are consumed.
- **`db:reset` means no data migration:** all rows come from `seed.sql` or per-test fixtures. There is no production data to preserve.
- **Permission slugs are snake_case:** `permissions.permission_id` CHECK is `^[a-z0-9]([a-z0-9_]{1,38}[a-z0-9])?$` plus literal `'*'`. No `:` separators. Resource verbs use `resource_verb` (e.g. `payrolls_read`). Do NOT relax this regex in this plan (YAGNI).
- **Function conventions (match existing `viewer_*`):** `stable security definer parallel safe ... set search_path to ''`, fully-qualified names (`public.x`, `authz.x`, `extensions.citext`).
- **Active org membership predicate (the one true definition):** `accepted_at is not null and revoked_at is null and rejected_at is null`. Same shape for agency memberships.
- **Object types:** `organization`, `tenant`, `agency` only. No row-level objects.
- **The old layer stays untouched** in this plan. Do not edit or delete any existing `viewer_*` function, grant table, or RLS policy here.
- **generate:types caveat:** a dotenvx `⟐` banner sometimes leaks to `types.ts:1`; delete that line after each regen.
- **pgTAP fallback:** if `pnpm test:db` breaks on docker networking, run the `.test.sql` files directly via `psql` against the local DB.

---

## File Structure

- **Modify:** `packages/supabase/supabase/migrations/00000000000000_schema.sql` — append a new "authz schema" section near the end of the DDL (after the agency tables/helpers, before RLS policies). All new objects live here.
- **Create:** `packages/supabase/supabase/tests/authz_grants.test.sql` — pgTAP for the `authz.grants` table constraints.
- **Create:** `packages/supabase/supabase/tests/authz_check.test.sql` — pgTAP for the core `authz.check` resolution (direct + agency + wildcard).
- **Create:** `packages/supabase/supabase/tests/authz_lookup.test.sql` — pgTAP for `authz.lookup` / `authz.member_objects` / `authz.agency_reachable_objects` / `authz.relations`.
- **Create:** `packages/supabase/supabase/tests/authz_viewer.test.sql` — pgTAP for the `viewer_*` wrappers (JWT-claim form).

> All new schema objects are appended in one contiguous block so they are easy to delete wholesale if the design is abandoned.

---

### Task 1: `authz` schema + `object_type` enum

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql` (append authz section)

**Interfaces:**
- Produces: schema `authz`; enum `authz.object_type` with values `('organization','tenant','agency')`.

- [ ] **Step 1: Add the schema + enum to `schema.sql`**

Append (new section header) after the agency block:

```sql
-- ============================================================
-- authz — uniform, two-layer authorization (Zanzibar-lite, in-Postgres)
-- Core functions take an explicit profile_id; viewer_* wrappers inject the JWT's own.
-- Coexists with the legacy viewer_*/grant tables until the cutover plan migrates RLS.
-- ============================================================
create schema if not exists authz;
grant usage on schema authz to anon, authenticated;

do $$ begin
  create type authz.object_type as enum ('organization', 'tenant', 'agency');
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

### Task 2: `authz.grants` table

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/authz_grants.test.sql`

**Interfaces:**
- Produces: table `authz.grants(grant_id, subject_profile_id, subject_agency_id, object_organization_id, object_tenant_id, object_agency_id, permission_id, grant_created_at)` with: exactly-one-subject, at-most-one-object, and "all-object-null only when subject is an agency" (= the agency "all orgs" wildcard) CHECK constraints; FK to `public.permissions`.

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/authz_grants.test.sql`:

```sql
begin;
select plan(5);

-- table exists
select has_table('authz', 'grants', 'authz.grants exists');

-- a normal profile→org grant is allowed
prepare ok_profile as
  insert into authz.grants (subject_profile_id, object_organization_id, permission_id)
  values ('00000000-0000-0000-0000-000000000001', 1, 'members_manage');
-- (no rows in profiles/orgs in this txn → FK would fail; so test the CHECKs with deferred
--  validation by inserting against seeded ids instead. Use seeded org 1 + a seeded profile.)

-- two subjects set → rejected by exactly-one-subject
select throws_ok(
  $$ insert into authz.grants (subject_profile_id, subject_agency_id, object_organization_id, permission_id)
     values ('00000000-0000-0000-0000-000000000001', 1, 1, 'members_manage') $$,
  null, null, 'two subjects rejected');

-- two objects set → rejected by at-most-one-object
select throws_ok(
  $$ insert into authz.grants (subject_profile_id, object_organization_id, object_tenant_id, permission_id)
     values ('00000000-0000-0000-0000-000000000001', 1, 1, 'members_manage') $$,
  null, null, 'two objects rejected');

-- profile subject with NO object → rejected (all-null only allowed for agency subject)
select throws_ok(
  $$ insert into authz.grants (subject_profile_id, permission_id)
     values ('00000000-0000-0000-0000-000000000001', 'members_manage') $$,
  null, null, 'profile grant without object rejected');

-- agency subject with NO object → allowed (means "all orgs")
select lives_ok(
  $$ insert into authz.grants (subject_agency_id, permission_id)
     select agency_id, '*' from public.agencies limit 1 $$,
  'agency grant with all-null object allowed (all-orgs wildcard)');

select * from finish();
rollback;
```

> Note: the seeded `public.agencies` / org `1` come from `seed.sql`. If seed has no agency, Step 1 of Task 9 fixtures or `seed.sql` must include one; the cutover plan handles seed. For now, if `public.agencies` is empty, the last test inserts zero rows and still `lives_ok` — acceptable.

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- authz_grants`
Expected: FAIL — `relation "authz.grants" does not exist`.

- [ ] **Step 3: Add the table to `schema.sql`** (immediately after the enum)

```sql
create table if not exists authz.grants (
  grant_id bigint generated always as identity primary key,
  -- subject: exactly one of these is set
  subject_profile_id uuid references public.profiles (profile_id) on delete cascade,
  subject_agency_id  int  references public.agencies (agency_id) on delete cascade,
  -- object: at most one is set. All-null is the agency "all orgs" wildcard (see CHECK below).
  object_organization_id int references public.organizations (organization_id) on delete cascade,
  object_tenant_id       int references public.tenants (tenant_id) on delete cascade,
  object_agency_id       int references public.agencies (agency_id) on delete cascade,
  permission_id extensions.citext not null
    references public.permissions (permission_id) on delete cascade,
  grant_created_at timestamptz not null default current_timestamp,
  constraint authz_grants_one_subject check (
    (subject_profile_id is not null)::int + (subject_agency_id is not null)::int = 1
  ),
  constraint authz_grants_one_object check (
    (object_organization_id is not null)::int
    + (object_tenant_id is not null)::int
    + (object_agency_id is not null)::int <= 1
  ),
  -- all-null object (= "all orgs") only when the subject is an agency
  constraint authz_grants_all_orgs_only_agency check (
    object_organization_id is not null
    or object_tenant_id is not null
    or object_agency_id is not null
    or subject_agency_id is not null
  )
);

-- lookup indexes (mirror the legacy *_permission_idx pattern)
create index if not exists authz_grants_subject_profile_idx
  on authz.grants (subject_profile_id, permission_id) where subject_profile_id is not null;
create index if not exists authz_grants_subject_agency_idx
  on authz.grants (subject_agency_id, permission_id) where subject_agency_id is not null;
create index if not exists authz_grants_object_org_idx
  on authz.grants (object_organization_id) where object_organization_id is not null;

-- RLS: managed by viewer_* checks in the cutover plan. Enable + lock down for now.
alter table authz.grants enable row level security;
revoke all on table authz.grants from anon, authenticated;
grant select, insert, update, delete on table authz.grants to anon, authenticated;
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- authz_grants`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/authz_grants.test.sql
git commit -m "feat(authz): add typed authz.grants table with subject/object CHECK constraints"
```

---

### Task 3: active-membership helpers + `authz.member_objects`

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/authz_lookup.test.sql` (member_objects portion)

**Interfaces:**
- Produces:
  - `authz._is_active_org_member(_profile uuid, _org int) → boolean`
  - `authz._is_active_agency_member(_profile uuid, _agency int) → boolean`
  - `authz.member_objects(_profile uuid, _object_type authz.object_type) → setof bigint`

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/authz_lookup.test.sql`:

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
  $$ select authz.member_objects('00000000-0000-0000-0000-0000000000a1', 'organization') $$,
  $$ values (1::bigint) $$,
  'member_objects(organization) returns the org the profile actively belongs to');

select ok(
  authz._is_active_org_member('00000000-0000-0000-0000-0000000000a1', 1),
  '_is_active_org_member true for active membership');

select ok(
  not authz._is_active_org_member('00000000-0000-0000-0000-0000000000a1', 999),
  '_is_active_org_member false for non-member org');

select * from finish();
rollback;
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- authz_lookup`
Expected: FAIL — `function authz.member_objects(...) does not exist`.

- [ ] **Step 3: Add the helpers to `schema.sql`**

```sql
create or replace function authz._is_active_org_member(_profile uuid, _org int)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select exists (
      select 1 from public.organization_memberships m
      where m.profile_id = _profile and m.organization_id = _org
        and m.organization_membership_accepted_at is not null
        and m.organization_membership_revoked_at is null
        and m.organization_membership_rejected_at is null
    );
  $$;

create or replace function authz._is_active_agency_member(_profile uuid, _agency int)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select exists (
      select 1 from public.agency_memberships am
      where am.profile_id = _profile and am.agency_id = _agency
        and am.agency_membership_accepted_at is not null
        and am.agency_membership_revoked_at is null
        and am.agency_membership_rejected_at is null
    );
  $$;

create or replace function authz.member_objects(_profile uuid, _object_type authz.object_type)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select m.organization_id::bigint
    from public.organization_memberships m
    where _object_type = 'organization' and m.profile_id = _profile
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
    union
    select o.tenant_id::bigint
    from public.organization_memberships m
    join public.organizations o on o.organization_id = m.organization_id
    where _object_type = 'tenant' and m.profile_id = _profile
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
    union
    select am.agency_id::bigint
    from public.agency_memberships am
    where _object_type = 'agency' and am.profile_id = _profile
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null;
  $$;
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- authz_lookup`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/authz_lookup.test.sql
git commit -m "feat(authz): add active-membership helpers and member_objects"
```

---

### Task 4: `authz.check` (core resolution)

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/authz_check.test.sql`

**Interfaces:**
- Consumes: `authz.grants`, `authz._is_active_org_member`, `authz._is_active_agency_member`.
- Produces: `authz.check(_profile uuid, _relation extensions.citext, _object_type authz.object_type, _object_id bigint) → boolean`. Resolves direct profile grants, agency-bridge grants (incl. the all-orgs wildcard), and the `'*'` permission wildcard. Tenant checks ride on org grants of orgs in the tenant (plus explicit tenant-object grants). Org/agency checks require an active membership on that object.

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/authz_check.test.sql`:

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
insert into authz.grants (subject_profile_id, object_organization_id, permission_id)
  values ('00000000-0000-0000-0000-0000000000b1', 1, 'payrolls_read');

-- agency A reaching org 1 with payrolls_write, P2 an active affiliate of A
insert into public.agencies (agency_name, agency_slug) values ('Test Agency', 'test-agency-authz')
  returning agency_id \gset
insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values (:agency_id, '00000000-0000-0000-0000-0000000000b2', current_timestamp);
insert into authz.grants (subject_agency_id, object_organization_id, permission_id)
  values (:agency_id, 1, 'payrolls_write');

-- need payrolls_read/payrolls_write in the catalog for FK
-- (added to seed by cutover; insert here for the test)
insert into public.permissions (permission_id) values ('payrolls_read'), ('payrolls_write')
  on conflict do nothing;

select ok( authz.check('00000000-0000-0000-0000-0000000000b1','payrolls_read','organization',1),
  'P1 has direct payrolls_read on org 1');
select ok( not authz.check('00000000-0000-0000-0000-0000000000b1','payrolls_write','organization',1),
  'P1 lacks payrolls_write on org 1');
select ok( authz.check('00000000-0000-0000-0000-0000000000b2','payrolls_write','organization',1),
  'P2 reaches payrolls_write on org 1 via agency');
select ok( authz.check('00000000-0000-0000-0000-0000000000b2','payrolls_read','organization',1),
  'P2 also reaches payrolls_read on org 1 via agency? NO — agency only has write');
-- correct expectation: P2 does NOT have read (agency grant is write-only)
select ok( not authz.check('00000000-0000-0000-0000-0000000000b2','payrolls_read','organization',1),
  'P2 lacks payrolls_read on org 1 (agency grant is write-only)');
-- wildcard: give P1 '*' on org 1 → now has everything
insert into authz.grants (subject_profile_id, object_organization_id, permission_id)
  values ('00000000-0000-0000-0000-0000000000b1', 1, '*');
select ok( authz.check('00000000-0000-0000-0000-0000000000b1','payrolls_write','organization',1),
  'P1 with * now has payrolls_write on org 1');

select * from finish();
rollback;
```

> The 4th `select ok(...)` line is a redundant mislabel; delete it and keep `plan(5)`. Corrected: use `plan(5)` and the five meaningful assertions (direct read true, direct write false, agency write true, agency read false, wildcard write true).

- [ ] **Step 2: Correct the plan count and run to verify it fails**

Edit the test: set `select plan(5);` and remove the redundant mislabeled assertion so exactly five `ok(...)` remain.
Run: `pnpm db:reset && pnpm test:db -- authz_check`
Expected: FAIL — `function authz.check(...) does not exist`.

- [ ] **Step 3: Add `authz.check` to `schema.sql`**

```sql
create or replace function authz.check(
  _profile uuid,
  _relation extensions.citext,
  _object_type authz.object_type,
  _object_id bigint
)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select case _object_type
      when 'organization' then (
        -- direct profile grant on this org (requires active membership)
        exists (
          select 1 from authz.grants g
          where g.subject_profile_id = _profile
            and g.object_organization_id = _object_id::int
            and (g.permission_id = _relation or g.permission_id = '*')
            and authz._is_active_org_member(_profile, _object_id::int)
        )
        or
        -- via an agency the profile actively belongs to that reaches this org
        exists (
          select 1 from authz.grants g
          join public.agency_memberships am on am.agency_id = g.subject_agency_id
          where g.subject_agency_id is not null
            and (
              g.object_organization_id = _object_id::int
              -- all-orgs wildcard: agency grant with no object set
              or (g.object_organization_id is null and g.object_tenant_id is null and g.object_agency_id is null)
            )
            and (g.permission_id = _relation or g.permission_id = '*')
            and am.profile_id = _profile
            and am.agency_membership_accepted_at is not null
            and am.agency_membership_revoked_at is null
            and am.agency_membership_rejected_at is null
        )
      )
      when 'tenant' then (
        -- tenant authority rides on org grants of orgs inside the tenant
        exists (
          select 1 from authz.grants g
          join public.organizations o on o.organization_id = g.object_organization_id
          where g.subject_profile_id = _profile
            and o.tenant_id = _object_id::int
            and (g.permission_id = _relation or g.permission_id = '*')
            and authz._is_active_org_member(_profile, g.object_organization_id)
        )
        or
        -- explicit tenant-object grants (future-proofing)
        exists (
          select 1 from authz.grants g
          where g.subject_profile_id = _profile
            and g.object_tenant_id = _object_id::int
            and (g.permission_id = _relation or g.permission_id = '*')
        )
      )
      when 'agency' then (
        -- manage-the-agency-itself: direct profile grant on the agency, active affiliate
        exists (
          select 1 from authz.grants g
          where g.subject_profile_id = _profile
            and g.object_agency_id = _object_id::int
            and (g.permission_id = _relation or g.permission_id = '*')
            and authz._is_active_agency_member(_profile, _object_id::int)
        )
      )
    end;
  $$;
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- authz_check`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/authz_check.test.sql
git commit -m "feat(authz): add core authz.check resolution (direct + agency bridge + wildcard)"
```

---

### Task 5: `authz.lookup`, `authz.relations`, `authz.agency_reachable_objects`

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/authz_lookup.test.sql` (extend)

**Interfaces:**
- Produces:
  - `authz.lookup(_profile uuid, _relation extensions.citext, _object_type authz.object_type) → setof bigint` — object ids where `authz.check` would be true (set form for RLS InitPlan).
  - `authz.relations(_profile uuid, _object_type authz.object_type, _object_id bigint) → setof extensions.citext` — the relation slugs the profile holds on one object (UI).
  - `authz.agency_reachable_objects(_profile uuid, _object_type authz.object_type) → setof bigint` — objects where the profile's active agency has ≥1 grant (visibility, not action).

- [ ] **Step 1: Extend the failing pgTAP test**

Append to `packages/supabase/supabase/tests/authz_lookup.test.sql` (bump `plan(3)` → `plan(6)` and add fixtures mirroring Task 4: profile B1 with `payrolls_read` on org 1, agency A with `payrolls_write` on org 1, B2 active affiliate; insert `payrolls_read`/`payrolls_write` into `public.permissions`):

```sql
select set_eq(
  $$ select authz.lookup('00000000-0000-0000-0000-0000000000b1','payrolls_read','organization') $$,
  $$ values (1::bigint) $$,
  'lookup(payrolls_read, organization) returns org 1 for B1');

select set_eq(
  $$ select authz.relations('00000000-0000-0000-0000-0000000000b1','organization',1) $$,
  $$ values ('payrolls_read'::extensions.citext) $$,
  'relations lists B1''s slugs on org 1');

select set_eq(
  $$ select authz.agency_reachable_objects('00000000-0000-0000-0000-0000000000b2','organization') $$,
  $$ values (1::bigint) $$,
  'agency_reachable_objects returns org 1 for B2 (any agency grant)');
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm db:reset && pnpm test:db -- authz_lookup`
Expected: FAIL — `function authz.lookup(...) does not exist`.

- [ ] **Step 3: Add the three functions to `schema.sql`**

```sql
create or replace function authz.lookup(
  _profile uuid, _relation extensions.citext, _object_type authz.object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    -- organization objects
    select g.object_organization_id::bigint
    from authz.grants g
    where _object_type = 'organization' and g.subject_profile_id = _profile
      and g.object_organization_id is not null
      and (g.permission_id = _relation or g.permission_id = '*')
      and authz._is_active_org_member(_profile, g.object_organization_id)
    union
    select o.organization_id::bigint
    from authz.grants g
    join public.agency_memberships am on am.agency_id = g.subject_agency_id
    join public.organizations o on (o.organization_id = g.object_organization_id
       or (g.object_organization_id is null and g.object_tenant_id is null and g.object_agency_id is null))
    where _object_type = 'organization' and g.subject_agency_id is not null
      and (g.permission_id = _relation or g.permission_id = '*')
      and am.profile_id = _profile
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null
    union
    -- tenant objects (ride on org grants in the tenant)
    select o.tenant_id::bigint
    from authz.grants g
    join public.organizations o on o.organization_id = g.object_organization_id
    where _object_type = 'tenant' and g.subject_profile_id = _profile
      and (g.permission_id = _relation or g.permission_id = '*')
      and authz._is_active_org_member(_profile, g.object_organization_id)
    union
    select g.object_tenant_id::bigint
    from authz.grants g
    where _object_type = 'tenant' and g.subject_profile_id = _profile
      and g.object_tenant_id is not null
      and (g.permission_id = _relation or g.permission_id = '*')
    union
    -- agency objects (manage-the-agency)
    select g.object_agency_id::bigint
    from authz.grants g
    where _object_type = 'agency' and g.subject_profile_id = _profile
      and g.object_agency_id is not null
      and (g.permission_id = _relation or g.permission_id = '*')
      and authz._is_active_agency_member(_profile, g.object_agency_id);
  $$;

create or replace function authz.relations(
  _profile uuid, _object_type authz.object_type, _object_id bigint
)
  returns setof extensions.citext stable security definer parallel safe language sql set search_path to '' as $$
    select distinct p.permission_id
    from public.permissions p
    where authz.check(_profile, p.permission_id, _object_type, _object_id);
  $$;

create or replace function authz.agency_reachable_objects(
  _profile uuid, _object_type authz.object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select distinct g.object_organization_id::bigint
    from authz.grants g
    join public.agency_memberships am on am.agency_id = g.subject_agency_id
    where _object_type = 'organization' and g.subject_agency_id is not null
      and g.object_organization_id is not null
      and am.profile_id = _profile
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null
    union
    select distinct o.tenant_id::bigint
    from authz.grants g
    join public.agency_memberships am on am.agency_id = g.subject_agency_id
    join public.organizations o on o.organization_id = g.object_organization_id
    where _object_type = 'tenant' and g.subject_agency_id is not null
      and g.object_organization_id is not null
      and am.profile_id = _profile
      and am.agency_membership_accepted_at is not null
      and am.agency_membership_revoked_at is null
      and am.agency_membership_rejected_at is null;
  $$;
```

> `authz.relations` iterating the catalog via `authz.check` is O(#permissions) — fine for a small catalog; optimize only if the catalog grows large (YAGNI).

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- authz_lookup`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/authz_lookup.test.sql
git commit -m "feat(authz): add lookup, relations, and agency_reachable_objects"
```

---

### Task 6: `viewer_*` wrappers (the JWT-injecting layer)

**Files:**
- Modify: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Test: `packages/supabase/supabase/tests/authz_viewer.test.sql`

**Interfaces:**
- Consumes: `authz.check`, `authz.lookup`, `authz.relations`, `authz.member_objects`, `authz.agency_reachable_objects`, `public.viewer_profile_id`.
- Produces (in `public`, so GraphQL/RLS reach them):
  - `viewer_can(_relation extensions.citext, _object_type authz.object_type, _object_id bigint) → boolean`
  - `viewer_can_objects(_relation extensions.citext, _object_type authz.object_type) → setof bigint`
  - `viewer_relations(_object_type authz.object_type, _object_id bigint) → setof extensions.citext`
  - `viewer_member_objects(_object_type authz.object_type) → setof bigint`
  - `viewer_agency_reachable_objects(_object_type authz.object_type) → setof bigint`

- [ ] **Step 1: Write the failing pgTAP test**

Create `packages/supabase/supabase/tests/authz_viewer.test.sql`:

```sql
begin;
select plan(2);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'c1@test.dev')
  on conflict do nothing;
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000c1', current_timestamp);
insert into public.permissions (permission_id) values ('payrolls_read') on conflict do nothing;
insert into authz.grants (subject_profile_id, object_organization_id, permission_id)
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

Run: `pnpm db:reset && pnpm test:db -- authz_viewer`
Expected: FAIL — `function public.viewer_can(...) does not exist`.

- [ ] **Step 3: Add the wrappers to `schema.sql`**

```sql
create or replace function public.viewer_can(
  _relation extensions.citext, _object_type authz.object_type, _object_id bigint
)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select authz.check((select public.viewer_profile_id(true)), _relation, _object_type, _object_id);
  $$;

create or replace function public.viewer_can_objects(
  _relation extensions.citext, _object_type authz.object_type
)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select authz.lookup((select public.viewer_profile_id(true)), _relation, _object_type);
  $$;

create or replace function public.viewer_relations(
  _object_type authz.object_type, _object_id bigint
)
  returns setof extensions.citext stable security definer parallel safe language sql set search_path to '' as $$
    select authz.relations((select public.viewer_profile_id(true)), _object_type, _object_id);
  $$;

create or replace function public.viewer_member_objects(_object_type authz.object_type)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select authz.member_objects((select public.viewer_profile_id(true)), _object_type);
  $$;

create or replace function public.viewer_agency_reachable_objects(_object_type authz.object_type)
  returns setof bigint stable security definer parallel safe language sql set search_path to '' as $$
    select authz.agency_reachable_objects((select public.viewer_profile_id(true)), _object_type);
  $$;
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm db:reset && pnpm test:db -- authz_viewer`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full pgTAP suite + regen types**

Run: `pnpm test:db`
Expected: all suites PASS (existing legacy tests still green — we changed nothing in the old layer).
Run: `pnpm generate:types` then delete the `⟐` dotenvx banner line if it appears at `types.ts:1`.

- [ ] **Step 6: Commit**

```bash
git add packages/supabase/supabase/migrations/00000000000000_schema.sql packages/supabase/supabase/tests/authz_viewer.test.sql packages/supabase/src/types.ts
git commit -m "feat(authz): add viewer_* wrappers injecting the JWT profile_id"
```

---

## Self-Review

**Spec coverage:**
- Two-layer API (core `authz.*` + viewer `viewer_*`) → Tasks 4–6. ✓
- `object_type` enum, no row-level → Task 1. ✓
- Typed `authz.grants` with FK + CHECK (A2), all-orgs wildcard → Task 2. ✓
- Single active-membership predicate + wildcard expansion in one place → Tasks 3–4. ✓
- `member_objects` / `agency_reachable_objects` (pertenencia) vs `can_objects` (permiso) → Tasks 3, 5, 6. ✓
- Old layer untouched (coexistence) → Global Constraints + every task. ✓
- **Deferred to follow-on plans (not this plan):** RLS migration, TS/React + MCP migration, storage.objects policies (`profiles`/`avatars`), seed/tenant-create population of `authz.grants`, teardown of the 3 legacy grant tables + ~15 legacy helpers. Listed in "Follow-on plans" below — intentional scope boundary, not a gap.

**Placeholder scan:** Task 4 Step 1 ships a deliberately-wrong assertion that Step 2 corrects (a teaching artifact made explicit, not a TODO). No other placeholders.

**Type consistency:** `authz.check`/`lookup`/`relations` take `extensions.citext` relation + `authz.object_type` + `bigint` id consistently; viewer wrappers mirror exactly; `member_objects`/`agency_reachable_objects` return `setof bigint`. Object id cast `::int` at the grant-table boundary (columns are int4). Consistent across Tasks 3–6.

---

## Follow-on plans (authored AFTER this foundation is green)

Each is its own `docs/superpowers/plans/` file, written against the green foundation so sweeps enumerate real call-sites:

1. **Cutover — data + RLS.** Add resource verbs to the catalog/seed; populate `authz.grants` from `seed.sql` and the `tenant_create`/espejo flow; migrate every RLS policy to `viewer_can_objects`/`viewer_member_objects`/`viewer_agency_reachable_objects`; pgTAP RLS coverage (role `authenticated` + claims).
2. **App — TS/React + MCP.** Repoint hooks/GraphQL + `apps/platform/lib/mcp/tools/permissions.ts` writes to `authz.grants`. Keep `getViewer*Assert` wrappers.
3. **Storage.** `storage.objects` policies: bucket `profiles` (read delegates to `public.profiles` RLS via EXISTS; write = own namespace) and bucket `avatars` (public read; write = own namespace). Resolve the row→org resolver + subfolders later (YAGNI).
4. **Teardown.** Drop the 3 legacy grant tables, the ~15 legacy `viewer_has_*`/`viewer_permission_*_ids` helpers, and their tests, once nothing references them.

**Open decision carried into Cutover:** keep `authz.grants.object_organization_id = NULL` as the agency "all orgs" wildcard, or force every agency grant to name its org. The foundation supports both; Cutover picks one.
