-- Schema tests for public.profile_identities, internal.profile_identity_value_normalize,
-- the normalize trigger, UNIQUE constraints (per-profile + global partial), RLS, the
-- profile_identity_resolve RPC, and the document-aware columns + RPCs on
-- public.memberships (which subsumes the old public.invitations table).

begin;

select plan(35);

-- ============================================================
-- 1. internal.profile_identity_value_normalize
-- ============================================================

-- Valid CL+NIN with formatting
select is(internal.profile_identity_value_normalize('CL', 'nin', '11.111.111-1'), '111111111', 'normalize valid CL+NIN');
select is(internal.profile_identity_value_normalize('CL', 'nin', '5126663-3'), '51266633', 'normalize 7-digit RUT');
select is(internal.profile_identity_value_normalize('CL', 'nin', '13.123.456-2'), '131234562', 'normalize 8-digit RUT');
-- K validator (upper + lower)
select is(internal.profile_identity_value_normalize('CL', 'nin', '18.525.562-K'), '18525562K', 'normalize K validator');
select is(internal.profile_identity_value_normalize('CL', 'nin', '18.525.562-k'), '18525562K', 'normalize lowercase k uppercased');

-- Invalid CL+NIN check digit
select is(internal.profile_identity_value_normalize('CL', 'nin', '11.111.111-2'), null, 'reject CL+NIN with bad DV');
select is(internal.profile_identity_value_normalize('CL', 'nin', '12345678-9'), null, 'reject CL+NIN with bad DV (no dots)');

-- Leading zeros stripped / all zeros rejected
select is(internal.profile_identity_value_normalize('CL', 'nin', '0011.111.111-1'), '111111111', 'strip leading zeros');
select is(internal.profile_identity_value_normalize('CL', 'nin', '00000000-0'), null, 'all zeros rejected');

-- Passport (any country) — trim + upper
select is(internal.profile_identity_value_normalize('US', 'passport', 'ab1234567'), 'AB1234567', 'passport uppercased');
select is(internal.profile_identity_value_normalize('AR', 'passport', '  X 999 888  '), 'X999888', 'passport stripped');

-- NIN for non-CL country = trim + upper (no check digit validation in v1)
select is(internal.profile_identity_value_normalize('AR', 'nin', '12.345.678'), '12345678', 'AR NIN normalized without DV check');

-- Length bounds
select is(internal.profile_identity_value_normalize('CL', 'passport', 'ab'), null, 'too short rejected');

-- ============================================================
-- 2. profile_identities trigger: normalize on insert + raise on invalid
-- ============================================================

-- Alice inserts her RUT in formatted form -> normalized stored.
insert into public.profile_identities (profile_id, address_level0_id, profile_identity_document_kind, profile_identity_document_value)
values ('00000000-0000-0000-0000-00000000a11c', 'CL', 'nin', '11.111.111-1');

select is(
  (select profile_identity_document_value from public.profile_identities
     where profile_id = '00000000-0000-0000-0000-00000000a11c'
       and address_level0_id = 'CL'
       and profile_identity_document_kind = 'nin'),
  '111111111',
  'normalize trigger stores canonical value'
);

prepare insert_bad_rut as
  insert into public.profile_identities (profile_id, address_level0_id, profile_identity_document_kind, profile_identity_document_value)
  values ('00000000-0000-0000-0000-00000000b00b', 'CL', 'nin', '12345678-9');

select throws_ok(
  'execute insert_bad_rut',
  'P0001',
  null,
  'insert with invalid CL+NIN raises'
);
deallocate insert_bad_rut;

-- ============================================================
-- 3. UNIQUE constraints (per-profile + global partial)
-- ============================================================

prepare alice_dup_nin as
  insert into public.profile_identities (profile_id, address_level0_id, profile_identity_document_kind, profile_identity_document_value)
  values ('00000000-0000-0000-0000-00000000a11c', 'CL', 'nin', '5126663-3');

