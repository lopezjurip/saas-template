-- Journey: privilege-escalation attempts that exercise the layered RLS / DB-backed
-- permission model. Three independent sub-journeys, each pinning an invariant:
--
--   A. Stale-JWT self un-revoke. After an admin revokes a member, the ex-member may
--      still hold an old JWT claiming the org. They cannot UPDATE their own row to
--      clear `organization_membership_revoked_at` because the write policy is DB-backed
--      (members_manage check via viewer_permission_org_ids).
--
--   B. Permission-preset forgery. A member without `presets_manage` cannot insert a
--      preset (even one referencing valid slugs) into their own org. Verifies the
--      preset trigger does NOT shadow the RLS write policy.
--
--   C. Homogeneous agency writes. An agency affiliate with a global ('*') grant
--      sees every tenant + all org memberships via SELECT bypass, AND can perform
--      org-scoped writes (grant permissions, invite members) via viewer_can_objects.
--      The real boundary: no agency bridge for the 'tenant' object type, so Eve
--      cannot update tenant metadata regardless of what the agency was granted.

begin;

select plan(10);

-- ============================================================
-- Seeds: capture relevant organization_membership ids and create an unaffiliated user Eve.
-- ============================================================

create temporary table _mids on commit drop as
  select
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org1,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 1 and profile_id = '00000000-0000-0000-0000-00000000b00b') as bob_org1,
    (select organization_membership_id from public.organization_memberships
       where organization_id = 2 and profile_id = '00000000-0000-0000-0000-00000000a11c') as alice_org2;
grant select on _mids to authenticated, anon, service_role;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000eee0',
  'authenticated', 'authenticated',
  'eve-affiliate@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Eve Affiliate"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
);

-- ============================================================
-- A. Stale-JWT self un-revoke
--
-- Step 1: Alice (admin) revokes Bob's organization_membership.
-- Step 2: Bob still holds a JWT claiming org 1. He attempts UPDATE to clear
--         revoked_at. Postgres does not error on a zero-row UPDATE filtered by
--         USING, so we assert the persisted state did not change.
-- ============================================================

-- As Alice (wildcard admin in org 1), revoke Bob.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

update public.organization_memberships
  set organization_membership_revoked_at = current_timestamp
  where organization_membership_id = (select bob_org1 from _mids);

-- Quick check Alice could see the revoked row reflected.
select isnt(
  (select organization_membership_revoked_at from public.organization_memberships
     where organization_membership_id = (select bob_org1 from _mids)),
  null,
  'admin successfully stamped revoked_at on the target organization_membership'
);

reset role;

-- Bob, with stale JWT claiming org 1, attempts to un-revoke himself.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

update public.organization_memberships
  set organization_membership_revoked_at = null
  where organization_membership_id = (select bob_org1 from _mids);

reset role;
set local role service_role;

select isnt(
  (select organization_membership_revoked_at from public.organization_memberships
     where organization_membership_id = (select bob_org1 from _mids)),
  null,
  'stale-JWT un-revoke leaves the revocation intact (UPDATE filtered by USING)'
);

reset role;

-- ============================================================
-- B. Permission-preset forgery
--
-- Bob tries to insert a preset into org 1 with a wildcard. Two layers should stop
-- him:
--   - permission_presets RLS write policy gates on `presets_manage`.
--   - the slug-validation trigger only blocks UNKNOWN slugs; '*' is known.
-- The RLS layer must hold even when the trigger would not.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

prepare bob_insert_preset as
  insert into public.permission_presets (
    organization_id, permission_preset_name, permission_preset_slugs
  ) values (
    1, 'Bob Forged Admin', array['*']::extensions.citext[]
  );
select throws_ok(
  'execute bob_insert_preset',
  '42501',
  null,
  'Bob without presets_manage cannot insert a preset (RLS write policy denies)'
);
deallocate bob_insert_preset;

-- Even a preset with no privileged slugs is blocked — the RLS policy gates the
-- table, not the slug content. The slug trigger is a separate guard for catalog drift.
prepare bob_insert_harmless_preset as
  insert into public.permission_presets (
    organization_id, permission_preset_name, permission_preset_slugs
  ) values (
    1, 'Bob Harmless Preset', array['presets_manage']::extensions.citext[]
  );
select throws_ok(
  'execute bob_insert_harmless_preset',
  '42501',
  null,
  'RLS gates the table regardless of slug content (no harmless-content carve-out)'
);
deallocate bob_insert_harmless_preset;

-- Bob also cannot mutate the seeded global "Empleado" preset (organization_id is null).
prepare bob_corrupt_global as
  update public.permission_presets
    set permission_preset_slugs = array['members_manage']::extensions.citext[]
    where permission_preset_name = 'Administrator' and organization_id is null;
