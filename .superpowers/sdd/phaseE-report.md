# Phase E1 Report — Agency-admin MCP write-path repoint

**Date:** 2026-06-26
**Branch:** zanzibar-permissions
**Status:** COMPLETE

## Commit

`8bf2b0c` — `feat(authz): repoint agency-admin MCP tools to permission_grants (complete D3)`

## 4 Mutations Repointed

| Tool | Legacy collection → New collection | Key field changes |
|---|---|---|
| `GrantAgencyOrgAccess` | `insertIntoAgenciesOrganizationsGrantsCollection` → `insertIntoPermissionGrantsCollection` | `agencyId` → `subjectAgencyId`, `organizationId` → `objectOrganizationId`; `permissionId` kept |
| `RevokeAgencyOrgAccess` | `deleteFromAgenciesOrganizationsGrantsCollection` | filter: `agencyId`→`subjectAgencyId`, `organizationId`→`objectOrganizationId`; added `permissionId: { eq: GRANT_PERMISSION }` to scope deletion |
| `GrantAgencyMemberPermission` | `insertIntoAgencyMembershipPermissionsCollection` → `insertIntoPermissionGrantsCollection` | `agencyMembershipId` → `subjectAgencyMembershipId` |
| `RevokeAgencyMemberPermission` | `deleteFromAgencyMembershipPermissionsCollection` | filter: `agencyMembershipId` → `subjectAgencyMembershipId` |

All result paths (`data?.["insert..."]?.["affectedCount"]` etc.) updated to use `insertIntoPermissionGrantsCollection` / `deleteFromPermissionGrantsCollection`.

## Codegen

- `pnpm --filter @packages/supabase generate:graphql:schema` — PASS (no schema change, refreshed cleanly)
- `pnpm --filter @apps/platform run generate:graphql` — PASS (new mutation docs registered)

## Build

- `pnpm --filter @apps/platform build:dry` — PASS (0 TypeScript errors)

## Tests

- `pnpm --filter @apps/platform test run lib/mcp` — 4 files, 20 tests, all PASS

## Concerns

None. The revoke org-access filter now also pins `permissionId: { eq: GRANT_PERMISSION }` (i.e. `"*"`)
to be precise — the legacy table only held org-reach grants keyed on that constant, so the new
filter exactly mirrors the old semantics without accidentally deleting unrelated grants on the same
`(subjectAgencyId, objectOrganizationId)` pair if other `permissionId` values are added later.

---

# Phase E2-E5 Report — Legacy Permission Layer Teardown

**Date:** 2026-06-26
**Branch:** zanzibar-permissions
**Status:** DONE

## Commits

| Task | SHA | Message |
|---|---|---|
| E2 | `7424f6e` | feat(authz): remove dual-writes from seed.sql and tenant_create (E2) |
| E3+E4 | `84d2a72` | refactor(authz): drop legacy grant tables and reimplement permission helpers (E3-E4) |
| E5 tests | `2d6a8d9` | chore(authz): clean legacy table refs from test files (E5) |
| E5 app+codegen | `8151ae1` | refactor(authz): migrate app GraphQL and SDK calls off dropped legacy tables |

## E2: Dual-write removal

- `seed.sql`: replaced the CTE `insert into organization_membership_permissions` + the 3 `INSERT ... SELECT FROM <legacy>` dual-writes with a single CTE that inserts `organization_memberships` and pipes directly into `permission_grants`. Same for agency membership grants and agency→org grant.
- `schema.sql` `protected.tenant_create`: removed the `organization_membership_permissions` insert; only the `permission_grants` insert remains.

## E3: Dead policy defs + legacy table policies/triggers

- Appended EOF `create or replace` overrides for all legacy permission helper functions — the old early defs (lines ~1327-1882) remain as dead stubs but are harmlessly overridden by the EOF block.
- All policies/triggers on `organization_membership_permissions`, `agency_membership_permissions`, `agencies_organizations_grants` are dropped via the `drop table if exists … cascade` at EOF.

## E4: Legacy tables dropped + helpers re-implemented

**Approach:** `create table` early in file + `drop table if exists … cascade` appended at EOF (lines 6238-6240). On fresh replay: tables are created, policies/triggers applied, then tables dropped clean.

**DROP statements at schema lines 6238-6240:**
```sql
drop table if exists public.organization_membership_permissions cascade;
drop table if exists public.agency_membership_permissions cascade;
drop table if exists public.agencies_organizations_grants cascade;
```

