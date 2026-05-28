-- Verifies the shape of the JWT injected by public.user_auth_hook.
-- The hook runs on token issuance and adds app_metadata.{tenants, organizations, agencies, onboarded}.

begin;

select plan(8);

-- ============================================================
-- Alice — member of acme + globex, marked onboarded by seed
-- ============================================================

with hook_event as (
  select jsonb_build_object(
    'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
    'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
  ) as event
),
hook_result as (
  select public.user_auth_hook(event) as result from hook_event
)
select is(
  (select result -> 'claims' -> 'app_metadata' ->> 'onboarded' from hook_result),
  'true',
  'Alice JWT has onboarded=true (profile_onboarded_at set by seed)'
);

select set_eq(
  $$ select (t->>'id')::int, t->>'slug'
     from jsonb_array_elements(
       (public.user_auth_hook(jsonb_build_object(
         'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
         'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
       )) -> 'claims' -> 'app_metadata' -> 'tenants')
     ) as t $$,
  $$ values (1, 'acme'), (2, 'globex') $$,
  'Alice JWT lists tenants 1 (acme) and 2 (globex)'
);

select set_eq(
  $$ select (o->>'id')::int
     from jsonb_array_elements(
       (public.user_auth_hook(jsonb_build_object(
         'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
         'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
       )) -> 'claims' -> 'app_metadata' -> 'organizations')
     ) as o $$,
  $$ values (1), (2) $$,
  'Alice JWT lists organizations 1 and 2'
);

select is(
  jsonb_array_length(
    public.user_auth_hook(jsonb_build_object(
      'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
      'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
    )) -> 'claims' -> 'app_metadata' -> 'agencies'
  ),
  0,
  'Alice JWT has agencies=[] (not affiliated with any agency)'
);

-- ============================================================
-- Bob — org 1 only
-- ============================================================

select set_eq(
  $$ select (t->>'id')::int
     from jsonb_array_elements(
       (public.user_auth_hook(jsonb_build_object(
         'user_id', '00000000-0000-0000-0000-00000000b00b'::text,
         'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000b00b')
       )) -> 'claims' -> 'app_metadata' -> 'tenants')
     ) as t $$,
  $$ values (1) $$,
  'Bob JWT lists only tenant 1'
);

-- ============================================================
-- Anonymous / unknown user_id — empty arrays, false flags
-- ============================================================

select results_eq(
  $$ select
       (public.user_auth_hook(jsonb_build_object(
         'claims', jsonb_build_object('sub', null)
       )) -> 'claims' -> 'app_metadata') $$,
  $$ values ('{"tenants": [], "agencies": [], "onboarded": false, "organizations": []}'::jsonb) $$,
  'Anonymous (no user_id) gets empty arrays and false flags'
);

-- Agency affiliation: affiliating Alice with a new agency flips agencies claim.
insert into public.agencies (agency_id, agency_name, agency_slug)
  values ('a0000000-0000-0000-0000-000000000001', 'Test Agency', 'test-agency');

insert into public.affiliations (agency_id, profile_id, affiliation_accepted_at)
  values ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000a11c', now());

select is(
  jsonb_array_length(
    public.user_auth_hook(jsonb_build_object(
      'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
      'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
    )) -> 'claims' -> 'app_metadata' -> 'agencies'
  ),
  1,
  'Alice JWT has agencies=[{id}] after affiliation insert'
);

-- Revoking affiliation removes it from the JWT.
update public.affiliations
  set affiliation_revoked_at = now()
  where agency_id = 'a0000000-0000-0000-0000-000000000001'
    and profile_id = '00000000-0000-0000-0000-00000000a11c';

select is(
  jsonb_array_length(
    public.user_auth_hook(jsonb_build_object(
      'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
      'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
    )) -> 'claims' -> 'app_metadata' -> 'agencies'
  ),
  0,
  'Alice JWT has agencies=[] after affiliation revoked'
);

select * from finish();
rollback;
