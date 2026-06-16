-- Tests for the viewer_* helpers. These resolve the caller from the JWT `sub` claim
-- (auth.uid) and then read membership/agency state straight from the DB — they do NOT
-- trust app_metadata arrays in the token. Seed: alice (org 1 acme + org 2 globex),
-- bob (org 1 acme only).

begin;

select plan(17);

-- ============================================================
-- viewer_profile_id / viewer_tenant_ids with NO JWT (anonymous caller)
-- ============================================================

set local role anon;

select is(
  public.viewer_profile_id(),
  null,
  'viewer_profile_id() returns null without a JWT'
);

select is(
  (select count(*) from public.viewer_tenant_ids()),
  0::bigint,
  'viewer_tenant_ids() yields nothing without a JWT'
);

select ok(
  not public.viewer_tenant_validate(1),
  'viewer_tenant_validate(1) is false without a JWT'
);

select ok(
  not public.viewer_organization_validate(1),
  'viewer_organization_validate(1) is false without a JWT'
);

select ok(
  not public.viewer_is_agency_member(),
  'viewer_is_agency_member() is false without a JWT'
);

select is(
  (select count(*) from public.viewer_agency_ids()),
  0::bigint,
  'viewer_agency_ids() yields nothing without a JWT'
);

reset role;

-- ============================================================
-- viewer_* with Alice's JWT (member of acme + globex, no agencies)
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [
      {"id": 1, "slug": "acme"},
      {"id": 2, "slug": "globex"}
    ],
    "organizations": [{"id": 1}, {"id": 2}],
    "agencies": []
  }
}';

select set_eq(
  $$ select * from public.viewer_tenant_ids() order by 1 $$,
  $$ values (1), (2) $$,
  'Alice sees tenants 1 and 2 from JWT'
);

select ok(
  public.viewer_tenant_validate(1),
  'viewer_tenant_validate(1) is true for Alice'
);

select ok(
  not public.viewer_tenant_validate(999),
  'viewer_tenant_validate(999) is false for Alice (tenant she does not belong to)'
);

select set_eq(
  $$ select * from public.viewer_organization_ids() order by 1 $$,
  $$ values (1), (2) $$,
  'Alice sees organizations 1 and 2 from JWT'
);

select ok(
  public.viewer_organization_validate(1),
  'viewer_organization_validate(1) is true for Alice'
);

select ok(
  not public.viewer_organization_validate(999),
  'viewer_organization_validate(999) is false for Alice'
);

select ok(
  not public.viewer_is_agency_member(),
  'viewer_is_agency_member() is false when agencies array is empty'
);

reset role;

-- ============================================================
-- viewer_agency_ids / viewer_is_agency_member resolve from the DB (agency_memberships),
-- not from any JWT claim.
-- ============================================================

set local role service_role;
insert into public.agencies (agency_id, agency_name, agency_slug)
  values (9001, 'Test Agency', 'test-agency');
insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values (9001, '00000000-0000-0000-0000-00000000a11c', now());
reset role;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select ok(
  public.viewer_is_agency_member(),
  'viewer_is_agency_member() is true when the caller has an accepted agency_membership'
);

select set_eq(
  $$ select * from public.viewer_agency_ids() $$,
  $$ values (9001) $$,
  'viewer_agency_ids() returns the agency id from the DB'
);

reset role;

-- ============================================================
-- DB-driven: viewer_tenant_ids / viewer_organization_ids reflect actual membership and
-- ignore (now-absent) app_metadata arrays in the JWT.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c", "app_metadata": {}}';

select set_eq(
  $$ select * from public.viewer_tenant_ids() order by 1 $$,
  $$ values (1), (2) $$,
  'viewer_tenant_ids() reflects DB membership even with empty app_metadata'
);

select set_eq(
  $$ select * from public.viewer_organization_ids() order by 1 $$,
  $$ values (1), (2) $$,
  'viewer_organization_ids() reflects DB membership even with empty app_metadata'
);

reset role;

select * from finish();
rollback;
