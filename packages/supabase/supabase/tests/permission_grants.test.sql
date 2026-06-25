-- pgTAP tests for public.permission_grants table structure and CHECK constraints.
-- Uses seeded fixtures so FK violations don't shadow CHECK violations:
--   profile: Alice (00000000-0000-0000-0000-00000000a11c), org 1, agency 1 (demo-auditores).

begin;
select plan(5);

-- table exists
select has_table('public', 'permission_grants', 'public.permission_grants exists');

-- two subjects set → rejected by permission_grants_one_subject CHECK
select throws_ok(
  $$ insert into public.permission_grants (subject_profile_id, subject_agency_id, object_organization_id, permission_id)
     values ('00000000-0000-0000-0000-00000000a11c', 1, 1, 'members_manage') $$,
  null, null, 'two subjects rejected');

-- two objects set → rejected by permission_grants_one_object CHECK
select throws_ok(
  $$ insert into public.permission_grants (subject_profile_id, object_organization_id, object_tenant_id, permission_id)
     values ('00000000-0000-0000-0000-00000000a11c', 1, 1, 'members_manage') $$,
  null, null, 'two objects rejected');

-- profile subject with NO object → rejected by permission_grants_all_orgs_only_agency CHECK
select throws_ok(
  $$ insert into public.permission_grants (subject_profile_id, permission_id)
     values ('00000000-0000-0000-0000-00000000a11c', 'members_manage') $$,
  null, null, 'profile grant without object rejected');

-- agency subject with NO object → allowed (means "all orgs" wildcard)
-- Uses seeded agency_id = 1 (demo-auditores) which is always present after seed.
select lives_ok(
  $$ insert into public.permission_grants (subject_agency_id, permission_id)
     values (1, '*') $$,
  'agency grant with all-null object allowed (all-orgs wildcard)');

select * from finish();
rollback;
