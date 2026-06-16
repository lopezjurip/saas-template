-- Tenant onboarding finish RPC. Requires `tenant_manage` on the tenant.
--   viewer_tenant_onboarding_finish(tenant_id) -> stamps tenant_onboarded_at
--
-- Seed: Alice has '*' on org 1 (acme = tenant 1) → tenant_manage; Bob has presets_manage only.

begin;

select plan(2);

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

select * from finish();
rollback;
