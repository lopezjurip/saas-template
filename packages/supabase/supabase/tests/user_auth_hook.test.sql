-- public.user_auth_hook is a pass-through. Only the subject (profile_id, carried as the
-- `sub` claim) lives in the JWT — tenant/organization/agency membership and onboarding
-- state are resolved at query time via the DB-backed viewer_* helpers, never embedded in
-- the token. These tests pin that the hook injects NO app_metadata and leaves claims intact.

begin;

select plan(3);

-- The hook returns the event unchanged.
select is(
  public.user_auth_hook(jsonb_build_object(
    'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
    'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
  )),
  jsonb_build_object(
    'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
    'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
  ),
  'hook returns the event unchanged (pass-through)'
);

-- No app_metadata is injected, even for a fully-onboarded, multi-org seeded user.
select is(
  public.user_auth_hook(jsonb_build_object(
    'user_id', '00000000-0000-0000-0000-00000000a11c'::text,
    'claims', jsonb_build_object('sub', '00000000-0000-0000-0000-00000000a11c')
  )) -> 'claims' -> 'app_metadata',
  null,
  'hook injects no app_metadata (membership/onboarding live in the DB, not the JWT)'
);

-- Issuer-provided claims (including any app_metadata) are preserved verbatim.
select is(
  public.user_auth_hook(jsonb_build_object(
    'claims', jsonb_build_object('sub', null, 'app_metadata', jsonb_build_object('foo', 'bar'))
  )) -> 'claims' -> 'app_metadata' ->> 'foo',
  'bar',
  'hook preserves issuer-provided claims untouched'
);

select * from finish();
rollback;
