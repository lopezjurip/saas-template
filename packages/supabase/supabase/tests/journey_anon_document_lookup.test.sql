-- Journey: anonymous document-based invite discovery + JWT-forging defense in depth.
--
-- Part A — public.organization_memberships_pending_by_document is the ONLY surface granted to anon
-- that reads through organization_memberships. A visitor arriving on /auth/document hits this RPC
-- before logging in. Threat model:
--   * Anon enumerating RUTs to discover registered employees (only invite tokens, not
--     existing profile_identities, surface — but lifecycle filters must be airtight).
--   * Normalisation oracle: caller passes the value in multiple shapes; only the
--     normalised value matches.
--   * Cross-country leakage: same value, different country must not match.
--
-- Part B — JWT-forging defense in depth. The viewer_*_ids() helpers are DB-backed: they
-- resolve the caller from `sub` (auth.uid) and read membership straight from the DB, so a
-- forged app_metadata array buys NOTHING. Tests pin the trust boundary:
--   * Read policies deny forged claims (membership is resolved from the DB, not the token).
--   * Write policies on permission-gated tables also hold (members_manage / organization_manage).

begin;

select plan(14);

-- ============================================================
-- Setup: Carol (with CL/nin 13.123.456-2) plus five invites covering every lifecycle
-- state we care to test. service_role for setup speed — the RLS gates on invite
-- creation are exercised elsewhere.
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000ca02',
  'authenticated', 'authenticated',
  'carol-doc@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Carol Doc","profile_identity":{"country":"CL","kind":"nin","value":"13.123.456-2"}}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

set local role service_role;

create temporary table _invites on commit drop as
  with rows as (
    insert into public.organization_memberships (
      organization_id,
      organization_membership_invite_address_level0_id, organization_membership_invite_document_kind, organization_membership_invite_document_value,
      organization_membership_invite_token, organization_membership_invite_expires_at,
      organization_membership_revoked_at, organization_membership_rejected_at,
      profile_id, organization_membership_accepted_at
    ) values
      -- (a) Active doc invite in org 1.
      (1, 'CL', 'nin', '13.123.456-2',
       'tok-pending-active', current_timestamp + interval '7 days',
       null, null, null, null),
      -- (b) Expired doc invite in org 2 (separate org so partial index does not collide).
      (2, 'CL', 'nin', '13.123.456-2',
       'tok-pending-expired', current_timestamp - interval '1 day',
       null, null, null, null),
      -- (c) Revoked invite — partial unique index excludes rows where revoked_at is set,
      --     so this coexists with the active one in org 1.
      (1, 'CL', 'nin', '13.123.456-2',
       'tok-pending-revoked', current_timestamp + interval '7 days',
       current_timestamp, null, null, null),
      -- (d) Rejected invite — same exclusion logic as revoked.
      (1, 'CL', 'nin', '13.123.456-2',
       'tok-pending-rejected', current_timestamp + interval '7 days',
       null, current_timestamp, null, null),
      -- (e) Accepted invite. profile_id set + accepted_at set; index excludes (predicate
      --     `profile_id is null`).
      (1, 'CL', 'nin', '13.123.456-2',
       null, current_timestamp + interval '7 days',
       null, null, '00000000-0000-0000-0000-00000000ca02', current_timestamp)
    returning organization_membership_id, organization_membership_invite_token
  )
  select
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-pending-active')   as active_id,
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-pending-expired')  as expired_id,
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-pending-revoked')  as revoked_id,
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-pending-rejected') as rejected_id;

grant select on _invites to anon, authenticated;

reset role;

-- ============================================================
-- A. organization_memberships_pending_by_document — anon-callable surface
-- ============================================================

set local role anon;
set local request.jwt.claims to '';

-- Happy path: anon supplies the RUT in formatted form and gets only the ACTIVE invite.
-- Token is exposed in the result (UI uses it as the accept link).
select set_eq(
  $$ select organization_membership_invite_token
       from public.organization_memberships_pending_by_document('CL', 'nin', '13.123.456-2') $$,
  $$ values ('tok-pending-active'::text) $$,
  'anon: only the active doc invite is returned; expired/revoked/rejected/accepted excluded'
);

-- Normalisation: any formatting variant of the same RUT must hit the same row.
-- Invariant: the function normalises the value before matching.
select is(
  (select organization_membership_invite_token
     from public.organization_memberships_pending_by_document('CL', 'nin', '131234562')),
  'tok-pending-active',
  'anon: unformatted RUT (no dots, no dash) matches via normalisation'
);

select is(
  (select organization_membership_invite_token
     from public.organization_memberships_pending_by_document('CL', 'nin', '13123456-2')),
  'tok-pending-active',
  'anon: half-formatted RUT (no dots) matches via normalisation'
);

-- Bad check digit: normalize returns null → function returns empty (no oracle).
select is(
  (select count(*)
     from public.organization_memberships_pending_by_document('CL', 'nin', '12345678-9')),
  0::bigint,
  'anon: invalid CL/NIN check digit yields empty (no enumeration oracle)'
);

