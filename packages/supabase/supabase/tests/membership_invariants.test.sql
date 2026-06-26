-- Business invariants on organization_memberships / organization_membership_permissions:
--   * Cannot revoke 'members_manage' or '*' from the LAST claimed admin in an org.
--   * Cannot revoke your own organization_membership.
--   * service_role bypasses (admin/migration tools must still rescue stuck orgs).
--
-- Seeded state (see seed.sql):
--   Org 1 (acme):   Alice = '*' (sole admin), Bob = 'vacations_request' (not admin).
--   Org 2 (globex): Alice = payroll/previred/lre/banco/terminations (no admin perm).

begin;

select plan(11);

create temporary table _mids on commit drop as
  select
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org1,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000b00b') as bob_org1,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 2 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org2;
grant select on _mids to authenticated, anon, service_role;

-- ============================================================
-- Alice authenticates as herself
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

-- Last-admin protection: Alice cannot delete her own '*' from org 1 (sole admin).
select throws_ok(
  format(
    $$ delete from public.organization_membership_permissions
       where organization_membership_id = %s and permission_id = '*' $$,
    (select alice_org1 from _mids)
  ),
  'P0001',
  null,
  'last admin cannot revoke wildcard permission via organization_membership_permissions delete'
);

-- Self-remove protection: Alice cannot revoke her own org 1 organization_membership.
select throws_ok(
  format(
    $$ update public.organization_memberships
       set organization_membership_revoked_at = current_timestamp
       where organization_membership_id = %s $$,
    (select alice_org1 from _mids)
  ),
  'P0001',
  null,
  'cannot revoke own organization_membership (self-remove blocked)'
);

-- Non-admin permission deletion is allowed (Alice removing payroll_run from her org 2 grants).
select lives_ok(
  format(
    $$ delete from public.organization_membership_permissions
       where organization_membership_id = %s and permission_id = 'payroll_run' $$,
    (select alice_org2 from _mids)
  ),
  'deleting a non-admin permission is unaffected by the trigger'
);

-- ============================================================
-- Admin holding BOTH '*' and 'members_manage' can demote one — the other still
-- grants admin status, so no lockout risk.
-- ============================================================

-- Alice (sole admin via '*') grants herself members_manage. RLS allows this because
-- the wildcard satisfies the 'members_manage' permission check on the write policy.
select lives_ok(
  format(
    $$ insert into public.organization_membership_permissions (organization_membership_id, permission_id)
       values (%s, 'members_manage') $$,
    (select alice_org1 from _mids)
  ),
  'admin with * can add members_manage to themselves'
);
-- Mirror insert into permission_grants so the new-model helpers see Alice's members_manage.
-- (Still authenticated as Alice, who has '*' in permission_grants → RLS write policy passes.)
insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values ((select alice_org1 from _mids), 'members_manage')
  on conflict do nothing;

-- Now Alice holds both. She can delete '*' because members_manage keeps her admin.
select lives_ok(
  format(
    $$ delete from public.organization_membership_permissions
       where organization_membership_id = %s and permission_id = '*' $$,
    (select alice_org1 from _mids)
  ),
  'admin with both can drop * while keeping members_manage'
);
-- Mirror delete from permission_grants: '*' no longer held by Alice in the new model.
-- (Still authenticated as Alice, who retains members_manage in permission_grants → RLS passes.)
delete from public.permission_grants
  where subject_organization_membership_id = (select alice_org1 from _mids)
    and permission_id = '*';

-- With only members_manage left, deleting it would strip admin entirely — blocked.
select throws_ok(
  format(
    $$ delete from public.organization_membership_permissions
       where organization_membership_id = %s and permission_id = 'members_manage' $$,
    (select alice_org1 from _mids)
  ),
  'P0001',
  null,
  'cannot delete the remaining admin permission when no other admin exists'
);

reset role;

-- ============================================================
-- Add a second admin to org 1, then verify Alice CAN demote herself
-- ============================================================

-- service_role for the legacy OMP insert (bypasses RLS that would require members_manage).
-- permission_grants insert is done as Alice (authenticated) because service_role lacks
-- insert privileges on permission_grants — Alice still holds members_manage in PG here.
set local request.jwt.claims to '';
set local role service_role;
insert into public.organization_membership_permissions (organization_membership_id, permission_id)
values ((select bob_org1 from _mids), '*');
reset role;

-- Alice inserts Bob's '*' into permission_grants; she has members_manage → write policy passes.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';
insert into public.permission_grants (subject_organization_membership_id, permission_id)
values ((select bob_org1 from _mids), '*')
on conflict do nothing;

-- Now Bob holds '*' too — Alice can drop her remaining members_manage without locking the org.
select lives_ok(
  format(
    $$ delete from public.organization_membership_permissions
       where organization_membership_id = %s and permission_id = 'members_manage' $$,
    (select alice_org1 from _mids)
  ),
  'last admin permission delete succeeds when another admin remains'
);
-- Mirror delete from permission_grants: Alice now holds no admin grants in either model.
-- Still authenticated as Alice with members_manage in permission_grants → delete allowed.
delete from public.permission_grants
  where subject_organization_membership_id = (select alice_org1 from _mids)
    and permission_id = 'members_manage';
reset role;

-- ============================================================
-- Bob revokes Alice (now non-admin) — should succeed since Bob is the only admin
-- left and Alice is no longer an admin (lost '*' above).
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

select lives_ok(
  format(
    $$ update public.organization_memberships
       set organization_membership_revoked_at = current_timestamp
       where organization_membership_id = %s $$,
    (select alice_org1 from _mids)
  ),
  'admin can revoke a non-admin peer'
);

-- Bob is now the sole admin — he cannot revoke his own organization_membership.
select throws_ok(
  format(
    $$ update public.organization_memberships
       set organization_membership_revoked_at = current_timestamp
       where organization_membership_id = %s $$,
    (select bob_org1 from _mids)
  ),
  'P0001',
  null,
  'sole admin cannot revoke their own organization_membership (self-remove blocked first)'
);

reset role;

-- ============================================================
-- service_role bypass
-- ============================================================
-- Triggers detect "is this an authenticated user?" via auth.uid(). Clear the JWT
-- claim from the previous block so auth.uid() returns NULL for the service_role
-- section.

set local request.jwt.claims to '';
set local role service_role;

-- service_role can delete '*' from the last admin (e.g. migration rescuing a stuck org).
-- After the alice-revoke above, Bob is the lone admin in org 1.
select lives_ok(
  format(
    $$ delete from public.organization_membership_permissions
       where organization_membership_id = %s and permission_id = '*' $$,
    (select bob_org1 from _mids)
  ),
  'service_role bypasses last-admin permission protection'
);

-- service_role can revoke Bob's organization_membership even when he is the last admin.
select lives_ok(
  format(
    $$ update public.organization_memberships
       set organization_membership_revoked_at = current_timestamp
       where organization_membership_id = %s $$,
    (select bob_org1 from _mids)
  ),
  'service_role bypasses last-admin organization_membership protection'
);

reset role;

select * from finish();
rollback;
