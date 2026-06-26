begin;
select plan(6);

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

select * from finish();
rollback;
