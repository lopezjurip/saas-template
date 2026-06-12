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
--   C. Agency affiliate read/write split. An agency affiliate with a global grant
--      sees every tenant via the agency SELECT bypass, but every write policy is
--      permission-backed (organization_membership grants) — agencies are not a write shortcut.

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
-- C. Agency affiliate read/write split
--
-- Eve is affiliated with the "Humane Platform" agency, which has a global grant ('*').
-- She must:
--   - SEE every tenant + every organization_membership (SELECT policies bypass via viewer_agency_permission_org_ids)
--   - NOT be able to write anywhere (write policies gate on DB-backed permission slugs;
--     being an agency affiliate is not itself a write permission)
-- ============================================================

set local role service_role;

-- Create agency, affiliate Eve, add global wildcard grant.
insert into public.agencies (agency_id, agency_name, agency_slug)
  values ('a0000000-0000-0000-0000-000000000001', 'Humane Platform', 'humane-platform');

insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
  values ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000eee0', now());

insert into public.agencies_organizations_grants (agency_id, organization_id, permission_id)
  values ('a0000000-0000-0000-0000-000000000001', null, '*');

reset role;

-- Agency affiliate JWT: no orgs / tenants as member, but agencies claim with the agency.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000eee0",
  "app_metadata": {
    "tenants": [],
    "organizations": [],
    "agencies": [{"id": "a0000000-0000-0000-0000-000000000001"}]
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

-- Write: agency affiliate cannot grant permissions anywhere (no DB-backed members_manage).
prepare eve_grant_alice as
  insert into public.organization_membership_permissions (organization_membership_id, permission_id)
  values ((select alice_org2 from _mids), 'members_manage');
select throws_ok(
  'execute eve_grant_alice',
  '42501',
  null,
  'agency affiliate cannot insert organization_membership_permissions (write policy is permission-backed, not agency-backed)'
);
deallocate eve_grant_alice;

-- Write: agency affiliate cannot UPDATE tenant metadata.
update public.tenants set tenant_name = 'Agency Hijack' where tenant_id = 1;

reset role;
set local role service_role;

select is(
  (select tenant_name from public.tenants where tenant_id = 1),
  'Acme SpA',
  'agency affiliate UPDATE on tenants is filtered by USING (organization_manage), name unchanged'
);

-- Write: agency affiliate cannot insert a new organization_membership (e.g. invite themselves into acme).
reset role;
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000eee0",
  "app_metadata": {
    "tenants": [],
    "organizations": [],
    "agencies": [{"id": "a0000000-0000-0000-0000-000000000001"}]
  }
}';

prepare eve_invite_self as
  insert into public.organization_memberships (
    organization_id, organization_membership_invite_email, organization_membership_invite_token, organization_membership_invite_expires_at
  ) values (
    1, 'eve-affiliate@humane.test', 'tok-eve-self', current_timestamp + interval '7 days'
  );
select throws_ok(
  'execute eve_invite_self',
  '42501',
  null,
  'agency affiliate cannot insert a new organization_membership (write policy gates on members_manage)'
);
deallocate eve_invite_self;

reset role;

select * from finish();
rollback;