select throws_ok(
  'execute alice_dup_nin',
  '23505',
  null,
  'Alice cannot have two CL+nin documents (per-profile UNIQUE)'
);
deallocate alice_dup_nin;

-- Alice can add a different kind (passport) for same country.
select lives_ok(
  $$ insert into public.profile_identities (profile_id, address_level0_id, profile_identity_document_kind, profile_identity_document_value)
     values ('00000000-0000-0000-0000-00000000a11c', 'CL', 'passport', 'ABC123456') $$,
  'Alice can add a passport (different kind) for same country'
);

prepare bob_steal_rut as
  insert into public.profile_identities (profile_id, address_level0_id, profile_identity_document_kind, profile_identity_document_value)
  values ('00000000-0000-0000-0000-00000000b00b', 'CL', 'nin', '11.111.111-1');

select throws_ok(
  'execute bob_steal_rut',
  '23505',
  null,
  'Bob cannot register Alice''s active RUT (global UNIQUE)'
);
deallocate bob_steal_rut;

-- Soft-disable Alice's RUT, then Bob can claim it.
update public.profile_identities
  set profile_identity_disabled_at = current_timestamp
  where profile_id = '00000000-0000-0000-0000-00000000a11c'
    and address_level0_id = 'CL'
    and profile_identity_document_kind = 'nin';

select lives_ok(
  $$ insert into public.profile_identities (profile_id, address_level0_id, profile_identity_document_kind, profile_identity_document_value)
     values ('00000000-0000-0000-0000-00000000b00b', 'CL', 'nin', '11.111.111-1') $$,
  'After soft-disable, Bob can claim the RUT'
);

-- ============================================================
-- 4. profile_identity_resolve
-- ============================================================

-- Bob now owns the active RUT.
select is(
  public.profile_identity_resolve('CL', 'nin', '11111111-1'),
  '00000000-0000-0000-0000-00000000b00b'::uuid,
  'resolve returns the active owner profile'
);

-- Invalid RUT returns null.
select is(
  public.profile_identity_resolve('CL', 'nin', '12345678-9'),
  null,
  'resolve returns null for invalid CL+NIN'
);

-- Unknown but valid RUT returns null.
select is(
  public.profile_identity_resolve('CL', 'nin', '5126663-3'),
  null,
  'resolve returns null for unknown but valid RUT'
);

-- ============================================================
-- 5. RLS — owner self-read + admin co-org read + anon denied
-- ============================================================

-- Bob: sees only his own row (no members_manage).
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

select is(
  (select count(*) from public.profile_identities),
  1::bigint,
  'Bob sees only his own row (no members_manage grant)'
);

reset role;

-- Alice: '*' on org 1 includes members_manage -> sees Bob's identity too.
-- Visible: Alice's disabled RUT (still her row), Alice's passport, Bob's RUT.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select is(
  (select count(*) from public.profile_identities),
  3::bigint,
  'Alice sees her own 2 rows + Bob''s row via wildcard/members_manage in org 1'
);

reset role;

set local role anon;

select is(
  (select count(*) from public.profile_identities),
  0::bigint,
  'anon sees no profile_identities'
);

reset role;

-- ============================================================
-- 6. memberships (pending invites): identifier columns + check constraints
-- ============================================================

select lives_ok(
  $$ insert into public.memberships (
       organization_id,
       membership_invite_address_level0_id, membership_invite_document_kind, membership_invite_document_value,
       membership_invite_token, membership_invite_expires_at
     ) values (
       1, 'CL', 'nin', '13.123.456-2',
       'tok-doc-1', current_timestamp + interval '7 days'
     ) $$,
  'membership pending document-only insert OK'
);

select is(
  (select membership_invite_document_value from public.memberships where membership_invite_token = 'tok-doc-1'),
  '131234562',
  'membership invite normalize trigger fires on document'
);