-- UPDATE is filtered by USING when the row is org-id-null; the USING references
-- `permission_presets.organization_id` which is NULL → expression returns NULL → row
-- filtered out. Zero-row UPDATE, no error. Assert the global preset is unchanged.
execute bob_corrupt_global;
deallocate bob_corrupt_global;

reset role;
set local role service_role;

select isnt(
  (select permission_preset_slugs from public.permission_presets
     where permission_preset_name = 'Administrator' and organization_id is null),
  array['members_manage']::extensions.citext[],
  'global Administrator preset unchanged after Bob attempted UPDATE (USING filters him out)'
);

reset role;

-- ============================================================
-- C. Homogeneous: affiliate writes what the agency was granted (org-scoped);
--    no implicit tenant-object power.
--
-- Eve is affiliated with "Humane Platform" agency (id 9001), which holds a
-- global all-orgs wildcard grant ('*') in permission_grants.
-- Under the homogeneous (option B) decision viewer_can_objects IS the single
-- write gate — no special-case that subtracts agencies. Therefore:
--
--   - Eve SEES every tenant + every organization_membership (SELECT bypass).
--   - Eve CAN perform any org-scoped write the agency holds: she can grant
--     permissions on org members and invite new org members (org_memberships).
--   - Eve CANNOT update tenant metadata: the tenants UPDATE gate uses
--     viewer_can_objects('tenant_manage','tenant'), and lookup_objects has NO
--     agency bridge for the 'tenant' object type (only direct org-membership
--     grants ride on 'tenant'). The agency's '*' grant never resolves to any
--     tenant id — so Eve has no tenant-object power. This is the real, meaningful
--     boundary: agency power == exactly the (org-scoped) grants the agency holds.
-- ============================================================

set local role service_role;

-- Create agency, affiliate Eve, add global wildcard grant.
insert into public.agencies (agency_id, agency_name, agency_slug)
  values (9001, 'Humane Platform', 'humane-platform');

insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values (9001, '00000000-0000-0000-0000-00000000eee0', now());

insert into public.permission_grants (subject_agency_id, object_organization_id, permission_id)
  values (9001, null, '*');

-- Agency affiliate JWT: no orgs / tenants as member, but agencies claim with the agency.
reset role;
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000eee0",
  "app_metadata": {
    "tenants": [],
    "organizations": [],
    "agencies": [{"id": 9001}]
  }
}';

-- Read: agency affiliate sees both tenants (acme + globex).
select set_eq(
  $$ select tenant_slug::text from public.tenants order by 1 $$,
  $$ values ('acme'), ('globex') $$,
  'agency affiliate sees every tenant via viewer_agency_tenant_ids SELECT bypass'
);

-- Read: agency affiliate sees every organization_membership (3 from seed; Bob was just revoked above
-- so count includes the revoked row — revocation is a flag, not a hard delete).
select ok(
  (select count(*) from public.organization_memberships) >= 3,
  'agency affiliate sees all organization_memberships across orgs (>=3 from seed)'
);

-- Write (org-scoped, allowed): Eve grants members_manage on Bob's acme membership.
-- Bob has only 'presets_manage' — granting him members_manage is permitted and does
-- not touch any last-admin boundary (Alice still holds '*' in org 1).
prepare eve_grant_bob as
  insert into public.permission_grants (subject_organization_membership_id, permission_id)
  values ((select bob_org1 from _mids), 'members_manage');
select lives_ok(
  'execute eve_grant_bob',
  'agency affiliate CAN grant members_manage on an org member (viewer_can_objects includes agency bridge)'
);
deallocate eve_grant_bob;

-- Write (org-scoped, allowed): Eve invites a new address into org 2.
-- Targets org 2 (globex) using a fresh token. No last-admin boundary touched.
prepare eve_invite_new as
  insert into public.organization_memberships (
    organization_id, organization_membership_invite_email, organization_membership_invite_token, organization_membership_invite_expires_at
  ) values (
    2, 'new-hire@humane.test', 'tok-eve-new-hire-c1', current_timestamp + interval '7 days'
  );
select lives_ok(
  'execute eve_invite_new',
  'agency affiliate CAN insert an organization_membership invite (viewer_can_objects includes agency bridge)'
);
deallocate eve_invite_new;

-- Boundary: Eve CANNOT update tenant metadata.
-- The tenants UPDATE gate is viewer_can_objects('tenant_manage','tenant').
-- lookup_objects has no agency bridge for the ''tenant'' object type — the
-- 'tenant' branch only rides on direct org-membership grants, not agency grants.
-- Eve holds no org memberships, so the set is empty → UPDATE silently no-ops.
update public.tenants set tenant_name = 'Agency Hijack' where tenant_id = 1;

reset role;
set local role service_role;

select is(
  (select tenant_name from public.tenants where tenant_id = 1),
  'Acme SpA',
  'agency affiliate UPDATE on tenants is filtered by USING (no agency bridge for tenant object) — name unchanged'
);

reset role;

select * from finish();
rollback;
