-- RLS for the `profiles` storage bucket.
--
-- Convention: bucket name === table name; path_tokens[1] === profile_id (uuid).
-- Authenticated users may read everything (bucket is public) and write only under
-- `<their auth.uid()>/...`.
--
-- DELETE policies are NOT exercised here because storage ships with a `protect_delete`
-- trigger that blocks direct SQL deletes — clients must go through the Storage API,
-- which orphans the underlying object otherwise. The trigger fires before RLS, so
-- a pgTAP `throws_ok` would surface the wrong SQLSTATE.

begin;

select plan(6);

-- ============================================================
-- Alice can write under her own folder
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
     values ('profiles', '00000000-0000-0000-0000-00000000a11c/avatar/01.png', '00000000-0000-0000-0000-00000000a11c') $$,
  'Alice can upload to her own profiles/<uuid>/avatar/ folder'
);

-- The list operation (SELECT) is public — Alice can see her own upload back.
select is(
  (select count(*)::int
     from storage.objects
     where bucket_id = 'profiles'
       and name like '00000000-0000-0000-0000-00000000a11c/%'),
  1,
  'Alice sees her own avatar via SELECT'
);

-- Alice cannot upload to Bob's folder.
prepare alice_writes_bob as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('profiles', '00000000-0000-0000-0000-00000000b00b/avatar/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_bob',
  '42501',  -- insufficient_privilege; RLS denial surfaces as this SQLSTATE
  null,
  'Alice cannot upload to another user''s folder'
);

deallocate alice_writes_bob;

-- Only the `avatar` subfolder is allowed — uploads to other subfolders are denied.
prepare alice_writes_non_avatar as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('profiles', '00000000-0000-0000-0000-00000000a11c/banner/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_non_avatar',
  '42501',
  null,
  'Alice cannot upload to a non-avatar subfolder (only `avatar/` is exposed)'
);

deallocate alice_writes_non_avatar;

reset role;

-- ============================================================
-- Bob can write under his own folder (and not Alice's)
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('profiles', '00000000-0000-0000-0000-00000000b00b/avatar/01.png', '00000000-0000-0000-0000-00000000b00b') $$,
  'Bob can upload to his own profiles/<uuid>/avatar/ folder'
);

prepare bob_writes_alice as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('profiles', '00000000-0000-0000-0000-00000000a11c/avatar/02.png', '00000000-0000-0000-0000-00000000b00b');

select throws_ok(
  'execute bob_writes_alice',
  '42501',
  null,
  'Bob cannot upload to Alice''s folder'
);

deallocate bob_writes_alice;

reset role;

select * from finish();
rollback;
