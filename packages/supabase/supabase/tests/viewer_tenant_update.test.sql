-- viewer_tenant_update RPC. Requires `tenant_manage` on the tenant.
--   viewer_tenant_update(tenant_id, tenant_name) -> updates and returns the tenant row.
--
-- Seed: Alice has '*' on org 1 (acme = tenant 1) — tenant_manage implied.
--       Bob has presets_manage only on org 1.
-- [NEW-PATH] Dave: permission_grants-only tenant_manage (no legacy row).
-- [NEW-PATH] Eve: legacy-only tenant_manage (no permission_grants row) — must be denied.

begin;

select plan(4);

-- ============================================================
-- Alice (tenant_manage via '*') — update succeeds.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select is(
  (select tenant_name from public.viewer_tenant_update(1, 'Acme Updated')),
  'Acme Updated',
  'Alice can update tenant name (tenant_manage via wildcard)'
);

reset role;

-- ============================================================
-- Bob (presets_manage only, no tenant_manage) — update denied.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

prepare bob_update as select * from public.viewer_tenant_update(1, 'Should Fail');
select throws_ok('execute bob_update', 'P0001', null, 'Bob cannot update tenant (no tenant_manage)');
deallocate bob_update;

reset role;

-- ============================================================
-- [NEW-PATH] Dave: permission_grants-only tenant_manage — must be allowed.
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000d2e2',
  'authenticated', 'authenticated',
  'dave-tupdate@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dave TUpdate"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-00000000d2e2', current_timestamp);

-- Grant tenant_manage via permission_grants ONLY (no legacy row)
insert into public.permission_grants (subject_organization_membership_id, permission_id)
  select organization_membership_id, 'tenant_manage'
  from public.organization_memberships
  where profile_id = '00000000-0000-0000-0000-00000000d2e2' and organization_id = 1;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000d2e2"}';

select lives_ok(
  $$ select * from public.viewer_tenant_update(1, 'Acme NewPath') $$,
  '[new-path] Dave (permission_grants-only tenant_manage) can call viewer_tenant_update'
);

reset role;

-- ============================================================
-- [NEW-PATH] Eve: legacy-only tenant_manage — must be denied.
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000e2e2',
  'authenticated', 'authenticated',
  'eve-tupdate@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Eve TUpdate"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-00000000e2e2', current_timestamp);

-- Grant tenant_manage via LEGACY table ONLY (no permission_grants row)
insert into public.organization_membership_permissions (organization_membership_id, permission_id)
  select organization_membership_id, 'tenant_manage'
  from public.organization_memberships
  where profile_id = '00000000-0000-0000-0000-00000000e2e2' and organization_id = 1;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000e2e2"}';

prepare eve_update as select * from public.viewer_tenant_update(1, 'Eve Legacy Fail');
select throws_ok('execute eve_update', 'P0001', null, '[new-path] legacy-only tenant_manage is NOT sufficient for viewer_tenant_update');
deallocate eve_update;

reset role;

select * from finish();
rollback;
