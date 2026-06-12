-- Tests for permission-based viewer_* helpers, including wildcard `*` behavior.
-- Seed:
--   Alice (org 1 acme): wildcard `*` — admin of everything in org 1.
--   Alice (org 2 globex): presets_manage only — NO wildcard, NO members_manage.
--   Bob   (org 1 acme): presets_manage only.

begin;

select plan(13);

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

select * from finish();
rollback;