select lives_ok(
  $$ insert into public.memberships (
       organization_id, membership_invite_email,
       membership_invite_token, membership_invite_expires_at
     ) values (
       1, 'newbie@example.com',
       'tok-email-1', current_timestamp + interval '7 days'
     ) $$,
  'membership pending email-only insert OK'
);

prepare insert_no_identifier as
  insert into public.memberships (organization_id, membership_invite_token, membership_invite_expires_at)
  values (1, 'tok-noid-1', current_timestamp + interval '7 days');

select throws_ok(
  'execute insert_no_identifier',
  '23514',
  null,
  'pending membership without any identifier fails check (memberships_pending_has_identifier)'
);
deallocate insert_no_identifier;

prepare insert_partial_doc as
  insert into public.memberships (organization_id, membership_invite_address_level0_id, membership_invite_token, membership_invite_expires_at)
  values (1, 'CL', 'tok-partial-1', current_timestamp + interval '7 days');

select throws_ok(
  'execute insert_partial_doc',
  '23514',
  null,
  'membership with partial document triplet fails check (memberships_doc_triplet_complete)'
);
deallocate insert_partial_doc;

-- ============================================================
-- 7. viewer_membership_pending RPC
-- ============================================================
-- Carol is an auth.users + profile created via the users_handle_created trigger.
-- She owns CL/nin/5126663-3 (normalized: 51266633).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000c001',
  'authenticated', 'authenticated',
  'carol@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Carol Test","profile_identity":{"country":"CL","kind":"nin","value":"5126663-3"}}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

-- Pending invite that matches Carol via email.
insert into public.memberships (
  organization_id, membership_invite_email,
  membership_invite_token, membership_invite_expires_at
) values (
  2, 'carol@humane.test', 'tok-carol-email', current_timestamp + interval '7 days'
);
-- Pending invite that matches Carol via document.
insert into public.memberships (
  organization_id,
  membership_invite_address_level0_id, membership_invite_document_kind, membership_invite_document_value,
  membership_invite_token, membership_invite_expires_at
) values (
  1, 'CL', 'nin', '5126663-3', 'tok-carol-doc', current_timestamp + interval '7 days'
);

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000c001",
  "app_metadata": { "tenants": [], "organizations": [] }
}';

select is(
  (select count(*) from public.viewer_membership_pending()),
  2::bigint,
  'viewer_membership_pending returns both matches (email + document)'
);

reset role;

-- Revoke the email-matching one; Carol should now see only the document-matching invite.
update public.memberships
  set membership_revoked_at = current_timestamp
  where membership_invite_token = 'tok-carol-email';

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000c001",
  "app_metadata": { "tenants": [], "organizations": [] }
}';

select is(
  (select count(*) from public.viewer_membership_pending()),
  1::bigint,
  'viewer_membership_pending excludes revoked invites'
);

reset role;

-- ============================================================
-- 8. users_handle_created with profile_identity metadata
-- ============================================================
-- Carol's row was created in section 7 with profile_identity in raw_user_meta_data,
-- which means the users_handle_created trigger should have materialized her identity.

select is(
  (select profile_identity_document_value from public.profile_identities where profile_id = '00000000-0000-0000-0000-00000000c001'),
  '51266633',
  'users_handle_created materializes profile_identities from raw_user_meta_data'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000d001',
  'authenticated', 'authenticated',
  'dave@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dave Test"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

select is(
  (select count(*) from public.profile_identities where profile_id = '00000000-0000-0000-0000-00000000d001'),
  0::bigint,
  'users_handle_created with no profile_identity metadata does not create row'
);

prepare invalid_signup as
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000e001',
    'authenticated', 'authenticated',
    'eve@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Eve Test","profile_identity":{"country":"CL","kind":"nin","value":"12345678-9"}}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  );

select throws_ok(
  'execute invalid_signup',
  'P0001',
  null,
  'signup with invalid CL+NIN check digit raises and aborts auth.users insert'
);
deallocate invalid_signup;

select * from finish();
rollback;
