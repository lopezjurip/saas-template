begin;
select plan(9);

-- need payrolls_read/payrolls_write in the catalog for FK
insert into public.permissions (permission_id) values ('payrolls_read'), ('payrolls_write')
  on conflict do nothing;

-- fixtures: profile P1 (direct member of org 1), profile P2 (member of agency A reaching org 1)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000b1', 'b1@test.dev'),
  ('00000000-0000-0000-0000-0000000000b2', 'b2@test.dev')
  on conflict do nothing;

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000b1', current_timestamp);

-- P1 gets a direct payrolls_read grant via org membership
insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values (
    (select organization_membership_id from public.organization_memberships
     where organization_id = 1 and profile_id = '00000000-0000-0000-0000-0000000000b1'),
    'payrolls_read'
  );

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

-- (1) direct member has the directly-granted permission on the org → true
select ok(
  protected.check_permission('00000000-0000-0000-0000-0000000000b1', 'payrolls_read', 'organization', 1),
  'P1 has direct payrolls_read on org 1');

-- (2) same member lacks a different permission → false
select ok(
  not protected.check_permission('00000000-0000-0000-0000-0000000000b1', 'payrolls_write', 'organization', 1),
  'P1 lacks payrolls_write on org 1 (not granted)');

-- (3) an active agency affiliate reaches the agency''s granted permission on the org → true
select ok(
  protected.check_permission('00000000-0000-0000-0000-0000000000b2', 'payrolls_write', 'organization', 1),
  'P2 reaches payrolls_write on org 1 via agency');

-- (4) that affiliate does NOT have a permission the agency was not granted → false
select ok(
  not protected.check_permission('00000000-0000-0000-0000-0000000000b2', 'payrolls_read', 'organization', 1),
  'P2 lacks payrolls_read on org 1 (agency grant is write-only)');

-- (5) a member with '*' wildcard has an arbitrary permission on the org → true
insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values (
    (select organization_membership_id from public.organization_memberships
     where organization_id = 1 and profile_id = '00000000-0000-0000-0000-0000000000b1'),
    '*'
  );

select ok(
  protected.check_permission('00000000-0000-0000-0000-0000000000b1', 'payrolls_write', 'organization', 1),
  'P1 with * now has payrolls_write on org 1');

-- (6) soft-deleting the agency denies the affiliate even with a valid grant
update public.agencies
  set agency_deleted_at = current_timestamp
  where agency_slug = 'test-agency-check-permission';

select ok(
  not protected.check_permission('00000000-0000-0000-0000-0000000000b2', 'payrolls_write', 'organization', 1),
  'soft-deleted agency denies the bridge');

-- ── Phase-A regression: membership-keyed permission grants ───────────────────

-- (7) Pending-invite isolation: a grant on a pending membership must not
--     bleed to any real profile, because check_permission requires
--     organization_membership_accepted_at IS NOT NULL.
--     Use a fresh profile that has no other grants in org 1.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000e1', 'e1@test.dev')
  on conflict do nothing;

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000e1', current_timestamp);

do $$
declare v_pending_id int;
begin
  insert into public.organization_memberships
    (organization_id, organization_membership_invite_email)
  values (1, 'pending-invite@test.dev')
  returning organization_membership_id into v_pending_id;

  insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values (v_pending_id, 'members_manage');
end $$;

select ok(
  not protected.check_permission('00000000-0000-0000-0000-0000000000e1', 'members_manage', 'organization', 1),
  'pending invite grant does not grant access to any real profile');

-- (8) Cross-member isolation: grant on member X must not bleed to member Y
--     in the same org.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000c1', 'c1@test.dev'),
  ('00000000-0000-0000-0000-0000000000c2', 'c2@test.dev')
  on conflict do nothing;

-- C1 gets an accepted membership + members_manage grant
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000c1', current_timestamp);

insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values (
    (select organization_membership_id from public.organization_memberships
     where organization_id = 1 and profile_id = '00000000-0000-0000-0000-0000000000c1'),
    'members_manage'
  );

-- C2 is also an accepted member of org 1 but has no grant
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000c2', current_timestamp);

select ok(
  not protected.check_permission('00000000-0000-0000-0000-0000000000c2', 'members_manage', 'organization', 1),
  'grant on another member does not leak to the viewer');

-- (9) Agency all-orgs grant (NULL object_organization_id) resolves on a specific org.
insert into public.agencies (agency_name, agency_slug)
  values ('All-Orgs Agency', 'all-orgs-agency-check-permission');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000d1', 'd1@test.dev')
  on conflict do nothing;

insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values (
    (select agency_id from public.agencies where agency_slug = 'all-orgs-agency-check-permission'),
    '00000000-0000-0000-0000-0000000000d1',
    current_timestamp
  );

-- NULL object_organization_id = all orgs
insert into public.permission_grants (subject_agency_id, permission_id)
  values (
    (select agency_id from public.agencies where agency_slug = 'all-orgs-agency-check-permission'),
    'members_manage'
  );

select ok(
  protected.check_permission('00000000-0000-0000-0000-0000000000d1', 'members_manage', 'organization', 1),
  'agency all-orgs grant (NULL object) resolves on a specific org');

select * from finish();
rollback;
