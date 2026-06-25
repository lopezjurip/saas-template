begin;
select plan(2);

-- fixture: profile C1, active member of org 1, payrolls_read grant
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'c1@test.dev')
  on conflict do nothing;
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000c1', current_timestamp);
insert into public.permissions (permission_id) values ('payrolls_read') on conflict do nothing;
insert into public.permission_grants (subject_profile_id, object_organization_id, permission_id)
  values ('00000000-0000-0000-0000-0000000000c1', 1, 'payrolls_read');

-- act as this user via JWT claims (mirrors viewer_permissions.test.sql style)
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c1"}';

select ok(
  public.viewer_can('payrolls_read', 'organization', 1),
  'viewer_can resolves the JWT subject''s own grant');

select set_eq(
  $$ select public.viewer_can_objects('payrolls_read', 'organization') $$,
  $$ values (1::bigint) $$,
  'viewer_can_objects returns org 1 for the JWT subject');

select * from finish();
rollback;
