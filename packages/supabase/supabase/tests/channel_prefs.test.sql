-- profile_topic_channels RLS tests.
-- Each profile owns its own preference rows; other profiles cannot read or write them.

begin;

select plan(8);

-- ============================================================
-- Alice can manage her own channel preferences
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select lives_ok(
  $$ insert into public.profile_topic_channels (profile_id, conversation_topic_slug, message_channel, enabled)
     values ('00000000-0000-0000-0000-00000000a11c', 'security-alert', 'email', false) $$,
  'Alice can insert her own channel preference'
);

select is(
  (
    select enabled
    from public.profile_topic_channels
    where profile_id = '00000000-0000-0000-0000-00000000a11c'
      and conversation_topic_slug = 'security-alert'
      and message_channel = 'email'
  ),
  false,
  'Alice reads back her own preference'
);

select lives_ok(
  $$ update public.profile_topic_channels
     set enabled = true
     where profile_id = '00000000-0000-0000-0000-00000000a11c'
       and conversation_topic_slug = 'security-alert'
       and message_channel = 'email' $$,
  'Alice can update her own channel preference'
);

reset role;

-- ============================================================
-- Bob cannot read or write Alice preferences
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {}
}';

select is(
  (
    select count(*)::int
    from public.profile_topic_channels
    where profile_id = '00000000-0000-0000-0000-00000000a11c'
  ),
  0,
  'Bob cannot see Alice channel preferences'
);

select throws_ok(
  $$ insert into public.profile_topic_channels (profile_id, conversation_topic_slug, message_channel, enabled)
     values ('00000000-0000-0000-0000-00000000a11c', 'security-alert', 'sms', true) $$,
  '42501',
  null,
  'Bob cannot insert Alice channel preference'
);

-- UPDATE on Alice rows: RLS using clause hides her rows from Bob, so 0 rows affected (no exception).
-- Verify no rows were actually updated.
update public.profile_topic_channels
  set enabled = false
  where profile_id = '00000000-0000-0000-0000-00000000a11c';

select is(
  (
    select enabled
    from public.profile_topic_channels
    where profile_id = '00000000-0000-0000-0000-00000000a11c'
      and conversation_topic_slug = 'security-alert'
      and message_channel = 'email'
  ),
  null,
  'Bob update on Alice row had no effect (row not visible via RLS using clause)'
);

select lives_ok(
  $$ insert into public.profile_topic_channels (profile_id, conversation_topic_slug, message_channel, enabled)
     values ('00000000-0000-0000-0000-00000000b00b', 'weekly-activity', 'in_app', true) $$,
  'Bob can insert his own channel preference'
);

select is(
  (
    select count(*)::int
    from public.profile_topic_channels
    where profile_id = '00000000-0000-0000-0000-00000000b00b'
  ),
  1,
  'Bob sees only his own preferences'
);

reset role;

select * from finish();
rollback;
