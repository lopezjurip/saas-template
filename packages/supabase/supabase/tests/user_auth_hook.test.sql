-- Verifies the shape of the JWT injected by public.user_auth_hook.
-- The hook runs on token issuance and adds app_metadata.{tenants, organizations, is_concierge, onboarded}.

begin;

select plan(7);

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
  (public.user_auth_hook(jsonb_build_object(
    'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
    'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
  )) -> 'claims' -> 'app_metadata' ->> 'is_concierge'),
  'false',
  'Alice is not a concierge'
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
  $$ values ('{"tenants": [], "onboarded": false, "is_concierge": false, "organizations": []}'::jsonb) $$,
  'Anonymous (no user_id) gets empty arrays and false flags'
);

-- Concierge promotion: inserting Alice into protected.concierges flips the claim.
insert into protected.concierges (profile_id) values ('00000000-0000-0000-0000-00000000a11c');

select is(
  (public.user_auth_hook(jsonb_build_object(
    'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
    'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
  )) -> 'claims' -> 'app_metadata' ->> 'is_concierge'),
  'true',
  'is_concierge=true after protected.concierges insert'
);

select * from finish();
rollback;
