-- RLS isolation for public.organization_memberships and public.organization_membership_permissions.
-- Verifies the security boundary that keeps tenant data from leaking across orgs.
--
-- New schema (post-invitations-merge): organization_membership_permissions references organization_membership_id
-- only; resolve org via JOIN. Helper variables `alice_org1_id` / `alice_org2_id` /
-- `bob_org1_id` capture the seeded serial PKs so we can write predictable inserts.

begin;

select plan(10);

-- ============================================================
-- Capture seeded organization_membership IDs (needed because PKs are serial)
-- ============================================================

create temporary table _mids on commit drop as
  select
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org1,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 2 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org2,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000b00b') as bob_org1;
-- Authenticated and anon both need to read this temp table during the RLS asserts below.
grant select on _mids to authenticated, anon;

-- ============================================================
-- Alice (member of org 1 acme + org 2 globex) sees rows in both orgs
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select set_eq(
  $$ select organization_id from public.organization_memberships order by organization_id, profile_id $$,
  $$ values (1), (1), (2) $$,
  'Alice sees all 3 organization_memberships across her orgs (alice@1, bob@1, alice@2)'
);

select set_eq(
  $$ select m.organization_id, mp.permission_id::text
       from public.organization_membership_permissions mp
       join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
       where m.profile_id = '00000000-0000-0000-0000-00000000a11c'
       order by m.organization_id, mp.permission_id $$,
  $$ values (1, '*'),
         (2, 'presets_manage') $$,
  'Alice sees her own grants in orgs 1 and 2'
);

reset role;

-- ============================================================
-- Bob (member of org 1 only) cannot see org 2 organization_memberships
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

select set_eq(
  $$ select organization_id from public.organization_memberships order by organization_id, profile_id $$,
  $$ values (1), (1) $$,
  'Bob sees only org 1 organization_memberships (alice@1, bob@1); org 2 hidden by RLS'
);

select is(
  (select count(*) from public.organization_memberships where organization_id = 2),
  0::bigint,
  'Bob explicitly cannot see any org 2 organization_memberships'
);

select is(
  (select count(*)
     from public.organization_membership_permissions mp
     join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
     where m.organization_id = 2),
  0::bigint,
  'Bob cannot see grants in org 2'
);

-- Bob lacks members_manage in org 1 — INSERT must be denied.
-- The new_organization_membership_permissions row references bob's own organization_membership; he can SELECT-RLS-see
-- it but the write policy `using (... viewer_permission_org_ids('members_manage'))` denies him.
prepare bob_insert_grant as
  insert into public.organization_membership_permissions (organization_membership_id, permission_id)
  values ((select bob_org1 from _mids), 'organization_manage');

select throws_ok(
  'execute bob_insert_grant',
  '42501',  -- insufficient_privilege; Postgres surfaces RLS violation as this SQLSTATE
  null,
  'Bob cannot grant himself a new permission (no members_manage)'
);

deallocate bob_insert_grant;

reset role;

-- ============================================================
-- Alice can grant a new permission in org 1 (she has wildcard, which covers members_manage)
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select lives_ok(
  $$ insert into public.organization_membership_permissions (organization_membership_id, permission_id)
     values ((select bob_org1 from _mids), 'organization_manage') $$,
  'Alice can grant organization_manage to Bob in org 1 (wildcard satisfies members_manage)'
);

-- But she cannot grant in org 2 (her org-2 grants do NOT include members_manage)
prepare alice_grant_org2 as
  insert into public.organization_membership_permissions (organization_membership_id, permission_id)
  values ((select alice_org2 from _mids), 'members_manage');

select throws_ok(
  'execute alice_grant_org2',
  '42501',
  null,
  'Alice cannot grant in org 2 (no members_manage there)'
);

deallocate alice_grant_org2;

reset role;

-- ============================================================
-- Anonymous caller — RLS denies everything
-- ============================================================

set local role anon;

select is(
  (select count(*) from public.organization_memberships),
  0::bigint,
  'anon sees no organization_memberships'
);

select is(
  (select count(*) from public.organization_membership_permissions),
  0::bigint,
  'anon sees no organization_membership_permissions'
);

reset role;

select * from finish();
rollback;
