-- Journey: pending-invite lifecycle (accept / reject) + identity-mismatch attacks.
--
-- Covers the surface exposed by:
--   public.viewer_organization_membership_pending()          -- "what invites match my identity?"
--   public.viewer_organization_membership_accept(int)        -- "claim invite N"
--   public.viewer_organization_membership_reject(int)        -- "decline invite N"
--
-- Threat model in scope:
--   * Invitee accepts an invite that wasn't meant for them (impersonation).
--   * Invitee accepts the same invite twice (double-claim).
--   * Invitee accepts a revoked / rejected / expired invite.
--   * Unauthenticated session (no JWT sub) cannot drive these RPCs.
--   * Pending row gates: lifecycle stamps actually drive `viewer_organization_membership_pending`.

begin;

select plan(18);

-- ============================================================
-- Setup: two new users (Carol, Dave) with auth rows + profiles.
-- Carol owns CL+nin '13.123.456-2' (normalized '131234562').
-- Dave has only email; no document.
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000ca01',
    'authenticated', 'authenticated',
    'carol-journey@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carol Journey","profile_identity":{"country":"CL","kind":"nin","value":"13.123.456-2"}}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000da01',
    'authenticated', 'authenticated',
    'dave-journey@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dave Journey"}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  );

-- Setup invites. service_role bypasses RLS and the lifecycle trigger so the seed
-- can stamp revoked_at directly. RLS gating on who-can-create-invites is covered by
-- rls_organization_memberships.test.sql; this journey starts at "invite exists, what now?".
--
-- The partial unique indexes on (org, identifier) for PENDING rows exclude:
--   - revoked rows (where organization_membership_revoked_at is null)  -> revoked Carol invite can coexist
--   - rejected rows (where organization_membership_rejected_at is null)
-- but DO NOT exclude expired rows. To keep one active + one expired for Carol's email
-- without colliding, the expired/revoked ones live in org 2 (globex).
set local role service_role;

create temporary table _invites on commit drop as
  with rows as (
    insert into public.organization_memberships (
      organization_id,
      organization_membership_invite_email, organization_membership_invite_address_level0_id,
      organization_membership_invite_document_kind, organization_membership_invite_document_value,
      organization_membership_invite_token, organization_membership_invite_expires_at, organization_membership_revoked_at
    ) values
      -- (a) Active email invite to Carol in org 1.
      (1, 'carol-journey@humane.test', null, null, null,
       'tok-carol-email', current_timestamp + interval '7 days', null),
      -- (b) Active document invite to Carol's RUT in org 1.
      (1, null, 'CL', 'nin', '13.123.456-2',
       'tok-carol-doc', current_timestamp + interval '7 days', null),
      -- (c) Expired email invite to Carol in ORG 2 (different (org,email) so the partial
      --     index does not collide with the org-1 active one).
      (2, 'carol-journey@humane.test', null, null, null,
       'tok-carol-expired', current_timestamp - interval '1 day', null),
      -- (d) Revoked document invite to Carol in org 2. Revoked rows are excluded from
      --     the partial unique index, so this never collides with any other doc invite.
      (2, null, 'CL', 'nin', '13.123.456-2',
       'tok-carol-revoked', current_timestamp + interval '7 days', current_timestamp),
      -- (e) Active email invite addressed to Dave (NOT Carol) in org 1.
      (1, 'dave-journey@humane.test', null, null, null,
       'tok-dave-email', current_timestamp + interval '7 days', null)
    returning organization_membership_id, organization_membership_invite_token
  )
  select
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-carol-email')    as carol_email,
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-carol-doc')      as carol_doc,
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-carol-expired')  as carol_expired,
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-carol-revoked')  as carol_revoked,
    (select organization_membership_id from rows where organization_membership_invite_token = 'tok-dave-email')     as dave_email;

grant select on _invites to authenticated, anon;

reset role;

-- ============================================================
-- 1. Unauthenticated callers. Postgres grants EXECUTE on a function to PUBLIC by
--    default, so anon CAN invoke these RPCs — but the function body checks
--    `auth.uid() is null` (or returns empty) before doing anything.
-- ============================================================

set local role anon;
set local request.jwt.claims to '';

select is(
  (select count(*) from public.viewer_organization_membership_pending()),
  0::bigint,
  'anon caller gets zero pending invites (auth.uid is null short-circuits)'
);

prepare anon_accept as select public.viewer_organization_membership_accept(1);
select throws_ok(
  'execute anon_accept',
  'P0001',
  'not authenticated',
  'anon caller cannot accept (function body rejects null auth.uid)'
);
deallocate anon_accept;

reset role;

-- Authenticated role but no sub claim → same "not authenticated" branch.
set local role authenticated;
set local request.jwt.claims to '{}';

prepare nosub_accept as select public.viewer_organization_membership_accept((select carol_email from _invites));
select throws_ok(
  'execute nosub_accept',
  'P0001',
  'not authenticated',
  'authenticated role with no sub claim cannot accept'
);
deallocate nosub_accept;

reset role;

-- ============================================================
-- 2. Carol authenticates. viewer_organization_membership_pending returns only the matches that
--    match her identity AND are still genuinely pending.
--
--    Of the five seeded rows, only the two ACTIVE ones for Carol must surface;
--    the expired, revoked, and Dave's rows must be hidden.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000ca01",
  "app_metadata": { "tenants": [], "organizations": [] }
}';

