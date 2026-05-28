-- public.storage_profiles / public.storage_organizations — pg_graphql views.
-- Sanity-check that the view returns the rows the underlying RLS would expose.

begin;

select plan(5);

-- ============================================================
-- Alice sees her avatar via the storage_profiles view
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

insert into storage.objects (bucket_id, name, owner_id, metadata)
  values (
    'profiles',
    '00000000-0000-0000-0000-00000000a11c/avatar/01.png',
    '00000000-0000-0000-0000-00000000a11c',
    jsonb_build_object('mimetype', 'image/png', 'contentLength', 12345)
  );

select is(
  (select count(*)::int
     from public.storage_profiles
     where profile_id = '00000000-0000-0000-0000-00000000a11c'::uuid),
  1,
  'Alice sees her avatar via public.storage_profiles'
);

select is(
  (select row(mimetype, content_length)::text
     from public.storage_profiles
     where profile_id = '00000000-0000-0000-0000-00000000a11c'::uuid
     limit 1),
  '(image/png,12345)',
  'mimetype + content_length are surfaced from metadata'
);

select is(
  (select src
     from public.storage_profiles
     where profile_id = '00000000-0000-0000-0000-00000000a11c'::uuid
     limit 1),
  '/storage/v1/object/public/profiles/00000000-0000-0000-0000-00000000a11c/avatar/01.png',
  'src is the relative CDN path'
);

-- ============================================================
-- Alice (with `*` on org 1) sees the org avatar
-- ============================================================

insert into storage.objects (bucket_id, name, owner_id)
  values ('organizations', '1/avatar/01.png', '00000000-0000-0000-0000-00000000a11c');

select is(
  (select count(*)::int
     from public.storage_organizations
     where organization_id = 1),
  1,
  'Alice sees the org-1 avatar via public.storage_organizations'
);

reset role;

-- ============================================================
-- Anonymous caller sees the avatar too (bucket is public + RLS allows)
-- ============================================================

set local role anon;

select is(
  (select count(*)::int
     from public.storage_profiles
     where profile_id = '00000000-0000-0000-0000-00000000a11c'::uuid),
  1,
  'Anonymous caller sees the public avatar through the view'
);

reset role;

select * from finish();
rollback;
