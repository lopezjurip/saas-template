-- pgTAP tests for public.permission_grants table structure and CHECK constraints.
-- Uses seeded fixtures so FK violations don't shadow CHECK violations:
--   org membership id = 1 (Alice on acme org), agency id = 1 (demo-auditores).

begin;
select plan(6);

select has_table('public', 'permission_grants', 'public.permission_grants exists');

-- two subjects → rejected by permission_grants_one_subject
select throws_ok(
  $$ insert into public.permission_grants (subject_organization_membership_id, subject_agency_id, permission_id)
     values (1, 1, 'members_manage') $$,
  null, null, 'two subjects rejected');

-- zero subjects → rejected
select throws_ok(
  $$ insert into public.permission_grants (permission_id) values ('members_manage') $$,
  null, null, 'no subject rejected');

-- org-membership grant with an object set → rejected (object only for agency reach)
select throws_ok(
  $$ insert into public.permission_grants (subject_organization_membership_id, object_organization_id, permission_id)
     values (1, 1, 'members_manage') $$,
  null, null, 'org-membership grant cannot carry an object');

-- org-membership grant, no object → allowed (object implicit = membership''s org)
select lives_ok(
  $$ insert into public.permission_grants (subject_organization_membership_id, permission_id)
     values (1, 'members_manage') $$,
  'org-membership grant allowed');

-- agency reach grant with NULL object → allowed (all-orgs wildcard)
select lives_ok(
  $$ insert into public.permission_grants (subject_agency_id, permission_id)
     select agency_id, '*' from public.agencies limit 1 $$,
  'agency all-orgs grant allowed');

select * from finish();
rollback;
