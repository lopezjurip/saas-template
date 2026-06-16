-- Tenant onboarding write RPCs. Both require `tenant_manage` on the tenant.
--   viewer_tenant_onboarding_set(tenant_id, step, status) -> records a non-derivable step status
--   viewer_tenant_onboarding_finish(tenant_id)            -> stamps tenant_onboarded_at
--
-- Seed: Alice has '*' on org 1 (acme = tenant 1) → tenant_manage; Bob has presets_manage only.

begin;

select plan(6);

-- ============================================================
-- Alice (tenant_manage via '*') — set + finish succeed.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select is(
  (select tenant_onboarding_state ->> 'billing' from public.viewer_tenant_onboarding_set(1, 'billing', 'done')),
  'done',
  'Alice can set billing=done; jsonb records it'
);

select is(
  (select tenant_onboarding_state ->> 'billing' from public.tenants where tenant_id = 1),
  'done',
  'state persisted on the tenants row'
);

prepare alice_invalid_status as select * from public.viewer_tenant_onboarding_set(1, 'billing', 'bogus');
select throws_ok('execute alice_invalid_status', 'P0001', null, 'invalid status is rejected');
deallocate alice_invalid_status;

select isnt(
  (select tenant_onboarded_at from public.viewer_tenant_onboarding_finish(1)),
  null,
  'Alice can finish; tenant_onboarded_at is stamped'
);

reset role;

-- ============================================================
-- Bob (presets_manage only, no tenant_manage) — both RPCs denied.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

prepare bob_set as select * from public.viewer_tenant_onboarding_set(1, 'billing', 'done');
select throws_ok('execute bob_set', 'P0001', null, 'Bob cannot set onboarding state (no tenant_manage)');
deallocate bob_set;

prepare bob_finish as select * from public.viewer_tenant_onboarding_finish(1);
select throws_ok('execute bob_finish', 'P0001', null, 'Bob cannot finish onboarding (no tenant_manage)');
deallocate bob_finish;

reset role;

select * from finish();
rollback;
