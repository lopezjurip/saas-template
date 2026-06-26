# Authz Cutover Implementation Plan (Phases A–D)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the new `permission_grants` model authoritative end-to-end: re-key it by **membership** (so pending invites can carry permissions), populate it, migrate all resource RLS reads to the `viewer_can_*`/`viewer_member_objects` API, and repoint writes (RLS + MCP + the set-RPC) to it. Teardown of the legacy layer is a SEPARATE plan (Phase E).

**Architecture:** `public.permission_grants` becomes a typed union of the 3 legacy grant tables, keyed by **subject = organization_membership | agency_membership | agency** (object implicit except the agency→org reach, which carries `object_organization_id`, NULL = all orgs). The `protected.*` core resolves a `profile_id` through the membership join; `public.viewer_*` wrappers inject the JWT profile. RLS on resources switches from `viewer_permission_*`/`viewer_*_ids` to the new uniform helpers (the agency bridge is now INSIDE the helper, so the old "OR agency branch" in each policy collapses).

**Tech Stack:** Postgres (Supabase local), plpgsql/SQL, pgTAP (psql fallback — Docker breaks `supabase test db` in this worktree), single-file schema `packages/supabase/supabase/migrations/00000000000000_schema.sql`. TS/MCP in `apps/platform`.

## Global Constraints

- **pnpm only.** After any schema edit: `pnpm db:reset` then `pnpm generate:types` (delete the `⟐` dotenvx banner from `src/types.ts:1` if it appears); for GraphQL surface changes also `pnpm generate:graphql:schema` then `pnpm --filter @apps/platform run generate:graphql`.
- **Prototype / no data migration:** all rows come from `seed.sql` or per-test fixtures.
- **Permission slugs snake_case** (`permissions.permission_id` regex, plus `'*'`). No `:`.
- **Schema conventions (already established by the foundation):** `_` only for plpgsql locals — never function names or params; params disambiguated by qualifying with the function name (`viewer_permission_org_ids.permission_id` style). `protected.*` = core, execute revoked from public/anon/authenticated + granted to `service_role`; `internal.*` = plumbing; `public.viewer_*` = wrappers granted to anon/authenticated. All security-definer fns `stable security definer parallel safe set search_path to ''`, fully-qualified.
- **Active membership predicate:** `accepted_at is not null and revoked_at is null and rejected_at is null` (agency also excludes `agency_deleted_at`).
- **Read the repo skills before editing:** `my-supabase`, `my-permissions`, `my-graphql`/`my-graphy` (for the MCP GraphQL mutations), `my-conventions` (TS).
- **pgTAP run:** loop `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -X -f <each tests/*.test.sql>`; zero `not ok`/`ERROR`.
- **Legacy layer stays DEFINED until Phase E** (separate teardown plan). During this plan, the legacy grant tables remain in the schema; the seed STOPS populating them (Phase B) and RLS STOPS reading them (Phase C). Legacy pgTAP that depends on legacy seed grants is migrated/retired in Phase C, not left red.

---

## File Structure

- **Modify:** `packages/supabase/supabase/migrations/00000000000000_schema.sql` — the `permission_grants` table + `protected.*`/`internal.*` core (Phase A); `protected.tenant_create` + any espejo grant (Phase B); every resource RLS policy (Phase C); `permission_grants` write RLS + the set-RPC (Phase D).
- **Modify:** `packages/supabase/supabase/seed.sql` — populate `permission_grants` instead of the 3 legacy tables (Phase B).
- **Modify tests:** `packages/supabase/supabase/tests/permission_grants.test.sql`, `check_permission.test.sql`, `lookup_objects.test.sql`, `viewer_can.test.sql` (Phase A); resource-RLS tests (`viewer_permissions`, `rls_memberships`, `viewer_tenant_permissions`, `permission_admin_rls`, etc.) ported in Phase C.
- **Modify:** `apps/platform/lib/mcp/tools/permissions.ts` + the generated GraphQL operations (Phase D).
- **Modify:** `src/types.ts` (regen, Phases A/D).

