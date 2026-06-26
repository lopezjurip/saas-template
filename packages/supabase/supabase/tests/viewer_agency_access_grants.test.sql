-- Tests for viewer_grant_agency_access / viewer_revoke_agency_access RPCs.
-- Seed fixtures:
--   Alice  (00000000-0000-0000-0000-00000000a11c) → org 1, has '*' (satisfies organization_manage)
--   Bob    (00000000-0000-0000-0000-00000000b00b) → org 1, has 'presets_manage' only (no organization_manage)
--   Agency 1 (demo-auditores) already seeded — seed also has a grant (agency 1 → org 1).
-- Cases:
--   1. has_function — viewer_grant_agency_access exists
--   2. has_function — viewer_revoke_agency_access exists
--   3. Alice (organization_manage) can revoke the seeded grant (org 1 → agency 1)
--   4. After revoke, Alice can re-grant agency 1 access to org 1
--   5. Duplicate grant raises 'already_granted'
--   6. Bob (no organization_manage) gets 'no_permission' on grant attempt

begin;

select plan(6);

-- 1. Function exists: viewer_grant_agency_access
select has_function(
  'public',
  'viewer_grant_agency_access',
  array['integer', 'integer'],
  'viewer_grant_agency_access(int, int) exists'
);

-- 2. Function exists: viewer_revoke_agency_access
select has_function(
  'public',
  'viewer_revoke_agency_access',
  array['integer', 'integer'],
  'viewer_revoke_agency_access(int, int) exists'
);

-- Use Alice who holds organization_manage via '*' on org 1
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000a11c"}';

-- 3. Alice can revoke the seeded grant (agency 1 already has access to org 1 from seed)
select lives_ok(
  $$ select * from public.viewer_revoke_agency_access(1, 1) $$,
  'organization_manage holder can revoke seeded agency access'
);

-- 4. After revoke, Alice can grant agency 1 access to org 1
select lives_ok(
  $$ select * from public.viewer_grant_agency_access(1, 1) $$,
  'organization_manage holder can grant agency access after revoke'
);

-- 5. Duplicate grant raises already_granted
select throws_ok(
  $$ select * from public.viewer_grant_agency_access(1, 1) $$,
  'P0001',
  'already_granted',
  'duplicate grant raises already_granted'
);

-- 6. Bob (presets_manage only) gets no_permission on grant attempt for a different org-agency combo
--    (We first revoke to clear the current grant so Bob's attempt is purely a permission check)
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000b00b"}';

select throws_ok(
  $$ select * from public.viewer_grant_agency_access(1, 1) $$,
  'P0001',
  'no_permission',
  'non-holder gets no_permission on grant attempt'
);

select * from finish();

rollback;
