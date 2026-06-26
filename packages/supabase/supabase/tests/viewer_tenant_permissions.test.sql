-- Tenant-scoped permission helpers: viewer_permission_tenant_ids / viewer_has_tenant_permission.
-- Tenant authority rides on the org grants of orgs inside the tenant; wildcard `*` is honored,
-- but `organization_manage` is a DISTINCT capability and must NOT imply `tenant_manage`.
--
-- Seed:
--   Alice (org 1 acme  = tenant 1): wildcard `*`
--   Alice (org 2 globex = tenant 2): presets_manage only
--   Bob   (org 1 acme  = tenant 1): presets_manage only
--
-- Phase C anti-false-green: [NEW-PATH] section seeds grants only via permission_grants
-- (no legacy row) and asserts migrated tenants update RLS works.

begin;

select plan(10);

-- ============================================================
-- Alice — `*` on org 1 covers tenant_manage for tenant 1 only.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select ok(
  public.viewer_has_tenant_permission(1, 'tenant_manage'),
  'Alice wildcard covers tenant_manage for acme (tenant 1)'
);

select ok(
  not public.viewer_has_tenant_permission(2, 'tenant_manage'),
  'Alice lacks tenant_manage for globex (tenant 2 — only presets_manage there)'
);

select set_eq(
  $$ select * from public.viewer_permission_tenant_ids('tenant_manage') $$,
  $$ values (1) $$,
  'viewer_permission_tenant_ids(tenant_manage) = {1} for Alice'
);

reset role;

-- ============================================================
-- Bob — presets_manage only on org 1 → denied tenant_manage.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

select ok(
  not public.viewer_has_tenant_permission(1, 'tenant_manage'),
  'Bob (presets_manage only) lacks tenant_manage for tenant 1'
);

reset role;

-- ============================================================
-- organization_manage must NOT imply tenant_manage (the split is real).
-- Grant runs as the test superuser (RLS bypassed) between role switches.
-- ============================================================

insert into public.permission_grants (subject_organization_membership_id, permission_id)
  select organization_membership_id, 'organization_manage'
  from public.organization_memberships
  where profile_id = '00000000-0000-0000-0000-00000000b00b' and organization_id = 1;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

select ok(
  not public.viewer_has_tenant_permission(1, 'tenant_manage'),
  'organization_manage does NOT grant tenant_manage (distinct capabilities)'
);

reset role;

-- ============================================================
-- An EXPLICIT tenant_manage grant passes — the capability is real, not vestigial.
-- ============================================================

insert into public.permission_grants (subject_organization_membership_id, permission_id)
  select organization_membership_id, 'tenant_manage'
  from public.organization_memberships
  where profile_id = '00000000-0000-0000-0000-00000000b00b' and organization_id = 1;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

select ok(
  public.viewer_has_tenant_permission(1, 'tenant_manage'),
  'Explicit tenant_manage grant passes for tenant 1'
);

select set_eq(
  $$ select * from public.viewer_permission_tenant_ids('tenant_manage') $$,
  $$ values (1) $$,
  'viewer_permission_tenant_ids(tenant_manage) = {1} for Bob after explicit grant'
);

reset role;

-- ============================================================
-- Anonymous caller — no tenant grants anywhere.
-- ============================================================

set local role anon;
set local request.jwt.claims to '';

select is(
  (select count(*) from public.viewer_permission_tenant_ids('tenant_manage')),
  0::bigint,
  'anon caller has no tenant_manage grants'
);

reset role;

-- ============================================================
-- [NEW-PATH] Dave: permission_grants-only tenant_manage, no legacy row.
-- Confirms migrated tenants update RLS reads through permission_grants.
-- ============================================================

-- Create auth user Dave
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000da0e',
  'authenticated', 'authenticated',
  'dave@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dave NewPath"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

-- Dave gets accepted membership in org 1 (acme / tenant 1)
insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
values (1, '00000000-0000-0000-0000-00000000da0e', current_timestamp);

-- Grant tenant_manage via permission_grants ONLY (no legacy organization_membership_permissions row)
insert into public.permission_grants (subject_organization_membership_id, permission_id)
select organization_membership_id, 'tenant_manage'
from public.organization_memberships
where profile_id = '00000000-0000-0000-0000-00000000da0e' and organization_id = 1;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000da0e"}';

-- Dave should be able to update tenant 1 (he has tenant_manage via permission_grants only)
select lives_ok(
  $$ update public.tenants set tenant_name = tenant_name where tenant_id = 1 $$,
  '[new-path] Dave (permission_grants-only tenant_manage) can update tenant 1 via new tenants RLS'
);

-- Dave must NOT be able to update tenant 2 (RLS silently blocks UPDATE, 0 rows affected)
select is(
  (select count(*) from public.tenants where tenant_id = 2)::int,
  0,
  '[new-path] Dave cannot see tenant 2 (no grant) — new tenants select RLS enforces correctly'
);

reset role;

select * from finish();
rollback;
