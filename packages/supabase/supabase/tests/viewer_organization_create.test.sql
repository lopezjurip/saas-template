begin;

select plan(12);

select has_function(
  'protected',
  'organization_create',
  array['uuid', 'integer', 'text', 'text'],
  'protected.organization_create(uuid, int, text, text) exists'
);

select has_function(
  'public',
  'viewer_organization_create',
  array['integer', 'text', 'text'],
  'viewer_organization_create(int, text, text) exists'
);

select is(
  (
    select p.provolatile::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'protected' and p.proname = 'organization_create'
  ),
  'v',
  'protected.organization_create is explicitly volatile'
);

select is(
  (
    select p.provolatile::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_organization_create'
  ),
  'v',
  'viewer_organization_create is explicitly volatile'
);

select is(
  (
    select p.proretset
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_organization_create'
  ),
  true,
  'viewer_organization_create returns a set'
);

select is(
  (
    select p.prorows
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_organization_create'
  ),
  1::real,
  'viewer_organization_create declares rows 1'
);

select is(
  (
    select p.prorettype::regtype::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_organization_create'
  ),
  'organizations',
  'viewer_organization_create returns organization rows'
);

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select ok(
  (
    select organization_id
    from public.viewer_organization_create(1, 'viewer-organization', 'Viewer Organization')
  ) is not null,
  'the viewer wrapper returns the created organization row'
);

select is(
  (
    select organization_name
    from public.organizations
    where tenant_id = 1 and organization_slug = 'viewer-organization'
  ),
  'Viewer Organization',
  'the organization is created in the requested tenant'
);

select ok(
  exists (
    select 1
    from public.organization_memberships m
    join public.organizations o using (organization_id)
    where o.tenant_id = 1
      and o.organization_slug = 'viewer-organization'
      and m.profile_id = '00000000-0000-0000-0000-00000000a11c'
      and m.organization_membership_accepted_at is not null
  ),
  'the creator receives an accepted membership'
);

select ok(
  exists (
    select 1
    from public.permission_grants p
    join public.organization_memberships m on m.organization_membership_id = p.subject_organization_membership_id
    join public.organizations o using (organization_id)
    where o.tenant_id = 1
      and o.organization_slug = 'viewer-organization'
      and p.permission_id = '*'
  ),
  'the creator receives the wildcard permission'
);

set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

select throws_ok(
  $$ select public.viewer_organization_create(1, 'forbidden-organization', 'Forbidden Organization') $$,
  'P0001',
  'no_permission',
  'a viewer without organization_manage cannot create another organization'
);

select * from finish();
rollback;