---

# PHASE A — Re-key `permission_grants` by membership (foundation revision)

This revises the merged-pending foundation (PR #83) so the subject is the membership, not the profile. It DROPS the speculative `object_tenant_id`/`object_agency_id` columns (object is implicit except agency→org reach).

### Task A1: Replace `permission_grants` columns + constraints + indexes

**Files:**
- Modify: `schema.sql` (the `public.permission_grants` block)
- Test: `packages/supabase/supabase/tests/permission_grants.test.sql`

**Interfaces:**
- Produces: `public.permission_grants(permission_grant_id, subject_organization_membership_id, subject_agency_membership_id, subject_agency_id, object_organization_id, permission_id, permission_grant_created_at)` with: exactly-one-subject CHECK; `object_organization_id` non-null only when `subject_agency_id` is set; unique constraints mirroring the 3 legacy grant tables.

- [ ] **Step 1: Rewrite the failing test** to the membership shape

Replace `packages/supabase/supabase/tests/permission_grants.test.sql` with (uses seeded org-membership id, agency-membership id, agency id — inspect `seed.sql` for the exact seeded ids; the first seeded org membership is `organization_membership_id = 1`):

```sql
begin;
select plan(6);

select has_table('public', 'permission_grants', 'public.permission_grants exists');

-- two subjects → rejected by permission_grants_one_subject
select throws_ok(
  $$ insert into public.permission_grants (subject_organization_membership_id, subject_agency_id, permission_id)
     values (1, 1, 'members_manage') $$,
  null, null, 'two subjects rejected');

-- zero subjects → rejected
select throws_ok(
  $$ insert into public.permission_grants (permission_id) values ('members_manage') $$,
  null, null, 'no subject rejected');

-- org-membership grant with an object set → rejected (object only for agency reach)
select throws_ok(
  $$ insert into public.permission_grants (subject_organization_membership_id, object_organization_id, permission_id)
     values (1, 1, 'members_manage') $$,
  null, null, 'org-membership grant cannot carry an object');

-- org-membership grant, no object → allowed (object implicit = membership's org)
select lives_ok(
  $$ insert into public.permission_grants (subject_organization_membership_id, permission_id)
     values (1, 'members_manage') $$,
  'org-membership grant allowed');

-- agency reach grant with NULL object → allowed (all-orgs wildcard)
select lives_ok(
  $$ insert into public.permission_grants (subject_agency_id, permission_id)
     select agency_id, '*' from public.agencies limit 1 $$,
  'agency all-orgs grant allowed');

select * from finish();
rollback;
```

- [ ] **Step 2: Run, verify it fails** (`column ... does not exist` / constraint name change)

Run: `pnpm db:reset` then psql the test file. Expected: FAIL.

- [ ] **Step 3: Replace the table DDL** in `schema.sql`

```sql
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

alter table public.permission_grants enable row level security;
revoke all on table public.permission_grants from anon, authenticated;
grant select, insert, update, delete on table public.permission_grants to anon, authenticated;
-- RLS policies added in Phase D.
```

- [ ] **Step 4: Run, verify it passes** (db:reset + psql the test). Expected: 6/6 PASS.
- [ ] **Step 5: Commit** `refactor(authz): re-key permission_grants by membership subjects`

### Task A2: Rewrite the core resolution to join through membership

**Files:** Modify `schema.sql` (`internal.is_active_*`, `protected.check_permission`, `protected.lookup_objects`, `protected.member_objects`, `protected.list_object_permissions`, `protected.agency_reachable_objects`); Test `check_permission.test.sql`, `lookup_objects.test.sql`.

**Interfaces:**
- `protected.check_permission(profile_id uuid, permission_id citext, object_type public.permission_object_type, object_id bigint) → boolean` — unchanged signature; now resolves via the membership-keyed grants.
- `internal.is_active_org_membership(organization_membership_id int) → boolean` and `internal.is_active_agency_membership(agency_membership_id int) → boolean` — membership-level active predicate (replaces the (profile,org) form).

- [ ] **Step 1: Update the tests** — the fixtures now grant by membership, not profile. In `check_permission.test.sql`, instead of `insert into permission_grants (subject_profile_id, object_organization_id, ...)`, do: create the org membership for the profile, then `insert into permission_grants (subject_organization_membership_id, permission_id) values (<that membership id>, 'payrolls_read')`. Keep the same 6 assertions (direct read true, direct write false, agency write true, agency read false, wildcard true, soft-deleted-agency denies). For the agency assertions, grant via `subject_agency_id` + `object_organization_id`.

- [ ] **Step 2: Run, verify fail.**

- [ ] **Step 3: Replace the function bodies.** `protected.check_permission`:

```sql
create or replace function protected.check_permission(
  profile_id uuid,
  permission_id extensions.citext,
  object_type public.permission_object_type,
  object_id bigint
)
  returns boolean stable security definer parallel safe language sql set search_path to '' as $$
    select case object_type
      when 'organization' then (
        exists ( -- direct: a grant on the viewer's active org membership in this org
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
```

`protected.lookup_objects`, `protected.member_objects`, `protected.list_object_permissions`, `protected.agency_reachable_objects`: apply the SAME membership-keyed joins (object id pulled from `m.organization_id`/`o.tenant_id`/`am.agency_id`; the agency-reach branch unchanged except it already keys by `subject_agency_id`). `list_object_permissions` keeps iterating `public.permissions` via `protected.check_permission`. Drop/replace `internal.is_active_org_member(profile,org)` with `internal.is_active_org_membership(membership_id)` ONLY if still referenced; the joins above inline the predicate, so the old `(profile,org)` helpers may become unused → leave for Phase E or remove if nothing references them (verify with grep before removing).

- [ ] **Step 4: Run, verify pass** (db:reset + psql `check_permission` + `lookup_objects` + the full suite). 
- [ ] **Step 5: `pnpm generate:types`** (permission_grants columns changed), strip the `⟐` banner.
- [ ] **Step 6: Commit** `refactor(authz): resolve permissions through membership join`

> After Phase A: re-run the WHOLE suite green and update PR #83. Phase A is the keystone — do not start B until A is green.

---

# PHASE B — Populate `permission_grants` from seed + tenant_create

### Task B1: Seed writes to `permission_grants`

**Files:** Modify `seed.sql` (lines ~141 org grants, ~246 agency-team grants, ~257 agency-org grants).

- [ ] Map each legacy seed insert to `permission_grants`, keying by the membership/agency the legacy row referenced:
  - `organization_membership_permissions(organization_membership_id, permission_id)` → `permission_grants(subject_organization_membership_id, permission_id)`.
  - `agency_membership_permissions(agency_membership_id, permission_id)` → `permission_grants(subject_agency_membership_id, permission_id)`.
  - `agencies_organizations_grants(agency_id, organization_id, permission_id)` → `permission_grants(subject_agency_id, object_organization_id, permission_id)` (keep `organization_id IS NULL` as the all-orgs form).
- [ ] **Coexistence (dual-write) — KEEP the legacy inserts too.** Do NOT remove the legacy seed inserts. Seed BOTH the legacy tables AND `permission_grants` with the same grants. This keeps the whole suite green throughout the cutover: legacy RLS+tests still read seeded legacy tables until Phase C migrates each table's reads, and the new model is populated for the new-model tests. Phase E removes the legacy seeding.
- [ ] `pnpm db:reset`; confirm reset is clean and `select count(*) from public.permission_grants` matches the legacy grant count. Full suite stays green (nothing removed).
- [ ] Commit `feat(authz): dual-write permission_grants in seed (coexistence)`

### Task B2: `protected.tenant_create` grants `*` via `permission_grants`

**Files:** Modify `schema.sql` (`protected.tenant_create`; grep for its `insert into public.organization_membership_permissions`).

- [ ] Find where `tenant_create` (and any `organization_create`/espejo flow) inserts the founder's `*` grant into `organization_membership_permissions`. **Dual-write:** ADD an insert into `permission_grants(subject_organization_membership_id, permission_id) values (<the membership it just created>, '*')` while KEEPING the legacy insert (coexistence, same rationale as B1). The membership id is the row the same function just inserted — capture it.
- [ ] Add a pgTAP assertion (extend `viewer_tenant_create`) that the founder's `*` grant lands in `permission_grants`; keep the existing legacy assertion (still valid — dual-write).
- [ ] `pnpm db:reset` + full suite green (nothing removed). Commit `feat(authz): tenant_create dual-writes founder grant to permission_grants`.

---

# PHASE C — Migrate resource RLS reads (the sweep)

77 helper references across ~42 policies. This is a deterministic find-and-replace driven by the mapping below. The agency bridge is now INSIDE the new helpers, so any policy of the form `X in (viewer_permission_org_ids('P')) or X in (viewer_agency_permission_org_ids('P'))` collapses to a single `X in (viewer_can_objects('P','organization'))`.

### Mapping (legacy → new)

| Legacy helper | New helper |
|---|---|
| `viewer_permission_org_ids('P')` | `viewer_can_objects('P','organization')` |
| `viewer_has_permission(O,'P')` | `viewer_can('P','organization',O)` |
| `viewer_permission_tenant_ids('P')` | `viewer_can_objects('P','tenant')` |
| `viewer_has_tenant_permission(T,'P')` | `viewer_can('P','tenant',T)` |
| `viewer_organization_ids()` | `viewer_member_objects('organization')` |
| `viewer_tenant_ids()` | `viewer_member_objects('tenant')` |
| `viewer_agency_permission_org_ids('P')` | **delete the branch** — folded into `viewer_can_objects('P','organization')` |
| `viewer_agency_tenant_ids()` | `viewer_agency_reachable_objects('tenant')` |
| `viewer_agency_ids()` (agency visibility) | `viewer_member_objects('agency')` |
| `viewer_has_agency_permission(O,'P')` | `viewer_can('P','organization',O)` (bridge inside) |

### Task C1..Cn: migrate policies table-by-table

- [ ] Enumerate every `create policy` whose `using`/`with check` references a legacy helper: `grep -nE "<the legacy helpers>" schema.sql`. Group by table.
- [ ] For EACH table's policies: apply the mapping; collapse the now-redundant `or … agency …` branches; keep `*_deleted_at is null` filters. One commit per table (or per small group), each followed by `pnpm db:reset` + the table's pgTAP green.
- [ ] **Update each migrated table's pgTAP** (`viewer_permissions`, `viewer_tenant_permissions`, `permission_admin_rls`, `rls_memberships`) to seed grants via `permission_grants` and assert via the new helpers. Under coexistence the legacy tables are STILL seeded (dual-write), so these tests stay green even before you touch them — but once a table's RLS reads the new model, its test must exercise the NEW path (add/repoint the fixture to `permission_grants`), or it would still pass via legacy seed and give a false green. Confirm each migrated policy by seeding ONLY a `permission_grants` grant (no legacy) inside the test txn and asserting access.
- [ ] After the whole sweep: full suite green. `pnpm generate:types` (no public surface change expected, but RLS changes are invisible to types — skip unless a function signature changed). Commit. Update PR.

> Verification gate for C: a profile with only an org-membership grant of `members_manage` can do exactly what the legacy model allowed; an agency affiliate reaches exactly the orgs its agency was granted — confirmed by the ported pgTAP, not by inspection.

---

# PHASE D — Writes: `permission_grants` RLS + the set-RPC + MCP

### Task D1: Write RLS on `permission_grants`

**Files:** `schema.sql`. Test: new `permission_grants_rls.test.sql`.

- [ ] Add policies (mirror the legacy `organization_membership_permissions` write policy, which required `members_manage` on the membership's org):
  - **select:** a grant is visible to someone who can see its subject's scope — for org-membership grants, `members of the membership's org` (reuse `viewer_member_objects('organization')`); keep it permissive enough for the member-edit UI. (Mirror the legacy select policy.)
  - **insert/update/delete:** require `viewer_can('members_manage', 'organization', <the membership's org>)` for org-membership grants; the agency-reach grants require the appropriate org-side permission (mirror the legacy `agencies_organizations_grants` write policy). Resolve the object org by joining the subject membership.
- [ ] pgTAP: a `members_manage` holder can grant/revoke on their org; a non-holder is blocked; the last-admin trigger equivalent still protects (see D2). db:reset + green. Commit.

### Task D2: Repoint the set-RPC + last-admin invariants

**Files:** `schema.sql` (`public.viewer_organization_membership_set_permissions_collection` at ~3094; the last-admin / final-`members_manage` triggers).

- [ ] Rewrite the set-RPC to replace the membership's grant set in `permission_grants` (delete-not-in + insert-missing keyed by `subject_organization_membership_id`) instead of `organization_membership_permissions`.
- [ ] Re-point the safety triggers (last active admin, final `members_manage`/`*`) to read `permission_grants`. Verify with `membership_invariants` / `journey_escalation_attempts` pgTAP (port them). db:reset + green. Commit.

### Task D3: MCP tools → `permission_grants`

**Files:** `apps/platform/lib/mcp/tools/permissions.ts` + generated GraphQL.

- [ ] The 4 tools already key by `organization_membership_id` — repoint the GraphQL mutations:
  - `grant_member_permission`: `insertIntoPermissionGrantsCollection` with `{ subjectOrganizationMembershipId, permissionId }`.
  - `revoke_member_permission`: `deleteFromPermissionGrantsCollection` filter `{ subjectOrganizationMembershipId, permissionId }`.
  - `set_member_permissions`: still calls `viewerOrganizationMembershipSetPermissionsCollection` (now writes `permission_grants` per D2) — no TS change beyond confirming the field still exists.
  - `update_member_status`: unchanged (operates on `organization_memberships`).
- [ ] Regenerate GraphQL: `pnpm generate:graphql:schema` then `pnpm --filter @apps/platform run generate:graphql`. Fix the typed operation imports.
- [ ] `pnpm --filter @apps/platform build:dry` (tsc) green. Run the MCP/permissions e2e or unit tests if present. Commit `feat(authz): repoint permission MCP tools to permission_grants`.

> After D: full pgTAP + `build:dry` green. The new model is now authoritative AND user-manageable via MCP. Legacy tables/helpers are unused → Phase E (separate teardown plan) drops them.

---

## Self-Review

- **Pending-invite regression fixed** → A1/A2 (grants key by membership; a pending org membership with NULL profile_id can carry grants). ✓
- **3-subject taxonomy** (org-membership / agency-membership / agency) → A1 CHECK. ✓
- **Object simplification** (drop object_tenant_id/object_agency_id) → A1. ✓
- **Populate** → B1/B2. **Reads** → C. **Writes (RLS+set-RPC+MCP)** → D1/D2/D3. **MCP manageability** → D3 (existing tools, minimal change). ✓
- **Deferred to Phase E (separate):** drop legacy tables + ~15 legacy helpers + legacy-only tests.
- **Placeholder check:** Phase C is intentionally a mapping-driven sweep (the mapping table makes each rewrite deterministic); execution enumerates the live `create policy` set rather than this plan pasting 42 near-identical rewrites (DRY). The B2/D2 exact line targets are located by grep at execution (their line numbers drift as the file changes).
- **Open decision (kept):** `object_organization_id = NULL` = agency "all orgs". Carried from the foundation; kept (mirrors legacy `agencies_organizations_grants`).
