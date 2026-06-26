-- CRITICAL invariant test: permission_grants as SOLE store (no legacy mirror).
--
-- Purpose: prove that the repointed trigger + set-RPC read permission_grants,
-- not organization_membership_permissions.  All fixtures seed grants ONLY in
-- permission_grants — zero rows in organization_membership_permissions — so any
-- code path that still reads the legacy table will behave as if the admin has no
-- permission and either silently allow the revoke (CRITICAL #1) or deny the RPC
-- call (CRITICAL #2).
--
-- Fixtures (created fresh, rolled back):
--   - Tenant 100 / Org 100: C2 is sole admin via permission_grants '*' only.
--   - Tenant 101 / Org 101: C3 has '*' only in organization_membership_permissions (legacy-only).
--
-- Assertions:
--   1. Revoking C2's org_membership is BLOCKED (organization_memberships_protect_revoke
--      reads permission_grants — sees C2 as the sole admin → raises last_admin_protected).
--   2. set-RPC call succeeds when caller (C2) has members_manage ONLY in permission_grants.
--   3. set-RPC call is rejected when caller (C3) has members_manage ONLY in legacy
--      organization_membership_permissions (permission_grants empty for C3).

begin;

select plan(3);

-- ============================================================
-- Setup
-- ============================================================

-- Users
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000c2', 'c2@grants-only.test'),
  ('00000000-0000-0000-0000-0000000000c3', 'c3@legacy-only.test')
on conflict do nothing;

-- Tenant + org for C2 (permission_grants-only admin)
insert into public.tenants (tenant_id, tenant_slug, tenant_name)
  values (100, 'grants-only-tenant', 'Grants Only Tenant')
  on conflict (tenant_id) do nothing;

insert into public.organizations (organization_id, tenant_id, organization_slug, organization_name)
  values (100, 100, 'grants-only-org', 'Grants Only Org')
  on conflict (organization_id) do nothing;

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (100, '00000000-0000-0000-0000-0000000000c2', current_timestamp);

-- C2's admin grant: permission_grants ONLY — no legacy row.
insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values (
    (select organization_membership_id from public.organization_memberships
     where organization_id = 100 and profile_id = '00000000-0000-0000-0000-0000000000c2'),
    '*'
  );

-- Tenant + org for C3 (legacy-only admin — organization_membership_permissions only)
insert into public.tenants (tenant_id, tenant_slug, tenant_name)
  values (101, 'legacy-only-tenant', 'Legacy Only Tenant')
  on conflict (tenant_id) do nothing;

insert into public.organizations (organization_id, tenant_id, organization_slug, organization_name)
  values (101, 101, 'legacy-only-org', 'Legacy Only Org')
  on conflict (organization_id) do nothing;

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (101, '00000000-0000-0000-0000-0000000000c3', current_timestamp);

-- C3's admin grant: organization_membership_permissions ONLY — no permission_grants row.
insert into public.organization_membership_permissions (organization_membership_id, permission_id)
  values (
    (select organization_membership_id from public.organization_memberships
     where organization_id = 101 and profile_id = '00000000-0000-0000-0000-0000000000c3'),
    'members_manage'
  );

-- Also add a non-admin member to org 100 so the set-RPC has a target.
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (100, '00000000-0000-0000-0000-0000000000c3', current_timestamp);

-- ============================================================
-- Assertion 1: Revoking sole admin membership blocked via permission_grants store.
--
-- C2 is the sole admin of org 100. Her admin status lives only in permission_grants.
-- The trigger (organization_memberships_protect_revoke) must call
-- org_has_other_active_admin_from_grants (reads permission_grants) to detect this.
-- If it still calls the legacy helper, it sees no legacy row → no admin found → the
-- revoke would silently SUCCEED (catastrophic lockout).
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-0000000000c2", "app_metadata": {"tenants": [{"id": 100, "slug": "grants-only-tenant"}], "organizations": [{"id": 100}]}}';

select throws_ok(
  format(
    $$ update public.organization_memberships
       set organization_membership_revoked_at = current_timestamp
       where organization_membership_id = %s $$,
    (select organization_membership_id from public.organization_memberships
     where organization_id = 100 and profile_id = '00000000-0000-0000-0000-0000000000c2')
  ),
  'P0001',
  null,
  'sole admin (grants-only) cannot be revoked — trigger reads permission_grants'
);

-- ============================================================
-- Assertion 2: set-RPC succeeds when caller has members_manage ONLY in permission_grants.
--
-- C2 has '*' in permission_grants (covers members_manage via wildcard).
-- The set-RPC gate calls viewer_can('members_manage','organization',100) which reads
-- permission_grants. If it still called viewer_has_permission (legacy), C2 would have
-- no legacy row → gate raises 'no_permission' → this test would FAIL.
-- ============================================================

select lives_ok(
  format(
    $$ select public.viewer_organization_membership_set_permissions_collection(%s, array['presets_manage']::extensions.citext[]) $$,
    (select organization_membership_id from public.organization_memberships
     where organization_id = 100 and profile_id = '00000000-0000-0000-0000-0000000000c3')
  ),
  'set-RPC succeeds for caller with members_manage only in permission_grants (no legacy row)'
);

-- ============================================================
-- Assertion 3: set-RPC is rejected when caller has members_manage ONLY in legacy store.
--
-- C3 is acting as admin of org 101 — their grant is in organization_membership_permissions
-- only, with no matching permission_grants row.
-- viewer_can reads permission_grants → sees nothing → raises 'no_permission'.
-- This confirms the gate is wired to the new store (not the legacy one).
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-0000000000c3", "app_metadata": {"tenants": [{"id": 101, "slug": "legacy-only-tenant"}], "organizations": [{"id": 101}]}}';

select throws_ok(
  format(
    $$ select public.viewer_organization_membership_set_permissions_collection(%s, array['presets_manage']::extensions.citext[]) $$,
    (select organization_membership_id from public.organization_memberships
     where organization_id = 101 and profile_id = '00000000-0000-0000-0000-0000000000c3')
  ),
  'P0001',
  null,
  'set-RPC denied for caller with members_manage only in legacy store (no permission_grants row)'
);

select * from finish();
rollback;
