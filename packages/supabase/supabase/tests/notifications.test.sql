-- conversation_topics catalog tests.
-- Verifies slug/priority constraints and RLS around the catalog table.
-- Replaces the former notifications.test.sql (profile_notifications removed).

begin;

select plan(8);

-- ============================================================
-- Catalog invariants
-- ============================================================

select lives_ok(
  $$ insert into public.conversation_topics (conversation_topic_slug, conversation_topic_name, conversation_topic_description)
     values ('test-topic', 'Test topic', 'A temporary topic type used by pgTAP.') $$,
  'valid conversation_topics row is accepted'
);

select is(
  (
    select conversation_topic_kind
    from public.conversation_topics
    where conversation_topic_slug = 'test-topic'
  )::text,
  'log',
  'topic kind defaults to log when omitted'
);

select is(
  (
    select conversation_topic_priority
    from public.conversation_topics
    where conversation_topic_slug = 'test-topic'
  )::text,
  'medium',
  'topic priority defaults to medium when omitted'
);

select throws_ok(
  $$ insert into public.conversation_topics (conversation_topic_slug, conversation_topic_name, conversation_topic_description)
     values ('bad slug', 'Bad slug', 'Slugs must pass internal.slug_validate()') $$,
  '23514',
  null,
  'invalid conversation_topic slug is rejected'
);

select throws_ok(
  $$ insert into public.conversation_topics (conversation_topic_slug, conversation_topic_name, conversation_topic_description, conversation_topic_priority)
     values ('bad-priority', 'Bad priority', 'Priority must be one of the enum values', 'super_high') $$,
  '22P02',
  null,
  'topic priority outside the enum is rejected'
);

select throws_ok(
  $$ insert into public.conversation_topics (conversation_topic_slug, conversation_topic_name, conversation_topic_description, conversation_topic_kind)
     values ('bad-kind', 'Bad kind', 'Kind must be one of the enum values', 'super_kind') $$,
  '22P02',
  null,
  'topic kind outside the enum is rejected'
);

-- ============================================================
-- RLS: authenticated can read active catalog, cannot write
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select ok(
  (
    select count(*) > 0
    from public.conversation_topics
    where conversation_topic_slug = 'security-alert'
  ),
  'authenticated user can read active catalog rows'
);

select throws_ok(
  $$ insert into public.conversation_topics (conversation_topic_slug, conversation_topic_name, conversation_topic_description)
     values ('user-inject', 'User inject', 'Should be blocked by RLS') $$,
  '42501',
  null,
  'authenticated cannot insert into conversation_topics'
);

reset role;

select * from finish();
rollback;
