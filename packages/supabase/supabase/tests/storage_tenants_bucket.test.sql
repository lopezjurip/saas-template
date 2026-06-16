-- RLS for the `tenants` storage bucket.
--
-- Convention: bucket name === table name; path_tokens[1] === tenant_id (int).
-- Write requires `tenant_manage` (or wildcard `*`) resolved via viewer_permission_tenant_ids.
--
-- Seed grants:
--   alice has '*' in org 1 (acme = tenant 1) → tenant_manage for tenant 1, none for tenant 2
--   bob   has 'presets_manage' in org 1 → no tenant_manage anywhere

begin;

select plan(6);

-- ============================================================
-- Alice — '*' on org 1 covers tenant_manage for tenant 1.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('tenants', '1/avatar/01.png', '00000000-0000-0000-0000-00000000a11c') $$,
  'Alice can upload to tenants/1/avatar/ (wildcard covers tenant_manage)'
);

prepare alice_writes_tenant2 as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('tenants', '2/avatar/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_tenant2',
  '42501',
  null,
  'Alice cannot upload to tenants/2/avatar/ (no tenant_manage for tenant 2)'
);

deallocate alice_writes_tenant2;

prepare alice_writes_garbage_path as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('tenants', 'not-a-number/avatar/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_garbage_path',
  '42501',
  null,
  'Non-numeric path_tokens[1] is rejected (regex guard prevents cast error)'
);

deallocate alice_writes_garbage_path;

prepare alice_writes_non_avatar as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('tenants', '1/banner/01.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes_non_avatar',
  '42501',
  null,
  'Alice cannot upload to a non-avatar subfolder (only `avatar/` is exposed)'
);

deallocate alice_writes_non_avatar;

reset role;

-- ============================================================
-- Bob — presets_manage only, no tenant_manage anywhere.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

prepare bob_writes_tenant1 as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('tenants', '1/avatar/02.png', '00000000-0000-0000-0000-00000000b00b');

select throws_ok(
  'execute bob_writes_tenant1',
  '42501',
  null,
  'Bob cannot upload to tenants/1/avatar/ (no tenant_manage)'
);

deallocate bob_writes_tenant1;

-- SELECT is public for the tenants bucket — Bob can list the avatar Alice uploaded above.
select is(
  (select count(*)::int from storage.objects where bucket_id = 'tenants' and name like '1/%'),
  1,
  'Bob can read tenants bucket (public SELECT)'
);

reset role;

select * from finish();
rollback;
