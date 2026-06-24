-- Conversations system: RLS, conversation_emit, mark-read, archive, last_message_at trigger.

begin;

select plan(19);

-- ============================================================
-- Setup: emit a conversation for Alice, capture the IDs
-- ============================================================

create temp table _c_ids (conversation_id uuid not null, message_id uuid) on commit drop;
grant select, insert, update on _c_ids to authenticated;

insert into _c_ids (conversation_id, message_id)
select (e).out_conversation_id, (e).out_conversation_message_id
from (select public.conversation_emit(
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'security-alert'::extensions.citext,
  'Your account was accessed from a new device.',
  '{}'::jsonb,
  'Security alert'::text
) as e) sub;

select ok(
  (select conversation_id is not null from _c_ids limit 1),
  'conversation_emit returns a valid conversation_id'
);

select throws_ok(
  $$ select public.conversation_emit(
       '00000000-0000-0000-0000-00000000a11c'::uuid,
       'nonexistent-topic'::extensions.citext
     ) $$,
  'P0001',
  'conversation_topic_not_found',
  'conversation_emit raises conversation_topic_not_found for unknown slug'
);

-- ============================================================
-- RLS: Alice sees her conversation; Bob does not
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select ok(
  (
    select count(*)::int >= 1
    from public.conversations
    where conversation_id = (select conversation_id from _c_ids)
  ),
  'Alice sees her own conversation'
);

select ok(
  (
    select count(*)::int >= 1
    from public.conversation_messages
    where conversation_id = (select conversation_id from _c_ids)
  ),
  'Alice sees messages in her conversation'
);

reset role;

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {}
}';

select is(
  (
    select count(*)::int
    from public.conversations
    where conversation_id = (select conversation_id from _c_ids)
  ),
  0,
  'Bob cannot see Alice conversation'
);

select is(
  (
    select count(*)::int
    from public.conversation_messages
    where conversation_id = (select conversation_id from _c_ids)
  ),
  0,
  'Bob sees no messages from Alice conversation'
);

reset role;

-- ============================================================
-- viewer_conversations_collection / viewer_conversation_messages_collection / viewer_unread_count
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select ok(
  (
    select count(*)::int >= 1
    from public.viewer_conversations_collection()
    where conversation_id = (select conversation_id from _c_ids)
  ),
  'viewer_conversations_collection includes Alice test conversation'
);

select ok(
  (
    select count(*)::int >= 1
    from public.viewer_conversation_messages_collection(
      (select conversation_id from _c_ids)
    )
  ),
  'viewer_conversation_messages_collection returns thread messages for owned conversation'
);

select ok(
  (select public.viewer_unread_count() >= 0),
  'viewer_unread_count returns a non-negative integer'
);

reset role;

-- ============================================================
-- conversation_mark_read
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select ok(
  (
    select public.conversation_mark_read(
      array[(select message_id from _c_ids)]
    ) >= 0
  ),
  'conversation_mark_read returns count >= 0'
);

select is(
  (
    select count(*)::int
    from public.conversation_messages
    where conversation_message_id = (select message_id from _c_ids)
      and message_read_at is null
  ),
  0,
  'message is marked read after conversation_mark_read'
);

reset role;

-- ============================================================
-- last_message_at trigger: fires on new message insert
-- ============================================================

-- Insert a second message with a future timestamp to guarantee last_message_at advances.
insert into public.conversation_messages (
  conversation_id, message_author, message_direction, message_body, message_created_at
)
select conversation_id, 'system', 'outbound', 'Trigger test message',
       now() + interval '1 second'
from _c_ids;

select ok(
  (
    select c.conversation_last_message_at >= (
      select max(cm.message_created_at)
      from public.conversation_messages cm
      where cm.conversation_id = c.conversation_id
    )
    from public.conversations c
    where c.conversation_id = (select conversation_id from _c_ids)
  ),
  'last_message_at is >= latest message_created_at after trigger fires'
);

-- ============================================================
-- conversation_archive
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select lives_ok(
  $$ select public.conversation_archive(
       (select conversation_id from _c_ids)
     ) $$,
  'conversation_archive succeeds for own conversation'
);

select is(
  (
    select conversation_status
    from public.conversations
    where conversation_id = (select conversation_id from _c_ids)
  ),
  'archived',
  'conversation_status is archived after archive'
);

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection()
    where conversation_id = (select conversation_id from _c_ids)
  ),
  0,
  'viewer_conversations_collection excludes archived test conversation by default'
);

select ok(
  (
    select count(*)::int >= 1
    from public.viewer_conversations_collection(true)
    where conversation_id = (select conversation_id from _c_ids)
  ),
  'viewer_conversations_collection includes archived when include_archived = true'
);

reset role;

-- ============================================================
-- Bob cannot post to Alice conversation
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {}
}';

select throws_ok(
  $$ select public.conversation_post_user_message(
       (select conversation_id from _c_ids),
       'Injected by Bob'
     ) $$,
  'P0001',
  'conversation_not_found',
  'Bob cannot post to Alice conversation'
);

reset role;

-- ============================================================
-- conversation_post_user_message: Alice can reply to own conversation
-- ============================================================

-- Unarchive Alice test conversation first (via service_role).
update public.conversations
  set conversation_status = 'open'
  where conversation_id = (select conversation_id from _c_ids);

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select lives_ok(
  $$ select public.conversation_post_user_message(
       (select conversation_id from _c_ids),
       'Hello, I have a question about my account.'
     ) $$,
  'Alice can post a user message to her own conversation'
);

reset role;

-- ============================================================
-- conversation_archive: non-owned raises conversation_not_found
-- ============================================================

-- Emit a conversation for Bob to use as a non-owned target.
create temp table _c_bob (conversation_id uuid) on commit drop;
grant select on _c_bob to authenticated;
insert into _c_bob (conversation_id)
select (e).out_conversation_id
from (select public.conversation_emit(
  '00000000-0000-0000-0000-00000000b00b'::uuid,
  'security-alert'::extensions.citext,
  'Bob notification'
) as e) sub;

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select throws_ok(
  $$ select public.conversation_archive(
       (select conversation_id from _c_bob)
     ) $$,
  'P0001',
  'conversation_not_found',
  'conversation_archive raises conversation_not_found for non-owned conversation'
);

reset role;

select * from finish();
rollback;
