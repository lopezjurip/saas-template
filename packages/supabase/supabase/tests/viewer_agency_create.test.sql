begin;

select plan(16);

select has_function(
  'protected',
  'agency_create',
  array['uuid', 'text', 'text'],
  'protected.agency_create(uuid, text, text) exists'
);

select has_function(
  'public',
  'viewer_agency_create',
  array['text', 'text'],
  'viewer_agency_create(text, text) exists'
);

select function_privs_are(
  'public',
  'viewer_agency_create',
  array['text', 'text'],
  'authenticated',
  array['EXECUTE'],
  'authenticated can create an agency'
);

select is(
  (
    select p.provolatile::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'protected' and p.proname = 'agency_create'
  ),
  'v',
  'protected.agency_create is explicitly volatile'
);

select is(
  (
    select p.provolatile::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_agency_create'
  ),
  'v',
  'viewer_agency_create is explicitly volatile'
);

select is(
  (
    select p.proretset
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_agency_create'
  ),
  true,
  'viewer_agency_create returns a set'
);

select is(
  (
    select p.prorows
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_agency_create'
  ),
  1::real,
  'viewer_agency_create declares rows 1'
);

select is(
  (
    select p.prorettype::regtype::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_agency_create'
  ),
  'agencies',
  'viewer_agency_create returns agency rows'
);

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select lives_ok(
  $$ select public.viewer_agency_create('Atomic Agency', 'atomic-agency') $$,
  'an authenticated profile can create an agency'
);

select is(
  (select agency_name from public.agencies where agency_slug = 'atomic-agency'),
  'Atomic Agency',
  'the agency is created'
);

select ok(
  (
    select agency_id
    from public.viewer_agency_create('Second Atomic Agency', 'second-atomic-agency')
  ) is not null,
  'the viewer wrapper returns the created agency row'
);

select ok(
  exists (
    select 1
    from public.agency_memberships m
    join public.agencies a using (agency_id)
    where a.agency_slug = 'atomic-agency'
      and m.profile_id = '00000000-0000-0000-0000-00000000a11c'
      and m.agency_membership_accepted_at is not null
      and m.agency_membership_revoked_at is null
      and m.agency_membership_rejected_at is null
  ),
  'the creator receives an active membership'
);

select is(
  (select agency_name from public.viewer_agency_by_slug('atomic-agency')),
  'Atomic Agency',
  'the creator can immediately resolve the agency as viewer'
);

select throws_ok(
  $$ select public.viewer_agency_create('Duplicate Agency', 'atomic-agency') $$,
  'P0001',
  'slug_taken',
  'duplicate slugs return the stable slug_taken error'
);

set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000ffff"}';

select throws_ok(
  $$ select public.viewer_agency_create('Rollback Agency', 'rollback-agency') $$,
  '23503',
  null,
  'a membership failure aborts the RPC'
);

reset role;

select is(
  (select count(*) from public.agencies where agency_slug = 'rollback-agency'),
  0::bigint,
  'the agency insert rolls back when membership creation fails'
);

select * from finish();
rollback;
