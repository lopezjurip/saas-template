-- RLS isolation for public.organization_memberships and public.permission_grants.
-- Verifies the security boundary that keeps tenant data from leaking across orgs.
--
-- New schema (post-invitations-merge): permission_grants references organization_membership_id
-- only; resolve org via JOIN. Helper variables `alice_org1` / `alice_org2` /
-- `bob_org1` capture the seeded serial PKs so we can write predictable inserts.
--
-- Phase C anti-false-green: sections marked [NEW-PATH] seed a grant only via permission_grants
-- (no matching legacy row) and assert new-model RLS still works.

begin;

select plan(13);

-- ============================================================
-- Capture seeded organization_membership IDs (needed because PKs are serial)
-- ============================================================

create temporary table _mids on commit drop as
  select
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org1,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 2 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org2,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000b00b') as bob_org1;
-- Authenticated and anon both need to read this temp table during the RLS asserts below.
grant select on _mids to authenticated, anon;

-- ============================================================
-- Alice (member of org 1 acme + org 2 globex) sees rows in both orgs
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select set_eq(
  $$ select organization_id from public.organization_memberships order by organization_id, profile_id $$,
  $$ values (1), (1), (2) $$,
  'Alice sees all 3 organization_memberships across her orgs (alice@1, bob@1, alice@2)'
);

select set_eq(
  $$ select m.organization_id, g.permission_id::text
       from public.permission_grants g
       join public.organization_memberships m on m.organization_membership_id = g.subject_organization_membership_id
       where m.profile_id = '00000000-0000-0000-0000-00000000a11c'
       order by m.organization_id, g.permission_id $$,
  $$ values (1, '*'),
         (2, 'presets_manage') $$,
  'Alice sees her own grants in orgs 1 and 2'
);

reset role;

-- ============================================================
-- Bob (member of org 1 only) cannot see org 2 organization_memberships
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

select set_eq(
  $$ select organization_id from public.organization_memberships order by organization_id, profile_id $$,
  $$ values (1), (1) $$,
  'Bob sees only org 1 organization_memberships (alice@1, bob@1); org 2 hidden by RLS'
);

select is(
  (select count(*) from public.organization_memberships where organization_id = 2),
  0::bigint,
  'Bob explicitly cannot see any org 2 organization_memberships'
);

select is(
  (select count(*)
     from public.permission_grants g
     join public.organization_memberships m on m.organization_membership_id = g.subject_organization_membership_id
     where m.organization_id = 2),
  0::bigint,
  'Bob cannot see grants in org 2'
);

-- Bob lacks members_manage in org 1 — INSERT must be denied.
prepare bob_insert_grant as
  insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values ((select bob_org1 from _mids), 'organization_manage');

select throws_ok(
  'execute bob_insert_grant',
  '42501',  -- insufficient_privilege; Postgres surfaces RLS violation as this SQLSTATE
  null,
  'Bob cannot grant himself a new permission (no members_manage)'
);

deallocate bob_insert_grant;

reset role;

-- ============================================================
-- Alice can grant a new permission in org 1 (she has wildcard, which covers members_manage)
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select lives_ok(
  $$ insert into public.permission_grants (subject_organization_membership_id, permission_id)
     values ((select bob_org1 from _mids), 'organization_manage') $$,
  'Alice can grant organization_manage to Bob in org 1 (wildcard satisfies members_manage)'
);

-- But she cannot grant in org 2 (her org-2 grants do NOT include members_manage)
prepare alice_grant_org2 as
  insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values ((select alice_org2 from _mids), 'members_manage');

select throws_ok(
  'execute alice_grant_org2',
  '42501',
  null,
  'Alice cannot grant in org 2 (no members_manage there)'
);

deallocate alice_grant_org2;

reset role;

-- ============================================================
-- Anonymous caller — RLS denies everything
-- ============================================================

set local role anon;

select is(
  (select count(*) from public.organization_memberships),
  0::bigint,
  'anon sees no organization_memberships'
);

select is(
  (select count(*) from public.permission_grants where subject_organization_membership_id is not null),
  0::bigint,
  'anon sees no permission_grants'
);

reset role;

-- ============================================================
-- [NEW-PATH] Eve: permission_grants-only grant, no legacy row
-- Asserts that the migrated RLS policies read via permission_grants.
-- ============================================================

-- Create an auth user for Eve (no profile trigger runs in SQL; insert profile directly)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000ee0e0',
  'authenticated', 'authenticated',
  'eve@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Eve Tester"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

-- Create org membership for Eve in org 1 (accepted)
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
values (1, '00000000-0000-0000-0000-0000000ee0e0', current_timestamp);

-- Grant members_manage to Eve via permission_grants
insert into public.permission_grants (subject_organization_membership_id, permission_id)
select organization_membership_id, 'members_manage'
from public.organization_memberships
where profile_id = '00000000-0000-0000-0000-0000000ee0e0' and organization_id = 1;

grant select on _mids to authenticated;

-- Eve should be able to see org 1 memberships (new-path select policy)
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-0000000ee0e0"}';

select ok(
  (select count(*) from public.organization_memberships where organization_id = 1) > 0,
  '[new-path] Eve (permission_grants grant) can see org 1 memberships via RLS'
);

-- Eve should be able to write into org 1 memberships (write policy: members_manage)
-- profile_id NULL = pending invite (no FK to profiles required for pending rows)
select lives_ok(
  $$ insert into public.organization_memberships (organization_id, organization_membership_invite_email)
     values (1, 'pending@humane.test') $$,
  '[new-path] Eve (permission_grants members_manage) can write org 1 memberships'
);

-- A profile with zero grants should see nothing
reset role;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000ff0f0',
  'authenticated', 'authenticated',
  'frank@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Frank NoGrant"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-0000000ff0f0"}';

select is(
  (select count(*) from public.organization_memberships)::int,
  0,
  '[new-path] Frank (no grants at all) sees zero memberships — confirms RLS gates correctly'
);

reset role;

select * from finish();
rollback;