-- Valid but unknown RUT: empty.
select is(
  (select count(*)
     from public.organization_memberships_pending_by_document('CL', 'nin', '5126663-3')),
  0::bigint,
  'anon: valid but unrelated RUT yields empty'
);

-- Cross-country: same digits, different country must not match.
select is(
  (select count(*)
     from public.organization_memberships_pending_by_document('AR', 'nin', '13.123.456-2')),
  0::bigint,
  'anon: same value under different country (AR) does not match CL invite'
);

-- The result projects only public-safe fields. Project tenant + organization metadata
-- so the UI picker can render — this is by design, just pin it.
select is(
  (select tenant_slug
     from public.organization_memberships_pending_by_document('CL', 'nin', '13.123.456-2')),
  'acme',
  'anon: result includes tenant_slug for the UI picker'
);

reset role;

-- ============================================================
-- B. JWT-forging defense in depth.
--    Bob really exists in org 1 only with vacations_request. He forges JWT claims to
--    include org 2 (globex). We verify which RLS policies are bypassed by trusting the
--    forged JWT and which still hold via DB-backed permission checks.
-- ============================================================

-- Baseline: legitimate Bob, only org 1.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

-- Sanity: legitimate Bob cannot read tenant 2 (not in JWT claims).
select is(
  (select count(*) from public.tenants where tenant_id = 2),
  0::bigint,
  'baseline: legit Bob (org 1 only) cannot read tenant 2'
);

reset role;

-- Forged JWT: Bob's real sub, but app_metadata claims org 2 + tenant 2 too.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

-- Read policies are DB-backed now — forging app_metadata buys nothing. Bob's real
-- membership (org 1 only) is what RLS resolves via viewer_tenant_ids(), so tenant 2 stays
-- invisible regardless of the forged claim.
select is(
  (select count(*) from public.tenants where tenant_id = 2),
  0::bigint,
  'forged JWT cannot read tenant 2 (reads resolve membership from the DB, not the token)'
);

-- Same for organization_memberships in org 2: Bob is not a member, so RLS hides them.
select is(
  (select count(*) from public.organization_memberships where organization_id = 2),
  0::bigint,
  'forged JWT cannot read organization_memberships in org 2 (DB-backed read policy)'
);

-- Write policies on permission-gated tables hold: viewer_permission_org_ids does a
-- DB lookup keyed on viewer_profile_id (Bob's real sub) and returns no org 2 rows.

-- Get Alice's organization_membership_id in org 2 (target for an attempted forged grant).
set local request.jwt.claims to '';
reset role;
set local role service_role;
create temporary table _targets on commit drop as
  select
    (select organization_membership_id from public.organization_memberships
       where organization_id = 2 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org2,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000b00b') as bob_org1;
grant select on _targets to authenticated;
reset role;

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

-- Attempt 1: insert a permission grant into org 2 (Alice's organization_membership). Forged JWT
-- claims org 2 organization_membership, but Bob has no real members_manage anywhere → write blocked.
prepare forged_grant as
  insert into public.organization_membership_permissions (organization_membership_id, permission_id)
  values ((select alice_org2 from _targets), 'presets_manage');
select throws_ok(
  'execute forged_grant',
  '42501',
  null,
  'forged JWT cannot insert organization_membership_permissions in org 2 (DB-backed members_manage check)'
);
deallocate forged_grant;

-- Attempt 2: forge a self-elevation in org 1 (Bob's real org). Bob has only
-- vacations_request, no members_manage → also blocked.
prepare self_elevate as
  insert into public.organization_membership_permissions (organization_membership_id, permission_id)
  values ((select bob_org1 from _targets), '*');
select throws_ok(
  'execute self_elevate',
  '42501',
  null,
  'forged JWT does not help Bob elevate himself in org 1 (no real members_manage)'
);
deallocate self_elevate;

-- Attempt 3: UPDATE tenant 2 (organization_manage gate, DB-backed). Forged JWT cannot
-- bypass — the UPDATE returns 0 rows because the USING clause filters them out.
-- Postgres does not raise on a zero-row UPDATE, so assert via the count instead.
update public.tenants set tenant_name = 'Hijacked' where tenant_id = 2;

reset role;
set local role service_role;

select is(
  (select tenant_name from public.tenants where tenant_id = 2),
  'Globex SA',
  'forged JWT cannot UPDATE tenant 2 (organization_manage policy filters via DB lookup)'
);

-- Attempt 4 (positive control): service_role bypasses everything — confirms the test
-- harness can actually mutate tenant 2 when authorised. Without this, a regression
-- that breaks ALL writes would pass attempt 3 silently.
update public.tenants set tenant_name = 'Globex SA v2' where tenant_id = 2;

select is(
  (select tenant_name from public.tenants where tenant_id = 2),
  'Globex SA v2',
  'positive control: service_role can UPDATE tenant 2 (confirms attempt 3 is a real block, not a no-op)'
);

reset role;

select * from finish();
rollback;
