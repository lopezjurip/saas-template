-- RLS for the `organizations` storage bucket.
--
-- Convention: bucket name === table name; path_tokens[1] === organization_id (int).
-- Write requires `organization_manage` (or wildcard `*`) on that organization.
--
-- Seed grants:
--   alice has '*' in org 1, no organization_manage in org 2
--   bob   has 'vacations_request' in org 1, nothing in org 2

begin;

select plan(7);

-- ============================================================
-- Alice — '*' on org 1 covers organization_manage there.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('organizations', '1/avatar/01.png', '00000000-0000-0000-0000-00000000a11c') $$,
  'Alice can upload to organizations/1/avatar/ (wildcard covers organization_manage)'
);

-- Alice has no organization_manage in org 2.
prepare alice_writes_org2 as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('organizations', '2/avatar/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_org2',
  '42501',
  null,
  'Alice cannot upload to organizations/2/avatar/ (no organization_manage in org 2)'
);

deallocate alice_writes_org2;

-- Non-numeric first segment must be rejected by the regex guard (no cast error).
prepare alice_writes_garbage_path as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('organizations', 'not-a-number/avatar/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_garbage_path',
  '42501',
  null,
  'Non-numeric path_tokens[1] is rejected (regex guard prevents cast error)'
);

deallocate alice_writes_garbage_path;

-- Only `avatar` subfolder is allowed.
prepare alice_writes_non_avatar as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('organizations', '1/banner/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_non_avatar',
  '42501',
  null,
  'Alice cannot upload to a non-avatar subfolder (only `avatar/` is exposed)'
);

deallocate alice_writes_non_avatar;

reset role;

-- ============================================================
-- Bob — only vacations_request on org 1, no organization_manage anywhere.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

prepare bob_writes_org1 as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('organizations', '1/avatar/02.png', '00000000-0000-0000-0000-00000000b00b');

select throws_ok(
  'execute bob_writes_org1',
  '42501',
  null,
  'Bob cannot upload to organizations/1/avatar/ (no organization_manage)'
);

deallocate bob_writes_org1;

-- SELECT is public for the org bucket — Bob can list the avatar Alice uploaded above.
select is(
  (select count(*)::int
     from storage.objects
     where bucket_id = 'organizations'
       and name like '1/%'),
  1,
  'Bob can read organizations bucket (public SELECT)'
);

reset role;

-- ============================================================
-- Alice can update her own org's file metadata
-- ============================================================
-- DELETE is intentionally not exercised here: storage ships with a `protect_delete`
-- trigger that blocks direct SQL deletes, so clients must use the Storage API.

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select lives_ok(
  $$ update storage.objects
       set metadata = jsonb_build_object('size', 123)
     where bucket_id = 'organizations'
       and name = '1/avatar/01.png' $$,
  'Alice can update metadata on org 1 files'
);

reset role;

select * from finish();
rollback;
