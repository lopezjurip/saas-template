begin;
select plan(11);

-- ============================================================
-- Task 3 fixtures: profile A1 with active org 1 membership
-- ============================================================

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a1', 'a1@test.dev')
  on conflict do nothing;
-- (public.profiles row is created by the auth.users trigger)

-- make org 1 visible to this profile via an active membership
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000a1', current_timestamp);

select set_eq(
  $$ select protected.member_objects('00000000-0000-0000-0000-0000000000a1', 'organization') $$,
  $$ values (1::bigint) $$,
  'member_objects(organization) returns the org the profile actively belongs to');

select ok(
  internal.is_active_org_member('00000000-0000-0000-0000-0000000000a1', 1),
  'is_active_org_member true for active membership');

select ok(
  not internal.is_active_org_member('00000000-0000-0000-0000-0000000000a1', 999),
  'is_active_org_member false for non-member org');

-- ============================================================
-- Task 5 fixtures: mirror check_permission.test.sql (B1/B2 + agency)
-- ============================================================

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000b1', 'b1@test.dev'),
  ('00000000-0000-0000-0000-0000000000b2', 'b2@test.dev')
  on conflict do nothing;

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000b1', current_timestamp);

insert into public.permissions (permission_id) values ('payrolls_read'), ('payrolls_write')
  on conflict do nothing;

-- P1 direct payrolls_read grant via org membership
insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values (
    (select organization_membership_id from public.organization_memberships
     where organization_id = 1 and profile_id = '00000000-0000-0000-0000-0000000000b1'),
    'payrolls_read'
  );

-- agency reaching org 1 with payrolls_write; B2 active affiliate
insert into public.agencies (agency_name, agency_slug)
  values ('Test Agency Lookup', 'test-agency-lookup-objects');

insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values (
    (select agency_id from public.agencies where agency_slug = 'test-agency-lookup-objects'),
    '00000000-0000-0000-0000-0000000000b2',
    current_timestamp
  );

insert into public.permission_grants (subject_agency_id, object_organization_id, permission_id)
  values (
    (select agency_id from public.agencies where agency_slug = 'test-agency-lookup-objects'),
    1,
    'payrolls_write'
  );

-- (1) lookup for direct member returns org 1
select set_eq(
  $$ select protected.lookup_objects('00000000-0000-0000-0000-0000000000b1', 'payrolls_read', 'organization') $$,
  $$ values (1::bigint) $$,
  'lookup_objects(payrolls_read, organization) returns org 1 for B1 (direct grant)');

-- (2) lookup for agency member returns org 1
select set_eq(
  $$ select protected.lookup_objects('00000000-0000-0000-0000-0000000000b2', 'payrolls_write', 'organization') $$,
  $$ values (1::bigint) $$,
  'lookup_objects(payrolls_write, organization) returns org 1 for B2 (via agency)');

-- (3) list_object_permissions lists B1''s slugs on org 1 (only payrolls_read — not payrolls_write)
select set_eq(
  $$ select protected.list_object_permissions('00000000-0000-0000-0000-0000000000b1', 'organization', 1) $$,
  $$ values ('payrolls_read'::extensions.citext) $$,
  'list_object_permissions lists B1''s slugs on org 1 (payrolls_read only)');

-- (4) agency_reachable_objects returns org 1 for active affiliate B2
select set_eq(
  $$ select protected.agency_reachable_objects('00000000-0000-0000-0000-0000000000b2', 'organization') $$,
  $$ values (1::bigint) $$,
  'agency_reachable_objects returns org 1 for B2 (active affiliate)');

-- (5) soft-deleting the agency removes it from agency_reachable_objects (regression)
update public.agencies
  set agency_deleted_at = current_timestamp
  where agency_slug = 'test-agency-lookup-objects';

select is(
  (select count(*) from protected.agency_reachable_objects('00000000-0000-0000-0000-0000000000b2', 'organization')),
  0::bigint,
  'agency_reachable_objects returns nothing after agency is soft-deleted');

-- ============================================================
-- Regression: all-orgs agency grant (object_organization_id IS NULL)
-- expands to ALL organizations in agency_reachable_objects
-- ============================================================

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'c1@test.dev')
  on conflict do nothing;

insert into public.agencies (agency_name, agency_slug)
  values ('All-Orgs Agency', 'test-agency-all-orgs');

insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values (
    (select agency_id from public.agencies where agency_slug = 'test-agency-all-orgs'),
    '00000000-0000-0000-0000-0000000000c1',
    current_timestamp
  );

-- all-orgs grant: object_organization_id intentionally left NULL
insert into public.permission_grants (subject_agency_id, permission_id)
  values (
    (select agency_id from public.agencies where agency_slug = 'test-agency-all-orgs'),
    'members_manage'
  );

-- (6) all-orgs grant → org 1 visible
select ok(
  exists(
    select 1 from protected.agency_reachable_objects('00000000-0000-0000-0000-0000000000c1', 'organization')
    where agency_reachable_objects = 1
  ),
  'agency_reachable_objects(organization) includes org 1 when agency holds all-orgs grant (NULL object_organization_id)');

-- (7) all-orgs grant → tenant 1 (via org 1) visible
select ok(
  exists(
    select 1 from protected.agency_reachable_objects('00000000-0000-0000-0000-0000000000c1', 'tenant')
    where agency_reachable_objects = 1
  ),
  'agency_reachable_objects(tenant) includes tenant 1 when agency holds all-orgs grant (NULL object_organization_id)');

-- (8) soft-deleting the all-orgs agency removes visibility
update public.agencies
  set agency_deleted_at = current_timestamp
  where agency_slug = 'test-agency-all-orgs';

select is(
  (select count(*) from protected.agency_reachable_objects('00000000-0000-0000-0000-0000000000c1', 'organization')),
  0::bigint,
  'agency_reachable_objects returns nothing after all-orgs agency is soft-deleted');

select * from finish();
rollback;
