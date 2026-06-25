begin;
select plan(3);

-- seed a profile + org membership fixture
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a1', 'a1@test.dev')
  on conflict do nothing;
-- (public.profiles row is created by the auth.users trigger)

-- make org 1 visible to this profile via an active membership
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-0000000000a1', current_timestamp);

select set_eq(
  $$ select authz.member_objects('00000000-0000-0000-0000-0000000000a1', 'organization') $$,
  $$ values (1::bigint) $$,
  'member_objects(organization) returns the org the profile actively belongs to');

select ok(
  authz._is_active_org_member('00000000-0000-0000-0000-0000000000a1', 1),
  '_is_active_org_member true for active membership');

select ok(
  not authz._is_active_org_member('00000000-0000-0000-0000-0000000000a1', 999),
  '_is_active_org_member false for non-member org');

select * from finish();
rollback;
