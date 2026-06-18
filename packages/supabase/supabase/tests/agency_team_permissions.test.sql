-- Agency internal-capability model: helpers, lifecycle RPCs, RLS, and last-admin protection.
-- Seed (seed.sql):
--   demo-auditores agency, Iris (ca401) = accepted affiliate holding '*' (team admin),
--   Alice (a11c) = pending affiliate with no agency capabilities.

begin;

select plan(12);

-- Capture seeded serial ids while privileged (RLS bypassed); share with the authenticated role.
create temporary table _af on commit drop as
  select
    a.agency_id as agency_id,
    (select agency_membership_id from public.agency_memberships
       where agency_id = a.agency_id and profile_id = '00000000-0000-0000-0000-0000000ca401') as iris_mid,
    (select agency_membership_id from public.agency_memberships
       where agency_id = a.agency_id and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_mid
  from public.agencies a
  where a.agency_slug = 'demo-auditores';
grant select on _af to authenticated;

select has_table('public', 'agency_membership_permissions', 'agency_membership_permissions table exists');

-- ============================================================
-- Iris: accepted team admin via wildcard '*'
-- ============================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-0000000ca401"}';

select ok(
  public.viewer_has_agency_team_permission((select agency_id from _af), 'agency_members_manage'),
  'Iris (wildcard) has agency_members_manage on demo-auditores'
);

select ok(
  public.viewer_has_agency_team_permission((select agency_id from _af), 'unknown_future_capability'),
  'wildcard covers an unknown future agency capability (future-proofing)'
);

select ok(
  (select agency_id from _af) in (select public.viewer_agency_team_permission_ids('agency_members_manage')),
  'viewer_agency_team_permission_ids returns the agency for a wildcard holder'
);

select throws_ok(
  $$ select public.viewer_agency_membership_invite_by_email((select agency_id from _af), 'nobody@unregistered.test') $$,
  'P0001',
  'user_not_found',
  'inviting an email with no registered account raises user_not_found'
);

select lives_ok(
  $$ select public.viewer_agency_membership_invite_by_email((select agency_id from _af), 'alice@humane.test') $$,
  'a team admin can invite an existing registered user'
);

select lives_ok(
  $$ insert into public.agency_membership_permissions (agency_membership_id, permission_id)
     values ((select alice_mid from _af), 'agency_members_manage') $$,
  'a team admin can grant an agency capability to another affiliate (RLS write)'
);

select throws_ok(
  $$ select public.viewer_agency_membership_update((select iris_mid from _af), 'revoke') $$,
  'P0001',
  'last_admin_protected',
  'revoking the agency''s last active team admin is blocked'
);

select throws_ok(
  $$ delete from public.agency_membership_permissions
       where agency_membership_id = (select iris_mid from _af) and permission_id = '*' $$,
  'P0001',
  'last_admin_protected',
  'removing the last admin''s wildcard grant is blocked by the trigger'
);

reset role;

-- ============================================================
-- Alice: pending affiliate — no team authority, even though she was granted the slug above
-- ============================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select ok(
  not public.viewer_has_agency_team_permission((select agency_id from _af), 'agency_members_manage'),
  'a pending affiliate has no team authority (accepted_at filter)'
);

select throws_ok(
  $$ select public.viewer_agency_membership_invite_by_email((select agency_id from _af), 'iris@humane.test') $$,
  'P0001',
  'no_permission',
  'a non-admin affiliate cannot invite'
);

select throws_ok(
  $$ insert into public.agency_membership_permissions (agency_membership_id, permission_id)
     values ((select iris_mid from _af), 'agency_members_manage') $$,
  '42501',
  null,
  'a non-admin affiliate cannot grant agency capabilities (RLS denies the write)'
);

reset role;

select * from finish();
rollback;
