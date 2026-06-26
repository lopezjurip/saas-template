-- Public-SDK + RLS permission administration that MCP relies on:
--   1. permission_grants agency→org write policy (the ORG side, gated by organization_manage)
--   2. viewer_organization_membership_set_permissions_collection (atomic preset apply, gated by members_manage)
-- Seed (seed.sql):
--   Alice (a11c): org 1 wildcard '*' (so organization_manage + members_manage), org 2 presets_manage.
--   Bob   (b00b): org 1 presets_manage only.
--   demo-auditores agency with a seeded (agency, org 1, '*') grant.

begin;

select plan(11);

create temporary table _g on commit drop as
  select
    (select agency_id from public.agencies where agency_slug = 'demo-auditores') as agency_id,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org1,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000b00b') as bob_org1;
grant select on _g to authenticated;

-- ============================================================
-- permission_grants agency→org — Alice (organization_manage on org 1 via wildcard)
-- ============================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select lives_ok(
  $$ insert into public.permission_grants (subject_agency_id, object_organization_id, permission_id)
     values ((select agency_id from _g), 1, 'members_manage') $$,
  'an org admin can grant an agency access to their organization'
);

select throws_ok(
  $$ insert into public.permission_grants (subject_agency_id, object_organization_id, permission_id)
     values ((select agency_id from _g), null, 'members_manage') $$,
  '42501',
  null,
  'global grants (object_organization_id IS NULL) remain denied to authenticated users'
);

select lives_ok(
  $$ delete from public.permission_grants
       where subject_agency_id = (select agency_id from _g)
         and object_organization_id = 1
         and permission_id = '*' $$,
  'an org admin can revoke an agency''s access to their organization'
);

select is(
  (select count(*) from public.permission_grants
     where subject_agency_id = (select agency_id from _g)
       and object_organization_id = 1
       and permission_id = '*'),
  0::bigint,
  'the revoked grant is gone'
);

reset role;

-- Bob has only presets_manage on org 1 → cannot manage external access.
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

select throws_ok(
  $$ insert into public.permission_grants (subject_agency_id, object_organization_id, permission_id)
     values ((select agency_id from _g), 1, 'tenant_manage') $$,
  '42501',
  null,
  'a member without organization_manage cannot grant agency access'
);

-- viewer_organization_membership_set_permissions_collection requires members_manage.
select throws_ok(
  $$ select public.viewer_organization_membership_set_permissions_collection((select bob_org1 from _g), array['members_manage']::extensions.citext[]) $$,
  'P0001',
  'no_permission',
  'a member without members_manage cannot set permissions'
);

reset role;

-- ============================================================
-- viewer_organization_membership_set_permissions_collection — Alice (wildcard → members_manage)
-- ============================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

-- Clearing the org's last admin is blocked (Bob is not an admin yet).
select throws_ok(
  $$ select public.viewer_organization_membership_set_permissions_collection((select alice_org1 from _g), array['presets_manage']::extensions.citext[]) $$,
  'P0001',
  'last_admin_protected',
  'dropping the last admin''s wildcard via set_permissions is blocked'
);

select lives_ok(
  $$ select public.viewer_organization_membership_set_permissions_collection((select bob_org1 from _g), array['members_manage']::extensions.citext[]) $$,
  'an admin can replace another member''s permission set'
);

select set_eq(
  $$ select permission_id::text from public.permission_grants
       where subject_organization_membership_id = (select bob_org1 from _g) $$,
  $$ values ('members_manage') $$,
  'set_permissions replaced Bob''s grants atomically (permission_grants)'
);

-- Swapping one admin slug for another does NOT trip the last-admin trigger (grant-before-revoke).
select lives_ok(
  $$ select public.viewer_organization_membership_set_permissions_collection((select alice_org1 from _g), array['members_manage']::extensions.citext[]) $$,
  'swapping wildcard for members_manage on the last admin is allowed (no lockout)'
);

select set_eq(
  $$ select permission_id::text from public.permission_grants
       where subject_organization_membership_id = (select alice_org1 from _g) $$,
  $$ values ('members_manage') $$,
  'the wildcard was swapped for members_manage atomically (permission_grants)'
);

reset role;

select * from finish();
rollback;