select set_eq(
  $$ select organization_membership_invite_token from public.viewer_organization_membership_pending() order by 1 $$,
  $$ values ('tok-carol-doc'::text), ('tok-carol-email'::text) $$,
  'Carol sees exactly her two live invites (expired + revoked + Dave excluded)'
);

-- ============================================================
-- 3. Impersonation / lifecycle-mismatch attempts before Carol has accepted anything.
-- ============================================================

-- Carol tries to grab Dave's invite (different email). Must fail with the identity-mismatch error.
prepare carol_steal_dave as select public.viewer_organization_membership_accept((select dave_email from _invites));
select throws_ok(
  'execute carol_steal_dave',
  'P0001',
  'invitation not found or does not match your account',
  'Carol cannot accept an invite addressed to a different email'
);
deallocate carol_steal_dave;

-- Carol tries to accept an expired one.
prepare carol_accept_expired as select public.viewer_organization_membership_accept((select carol_expired from _invites));
select throws_ok(
  'execute carol_accept_expired',
  'P0001',
  'invitation not found or does not match your account',
  'Carol cannot accept her expired invite'
);
deallocate carol_accept_expired;

-- Carol tries to accept a revoked one.
prepare carol_accept_revoked as select public.viewer_organization_membership_accept((select carol_revoked from _invites));
select throws_ok(
  'execute carol_accept_revoked',
  'P0001',
  'invitation not found or does not match your account',
  'Carol cannot accept her revoked invite'
);
deallocate carol_accept_revoked;

-- Random organization_membership_id that doesn't exist — must fail with the same opaque error
-- (no enumeration-oracle: caller cannot distinguish "doesn't exist" from "not mine").
prepare carol_accept_phantom as select public.viewer_organization_membership_accept(999999);
select throws_ok(
  'execute carol_accept_phantom',
  'P0001',
  'invitation not found or does not match your account',
  'Carol cannot accept a phantom organization_membership id'
);
deallocate carol_accept_phantom;

-- ============================================================
-- 4. Happy-path: Carol accepts the email invite. Side effects must be exactly:
--    profile_id bound to her, accepted_at stamped, token burned.
-- ============================================================

select lives_ok(
  format($$ select public.viewer_organization_membership_accept(%s) $$, (select carol_email from _invites)),
  'Carol accepts her email invite'
);

-- Read the post-accept row as service_role. Carol's test JWT carries
-- app_metadata.organizations:[] so SELECT-RLS on organization_memberships hides her own row;
-- we want to inspect the SIDE EFFECTS on the DB, not Carol's read visibility.
reset role;
set local role service_role;

select is(
  (select profile_id from public.organization_memberships where organization_membership_id = (select carol_email from _invites)),
  '00000000-0000-0000-0000-00000000ca01'::uuid,
  'accepted invite is now bound to Carol''s profile_id'
);

select isnt(
  (select organization_membership_accepted_at from public.organization_memberships where organization_membership_id = (select carol_email from _invites)),
  null,
  'accepted invite has organization_membership_accepted_at stamped'
);

select is(
  (select organization_membership_invite_token from public.organization_memberships where organization_membership_id = (select carol_email from _invites)),
  null,
  'accepted invite token is burned (set to null)'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000ca01",
  "app_metadata": { "tenants": [], "organizations": [] }
}';

-- ============================================================
-- 5. Double-claim prevention. Carol cannot re-accept her own accepted invite.
-- ============================================================

prepare carol_accept_twice as select public.viewer_organization_membership_accept((select carol_email from _invites));
select throws_ok(
  'execute carol_accept_twice',
  'P0001',
  'invitation not found or does not match your account',
  'Carol cannot accept the same invite twice (no longer pending)'
);
deallocate carol_accept_twice;

-- The accepted invite is also no longer returned by viewer_organization_membership_pending.
select is(
  (select count(*) from public.viewer_organization_membership_pending() where organization_membership_id = (select carol_email from _invites)),
  0::bigint,
  'accepted invite is excluded from viewer_organization_membership_pending'
);

-- The document-matched invite is still pending and visible.
select is(
  (select count(*) from public.viewer_organization_membership_pending() where organization_membership_id = (select carol_doc from _invites)),
  1::bigint,
  'Carol''s doc invite is still pending after accepting the email one'
);

-- ============================================================
-- 6. Reject path. Carol declines her remaining doc invite.
-- ============================================================

select lives_ok(
  format($$ select public.viewer_organization_membership_reject(%s) $$, (select carol_doc from _invites)),
  'Carol rejects her doc invite'
);

reset role;
set local role service_role;

select isnt(
  (select organization_membership_rejected_at from public.organization_memberships where organization_membership_id = (select carol_doc from _invites)),
  null,
  'rejected invite has organization_membership_rejected_at stamped'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000ca01",
  "app_metadata": { "tenants": [], "organizations": [] }
}';

-- After reject, the same invite cannot be accepted (still not in pending list).
prepare carol_accept_rejected as select public.viewer_organization_membership_accept((select carol_doc from _invites));
select throws_ok(
  'execute carol_accept_rejected',
  'P0001',
  'invitation not found or does not match your account',
  'Carol cannot accept her own rejected invite'
);
deallocate carol_accept_rejected;

reset role;

select * from finish();
rollback;
