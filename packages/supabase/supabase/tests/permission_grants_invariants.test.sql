-- D2: Safety invariants enforced via permission_grants trigger.
-- Mirrors membership_invariants.test.sql but operates on the new permission_grants table.
-- Tests:
--   1. Last admin cannot delete their '*' grant from permission_grants (sole admin).
--   2. Non-admin permission delete is unaffected.
--   3. Admin with both '*' and 'members_manage' can drop '*' (other still grants admin).
--   4. With only 'members_manage' left and no other admin, deletion is blocked.
--   5. After adding a second admin, the first admin CAN drop their last admin grant.
--   6. service_role (postgres superuser in psql) bypasses the trigger.
--
-- Seeded state:
--   Org 1 (acme):   Alice = '*' (sole admin), Bob = 'presets_manage'.
--   Org 2 (globex): Alice = 'presets_manage' (non-admin).
--
-- Note: service_role lacks INSERT on permission_grants (only anon/authenticated are granted).
-- Setup INSERTs run as postgres superuser (default psql session user).

begin;

select plan(6);

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

-- 1. Last-admin protection: Alice cannot delete her own '*' from permission_grants (sole admin).
select throws_ok(
  format(
    $$ delete from public.permission_grants
       where subject_organization_membership_id = %s and permission_id = '*' $$,
    (select alice_org1 from _mids)
  ),
  'P0001',
  null,
  'last admin cannot revoke wildcard grant via permission_grants delete'
);

-- 2. Non-admin permission deletion is allowed (Alice removing presets_manage from org 2 grants).
select lives_ok(
  format(
    $$ delete from public.permission_grants
       where subject_organization_membership_id = %s and permission_id = 'presets_manage' $$,
    (select alice_org2 from _mids)
  ),
  'deleting a non-admin grant is unaffected by the trigger'
);

-- ============================================================
-- Admin holding BOTH '*' and 'members_manage' can demote one — the other still
-- grants admin status, so no lockout risk.
-- ============================================================

-- Alice (sole admin via '*') adds members_manage to herself.
-- Setup as postgres superuser (reset role first; superuser bypasses RLS).
reset role;
insert into public.permission_grants (subject_organization_membership_id, permission_id)
values ((select alice_org1 from _mids), 'members_manage')
on conflict do nothing;

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

-- 3. Now Alice holds both. She can delete '*' because members_manage keeps her admin.
select lives_ok(
  format(
    $$ delete from public.permission_grants
       where subject_organization_membership_id = %s and permission_id = '*' $$,
    (select alice_org1 from _mids)
  ),
  'admin with both can drop * from permission_grants while keeping members_manage'
);

-- 4. With only members_manage left, deleting it would strip admin entirely — blocked.
select throws_ok(
  format(
    $$ delete from public.permission_grants
       where subject_organization_membership_id = %s and permission_id = 'members_manage' $$,
    (select alice_org1 from _mids)
  ),
  'P0001',
  null,
  'cannot delete the remaining admin grant when no other admin exists'
);

reset role;

-- ============================================================
-- Add a second admin to org 1, then verify Alice CAN demote herself
-- ============================================================

-- Setup as postgres superuser.
insert into public.permission_grants (subject_organization_membership_id, permission_id)
values ((select bob_org1 from _mids), '*')
on conflict do nothing;

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

-- 5. Now Bob holds '*' too — Alice can drop her remaining members_manage without locking the org.
select lives_ok(
  format(
    $$ delete from public.permission_grants
       where subject_organization_membership_id = %s and permission_id = 'members_manage' $$,
    (select alice_org1 from _mids)
  ),
  'last admin grant delete succeeds when another admin remains (permission_grants)'
);

reset role;
-- Clear JWT claims so auth.uid() returns NULL (superuser bypass).
set local request.jwt.claims to '';

-- ============================================================
-- Postgres superuser bypass (mirrors service_role bypass in membership_invariants)
-- ============================================================

-- 6. Postgres superuser can delete '*' from the last admin (e.g. migration rescuing a stuck org).
-- After the alice-demote above, Bob is the lone admin in org 1 (holds '*').
-- viewer_profile_id() returns NULL when request.jwt.claims is empty → trigger bypasses.
select lives_ok(
  format(
    $$ delete from public.permission_grants
       where subject_organization_membership_id = %s and permission_id = '*' $$,
    (select bob_org1 from _mids)
  ),
  'postgres superuser (no JWT) bypasses last-admin grant protection in permission_grants'
);

select * from finish();
rollback;
