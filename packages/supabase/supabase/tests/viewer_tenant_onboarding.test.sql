-- Tenant onboarding finish RPC. Requires `tenant_manage` on the tenant.
--   viewer_tenant_onboarding_finish(tenant_id) -> stamps tenant_onboarded_at
--
-- Seed: Alice has '*' on org 1 (acme = tenant 1) → tenant_manage; Bob has presets_manage only.
-- [NEW-PATH] Dave: permission_grants-only tenant_manage (no legacy row).

begin;

select plan(4);

-- ============================================================
-- Alice (tenant_manage via '*') — finish succeeds.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select isnt(
  (select tenant_onboarded_at from public.viewer_tenant_onboarding_finish(1)),
  null,
  'Alice can finish; tenant_onboarded_at is stamped'
);

reset role;

-- ============================================================
-- Bob (presets_manage only, no tenant_manage) — finish denied.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

prepare bob_finish as select * from public.viewer_tenant_onboarding_finish(1);
select throws_ok('execute bob_finish', 'P0001', null, 'Bob cannot finish onboarding (no tenant_manage)');
deallocate bob_finish;

reset role;

-- ============================================================
-- [NEW-PATH] Dave: permission_grants-only tenant_manage, no legacy row.
-- Confirms viewer_tenant_onboarding_finish reads permission_grants, not legacy table.
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000d2e1',
  'authenticated', 'authenticated',
  'dave-onboard@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dave Onboard"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-00000000d2e1', current_timestamp);

-- Grant tenant_manage via permission_grants ONLY (no legacy organization_membership_permissions row)
insert into public.permission_grants (subject_organization_membership_id, permission_id)
  select organization_membership_id, 'tenant_manage'
  from public.organization_memberships
  where profile_id = '00000000-0000-0000-0000-00000000d2e1' and organization_id = 1;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000d2e1"}';

select isnt(
  (select tenant_onboarded_at from public.viewer_tenant_onboarding_finish(1)),
  null,
  '[new-path] Dave (permission_grants-only tenant_manage) can finish onboarding'
);

reset role;

-- [E4-PATH] legacy-only grant is NOT sufficient for viewer_tenant_onboarding_finish.
-- Post-E4: legacy table dropped. Eve gets NO permission_grants row → denied.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000e2e1',
  'authenticated', 'authenticated',
  'eve-legacy@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Eve Legacy"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values (1, '00000000-0000-0000-0000-00000000e2e1', current_timestamp);

-- No grant inserted — Eve has no permission_grants row, so viewer_tenant_onboarding_finish must deny.

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000e2e1"}';

prepare eve_finish as select * from public.viewer_tenant_onboarding_finish(1);
select throws_ok('execute eve_finish', 'P0001', null, '[e4-path] no permission_grants row → viewer_tenant_onboarding_finish denied');
deallocate eve_finish;

reset role;

select * from finish();
rollback;
