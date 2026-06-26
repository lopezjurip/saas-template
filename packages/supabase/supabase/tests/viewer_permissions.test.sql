-- Tests for permission-based viewer_* helpers, including wildcard `*` behavior.
-- Seed:
--   Alice (org 1 acme): wildcard `*` — admin of everything in org 1.
--   Alice (org 2 globex): presets_manage only — NO wildcard, NO members_manage.
--   Bob   (org 1 acme): presets_manage only.
--
-- Phase C anti-false-green: [NEW-PATH] sections seed grants only via permission_grants
-- (no legacy organization_membership_permissions row) and assert migrated RLS and helpers.

begin;

select plan(16);

-- ============================================================
-- Alice in org 1 (wildcard) — every check returns true
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select ok(
  public.viewer_has_permission(1, 'payroll_run'),
  'wildcard covers payroll_run in org 1'
);

select ok(
  public.viewer_has_permission(1, 'members_manage'),
  'wildcard covers members_manage in org 1'
);

select ok(
  public.viewer_has_permission(1, 'vacations_approve'),
  'wildcard covers vacations_approve in org 1'
);

-- A permission slug that does NOT exist in the catalog still returns true under wildcard.
-- This is intentional: `*` means "every permission, present or future" so callers
-- adding a new slug don't need to backfill grants for existing wildcard holders.
select ok(
  public.viewer_has_permission(1, 'totally_made_up_slug'),
  'wildcard covers unknown slug in org 1 (future-proofing)'
);

-- ============================================================
-- Alice in org 2 (specific grants, no wildcard)
-- ============================================================

select ok(
  public.viewer_has_permission(2, 'presets_manage'),
  'Alice has explicit presets_manage in org 2'
);

select ok(
  not public.viewer_has_permission(2, 'members_manage'),
  'Alice does NOT have members_manage in org 2'
);

-- ============================================================
-- viewer_permission_org_ids — which orgs grant the permission?
-- ============================================================

select set_eq(
  $$ select * from public.viewer_permission_org_ids('presets_manage') order by 1 $$,
  $$ values (1), (2) $$,
  'presets_manage is granted to Alice in orgs 1 (via *) and 2 (explicit)'
);

select set_eq(
  $$ select * from public.viewer_permission_org_ids('members_manage') order by 1 $$,
  $$ values (1) $$,
  'members_manage is granted to Alice only in org 1 (via *)'
);

reset role;

-- ============================================================
-- Bob in org 1 (vacations_request only)
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

select ok(
  public.viewer_has_permission(1, 'presets_manage'),
  'Bob has presets_manage in org 1'
);

select ok(
  not public.viewer_has_permission(1, 'members_manage'),
  'Bob does NOT have members_manage in org 1'
);

select ok(
  not public.viewer_has_permission(1, '*'),
  'Bob does NOT have wildcard in org 1'
);

select is(
  (select count(*) from public.viewer_permission_org_ids('members_manage')),
  0::bigint,
  'Bob is in no orgs that grant him members_manage'
);

reset role;

-- ============================================================
-- Anonymous caller — no permissions anywhere
-- ============================================================

set local role anon;
-- Clear any inherited claims so viewer_profile_id() resolves to NULL (a true anon caller).
set local request.jwt.claims to '';

select is(
  (select count(*) from public.viewer_permission_org_ids('presets_manage')),
  0::bigint,
  'anon caller has no permission grants'
);

reset role;

-- ============================================================
-- [NEW-PATH] Carol: permission_grants-only grant, no legacy row.
-- Confirms that the migrated organizations + tenants RLS reads via permission_grants.
-- ============================================================

-- Create auth user Carol
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000ca70',
  'authenticated', 'authenticated',
  'carol@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Carol NewPath"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

-- Carol gets accepted membership in org 1 (acme / tenant 1)
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
values (1, '00000000-0000-0000-0000-00000000ca70', current_timestamp);

-- Grant organization_manage via permission_grants ONLY (no legacy row)
insert into public.permission_grants (subject_organization_membership_id, permission_id)
select organization_membership_id, 'organization_manage'
from public.organization_memberships
where profile_id = '00000000-0000-0000-0000-00000000ca70' and organization_id = 1;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000ca70"}';

-- Carol should see org 1 (she is a member — viewer_member_objects path)
select ok(
  (select count(*) from public.organizations where organization_id = 1) = 1,
  '[new-path] Carol (permission_grants-only) can see org 1 via new organizations RLS'
);

-- Carol should see tenant 1 (she is a member — viewer_member_objects path)
select ok(
  (select count(*) from public.tenants where tenant_id = 1) = 1,
  '[new-path] Carol (permission_grants-only) can see tenant 1 via new tenants RLS'
);

-- Carol should be able to update org 1 (she has organization_manage via permission_grants)
select lives_ok(
  $$ update public.organizations set organization_name = organization_name where organization_id = 1 $$,
  '[new-path] Carol (permission_grants organization_manage) can update org 1 via new RLS'
);

reset role;

select * from finish();
rollback;
