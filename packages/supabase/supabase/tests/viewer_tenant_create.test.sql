begin;

select plan(14);

select has_function(
  'protected',
  'tenant_create',
  array['uuid', 'text', 'text'],
  'protected.tenant_create(uuid, text, text) exists'
);

select has_function(
  'public',
  'viewer_tenant_create',
  array['text', 'text'],
  'viewer_tenant_create(text, text) exists'
);

select function_privs_are(
  'public',
  'viewer_tenant_create',
  array['text', 'text'],
  'authenticated',
  array['EXECUTE'],
  'authenticated can create a tenant'
);

select is(
  (
    select p.provolatile::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'protected' and p.proname = 'tenant_create'
  ),
  'v',
  'protected.tenant_create is explicitly volatile'
);

select is(
  (
    select p.provolatile::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_tenant_create'
  ),
  'v',
  'viewer_tenant_create is explicitly volatile'
);

select is(
  (
    select p.proretset
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_tenant_create'
  ),
  true,
  'viewer_tenant_create returns a set'
);

select is(
  (
    select p.prorows
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_tenant_create'
  ),
  1::real,
  'viewer_tenant_create declares rows 1'
);

select is(
  (
    select p.prorettype::regtype::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'viewer_tenant_create'
  ),
  'tenants',
  'viewer_tenant_create returns tenant rows'
);

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select lives_ok(
  $$ select public.viewer_tenant_create('viewer-created', 'Viewer Created') $$,
  'an authenticated profile can create a tenant'
);

select is(
  (select organization_name from public.organizations where organization_slug = 'viewer-created'),
  'Viewer Created',
  'the default organization is created'
);

select ok(
  (select tenant_id from public.viewer_tenant_create('viewer-created-two', 'Viewer Created Two')) is not null,
  'the viewer wrapper returns the created tenant row'
);

select ok(
  exists (
    select 1
    from public.organization_memberships m
    join public.organizations o using (organization_id)
    where o.organization_slug = 'viewer-created'
      and m.profile_id = '00000000-0000-0000-0000-00000000a11c'
      and m.organization_membership_accepted_at is not null
  ),
  'the viewer receives an accepted organization membership'
);

select ok(
  exists (
    select 1
    from public.permission_grants p
    join public.organization_memberships m on m.organization_membership_id = p.subject_organization_membership_id
    join public.organizations o using (organization_id)
    where o.organization_slug = 'viewer-created'
      and p.permission_id = '*'
  ),
  'the viewer receives the wildcard permission (legacy organization_membership_permissions)'
);

-- Check the new model as superuser: permission_grants has no SELECT policy yet (Phase D).
-- This assertion verifies the row was written, not that it is visible under RLS.
reset role;
select ok(
  exists (
    select 1
    from public.permission_grants g
    join public.organization_memberships m
      on m.organization_membership_id = g.subject_organization_membership_id
    join public.organizations o using (organization_id)
    where o.organization_slug = 'viewer-created'
      and g.permission_id = '*'
  ),
  'the founder wildcard grant is dual-written to permission_grants'
);

select * from finish();
rollback;
