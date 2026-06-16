-- RLS for the `agencies` storage bucket.
--
-- Convention: bucket name === table name; path_tokens[1] === agency_id (int).
-- Write requires an ACCEPTED agency membership (viewer_agency_ids). Agencies have no granular
-- permission catalog — membership is the gate. The int cast is guarded by a numeric regex.
--
-- Seed (agency id 1, "Demo Auditores"):
--   carol (…ca401): accepted member → may write
--   alice (…a11c):  PENDING membership (accepted_at is null) → may NOT write
--   bob   (…b00b):  not a member → may NOT write

begin;

select plan(4);

-- ============================================================
-- Carol — accepted member, can manage the agency logo.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-0000000ca401"}';

select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('agencies', '1/avatar/01.png', '00000000-0000-0000-0000-0000000ca401') $$,
  'Accepted agency member can upload to agencies/<id>/avatar/'
);

prepare carol_writes_non_avatar as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('agencies', '1/banner/01.png', '00000000-0000-0000-0000-0000000ca401');

select throws_ok(
  'execute carol_writes_non_avatar',
  '42501',
  null,
  'Only the avatar/ subfolder is writable'
);

deallocate carol_writes_non_avatar;

reset role;

-- ============================================================
-- Alice — membership is pending (not accepted) → denied.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000a11c"}';

prepare alice_writes as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('agencies', '1/avatar/02.png', '00000000-0000-0000-0000-00000000a11c');

select throws_ok(
  'execute alice_writes',
  '42501',
  null,
  'A pending (not accepted) agency membership cannot upload'
);

deallocate alice_writes;

reset role;

-- ============================================================
-- Bob — not an agency member → denied.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-0000-0000-00000000b00b"}';

prepare bob_writes as
  insert into storage.objects (bucket_id, name, owner_id)
  values ('agencies', '1/avatar/03.png', '00000000-0000-0000-0000-00000000b00b');

select throws_ok(
  'execute bob_writes',
  '42501',
  null,
  'A non-member cannot upload an agency logo'
);

deallocate bob_writes;

reset role;

select * from finish();
rollback;
