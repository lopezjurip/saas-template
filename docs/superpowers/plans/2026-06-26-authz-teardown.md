# Authz Teardown (Phase E) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Remove the legacy permission layer now that `permission_grants` is authoritative end-to-end. Drop the 3 legacy grant tables, the legacy permission helpers, the dead early policy defs (the Phase-C "landmine"), the dual-writes, and legacy-only tests — leaving ONLY the new model. Complete the one write path D3 missed (agency-admin MCP).

**Verification rules (LEARNED THIS CUTOVER — do not skip):**
- The worktree DB is on `SUPABASE_DB_PORT` from `.env.development.local` (currently **55142**), NOT 54322. Run pgTAP via `psql "postgresql://postgres:postgres@127.0.0.1:55142/postgres" -f <file>`.
- pgTAP failures print ` not ok` (LEADING SPACE) → detect with `grep -cE 'not ok'` (NO `^`). Also check `ERROR:`/`FATAL:`.
- After the teardown, PROVE `schema.sql` replays clean from scratch: `psql ... -v ON_ERROR_STOP=1 -f migrations/00000000000000_schema.sql` against a fresh DB must print no error (or run `pnpm db:reset` and confirm "Finished supabase db reset").
- Do NOT delete the worktree docker volume.

## Global Constraints
- pnpm only. After schema edits: `pnpm db:reset` then `pnpm generate:types` (+ `generate:graphql:schema` + `--filter @apps/platform generate:graphql` for GraphQL surface changes; strip `⟐` banner from `types.ts:1`).
- snake_case slugs. Schema conventions: `_` only for plpgsql locals; `protected`/`internal`/`public` split.
- After E, `permission_grants` is the ONLY grant store. No coexistence.

---

### Task E1: Complete D3 — repoint `agency-admin.ts` MCP tools to `permission_grants`

**Files:** `apps/platform/lib/mcp/tools/agency-admin.ts`.

D3 missed these 4 tools (they still write legacy agency tables):
- `GrantAgencyOrgAccess` / `RevokeAgencyOrgAccess` → `agenciesOrganizationsGrants`. Repoint to `permission_grants` with `subjectAgencyId` + `objectOrganizationId` + `permissionId` (the agency→org reach grant; `organization_id` NULL = all-orgs stays service_role-only per the write RLS).
- `GrantAgencyMemberPermission` / `RevokeAgencyMemberPermission` → `agencyMembershipPermissions`. Repoint to `permission_grants` with `subjectAgencyMembershipId` + `permissionId`.

- [ ] Read the file + `my-graphql`/`my-graphy`. Repoint each mutation to `insertIntoPermissionGrantsCollection`/`deleteFromPermissionGrantsCollection` with the right subject column. Keep idempotency + error handling.
- [ ] Regenerate GraphQL (`generate:graphql:schema` then `--filter @apps/platform generate:graphql`). `pnpm --filter @apps/platform build:dry` green.
- [ ] Commit `feat(authz): repoint agency-admin MCP tools to permission_grants (complete D3)`.

### Task E2: Remove dual-writes

**Files:** `seed.sql`, `schema.sql` (`protected.tenant_create`).

- [ ] In `seed.sql`: delete the legacy inserts into `organization_membership_permissions` / `agency_membership_permissions` / `agencies_organizations_grants`. Keep ONLY the `permission_grants` inserts (change the `INSERT ... SELECT FROM <legacy>` to direct value inserts since the legacy tables will be gone, OR insert literal rows). 
- [ ] In `protected.tenant_create` (and any espejo/organization_create): delete the legacy `organization_membership_permissions` insert; keep the `permission_grants` insert.

### Task E3: Delete the dead early policy defs (landmine) + drop legacy table policies/triggers

**Files:** `schema.sql`.

- [ ] Enumerate the EARLY resource-table policy defs that reference legacy helpers and were OVERRIDDEN by the Phase-C EOF block (e.g. lines ~2099-2168 tenants/organizations/organization_memberships; the agency ones ~1701-1882; profile_identities; tenant_domains; tenant_sso; permission_presets; storage). For each, DELETE the early `create policy` def — the EOF override is the live one. (Verify post-reset that the live policy is the EOF version via `pg_policies`.)
- [ ] Delete the policies/triggers/indexes defined ON the 3 legacy grant tables (incl. `organization_membership_permissions_protect_last_admin` and any RLS on them).

### Task E4: Drop legacy tables + legacy permission helpers

**Files:** `schema.sql`.

- [ ] Drop tables: `organization_membership_permissions`, `agency_membership_permissions`, `agencies_organizations_grants` (remove their `create table` + all references).
- [ ] Drop legacy PERMISSION helpers (after confirming no remaining caller via `grep` + the `pg_proc` audit from the cutover): `viewer_has_permission`, `viewer_permission_org_ids`, `viewer_permission_tenant_ids`, `viewer_has_tenant_permission`, `viewer_has_agency_permission`, `viewer_agency_permission_org_ids`, `viewer_agency_team_permission_ids`, `viewer_has_agency_team_permission`, the legacy `org_has_other_active_admin` (KEEP `org_has_other_active_admin_from_grants`), and `viewer_organization_membership_permissions` (the UI listing — FIRST confirm nothing reads it; if the app/SQL uses it, repoint to `viewer_object_permissions`/`viewer_relations` before dropping).
- [ ] **Audit, do NOT blindly drop, the membership/visibility helpers** `viewer_tenant_ids`, `viewer_organization_ids`, `viewer_agency_ids`: grep schema + app. If still used by collections (`viewer_tenants_collection`, etc.) or app hooks, KEEP them (they are general membership helpers, not part of the permission teardown). Drop ONLY if every caller already uses `viewer_member_objects`. Report which you kept and why.
- [ ] Drop `internal.is_active_org_member`/`is_active_agency_member` (the `(profile,org)` forms) IF unused — update `lookup_objects.test.sql` which calls `is_active_org_member` directly (switch it to assert via `member_objects` or remove that assertion).

### Task E5: Remove legacy-only tests + legacy halves; final verification

**Files:** `supabase/tests/*`.

- [ ] Delete test files that exclusively test the dropped legacy tables/helpers (e.g. legacy-grant RLS tests). For `membership_invariants.test.sql` and `journey_escalation_attempts.test.sql`, remove the legacy-table operations and the hand-mirroring added during the cutover — keep only the `permission_grants` assertions (the new model is the only model now).
- [ ] `pnpm db:reset` (must finish clean) + full suite via psql@55142 with `grep -cE 'not ok'` == 0.
- [ ] PROVE replay-from-scratch: apply `migrations/00000000000000_schema.sql` to a fresh DB with `ON_ERROR_STOP=1` → no error.
- [ ] `pnpm generate:types` + `generate:graphql:schema` (the dropped tables must disappear from the GraphQL surface) + `--filter @apps/platform generate:graphql`; `pnpm --filter @apps/platform build:dry` green (no references to dropped collections remain).
- [ ] Commit per task; final commit `chore(authz): drop legacy permission layer (Phase E teardown complete)`.

## Self-Review
- D3 completion (agency-admin) → E1. Dual-writes → E2. Landmine + legacy policies/triggers → E3. Tables + helpers (with conservative audit of shared membership helpers) → E4. Tests + final verification (replay-from-scratch, correct port/detector) → E5.
- Risk: dropping a helper still referenced → `db:reset` breaks. Mitigation: every drop preceded by a grep/`pg_proc` audit; the replay-from-scratch check is the backstop.