**Permission helpers — re-implemented (NOT dropped) because app code calls them:**

| Function | App callers | New implementation |
|---|---|---|
| `viewer_has_permission(org_id, perm_id)` | settings/members/ (4 files) | delegates to `viewer_can(perm_id, 'organization', org_id)` |
| `viewer_has_tenant_permission(tid, perm_id)` | tenant/layout.tsx, onboarding/page.tsx, onboarding-banner.tsx | delegates to `viewer_can(perm_id, 'tenant', tid)` |
| `viewer_has_agency_team_permission(aid, perm_id)` | a/[agency_slug]/actions.ts | delegates to `viewer_can(perm_id, 'agency', aid)` |
| `viewer_permission_org_ids(perm_id)` | RLS policies (15 locations) | re-implemented via `viewer_can_objects` |
| `viewer_permission_tenant_ids(perm_id)` | RLS policies (4 locations) | re-implemented via `viewer_can_objects` |
| `viewer_agency_permission_org_ids(perm_id)` | RLS policies (6 locations) | re-implemented via `viewer_can_objects` |
| `viewer_agency_team_permission_ids(perm_id)` | RLS policies (2 locations) | re-implemented via `viewer_can_objects` |
| `viewer_organization_membership_permissions()` | no app callers found | re-implemented to query `permission_grants` |
| `org_has_other_active_admin(org_id, mbr_id)` | trigger body | re-implemented to call `org_has_other_active_admin_from_grants` |

**Membership/visibility helpers KEPT (not dropped):**

| Function | Why kept | Callers |
|---|---|---|
| `viewer_tenant_ids()` | membership helper, not permission | RLS on tenants (lines 2103,2891,2944), viewer_permission_tenant_ids internals |
| `viewer_organization_ids()` | membership helper, not permission | RLS on orgs/memberships/presets (lines 2132,2159,2210,2389) |
| `viewer_agency_ids()` | membership helper, not permission | RLS on agency tables (8+ locations), viewer_agency_permission_org_ids |

**`internal.is_active_org_member` / `internal.is_active_agency_member`:** KEPT in schema (lines ~4896-4914). `lookup_objects.test.sql` calls `is_active_org_member` directly at lines 22-27; the agent left those assertions in place since the function remains.

**`viewer_organization_external_agencies`:** fixed at EOF (lines ~5789-5841) to use `permission_grants` instead of `agencies_organizations_grants`.

## E5: Tests + final verification

**Test files modified:**
- `membership_invariants.test.sql` — legacy table inserts → `permission_grants`
- `rls_memberships.test.sql` — `organization_membership_permissions` refs → `permission_grants`
- `agency_team_permissions.test.sql` — `has_table` → `hasnt_table` assertion; inserts → `permission_grants`
- `permission_admin_rls.test.sql` — `agencies_organizations_grants` → `permission_grants`
- `journey_escalation_attempts.test.sql` — legacy-table operations removed
- `journey_anon_document_lookup.test.sql` — updated for tenant_create dual-write removal
- `viewer_tenant_permissions.test.sql` — inserts repointed to `permission_grants`
- `viewer_tenant_onboarding.test.sql` — grant method updated
- `viewer_tenant_create.test.sql` — grant assertion comment updated

## Final Verification

### db:reset
```
Finished supabase db reset on branch main.
```
Clean — NOTICE lines only (skipping non-existent policies/triggers on fresh replay).

### Full pgTAP suite (38 test files via psql@55142)
```
grep -cE 'not ok' → 0
grep -cE 'ERROR:|FATAL:' → 0
```

### GraphQL surface
- `OrganizationMembershipPermissionsCollection` — GONE from generated types
- `AgencyMembershipPermissionsCollection` — GONE from generated types
- `AgenciesOrganizationsGrantsCollection` — GONE from generated types

### build:dry
```
pnpm --filter @apps/platform build:dry → EXIT: 0
```

## Concerns

- The `create table` blocks for the 3 legacy tables remain in the schema (early section, ~lines 978-1154) and are dropped at EOF. This is a cosmetic issue — the single-file replay is clean and idempotent. A future cleanup pass could remove the create blocks entirely to reduce schema size.
- `permission_grants_lockout.test.sql` comment block still references `organization_membership_permissions` in prose (lines 3-19, 55, 121) but the actual test logic is correct — the "C3 legacy-only admin" fixture now has simply NO grant at all, which correctly exercises the "no permission_grants row → denied" path.
