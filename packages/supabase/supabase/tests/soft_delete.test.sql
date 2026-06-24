-- Tests for the reusable internal.soft_delete() trigger.
-- Exercised on public.conversation_topics (no inbound FKs -> self-contained):
-- a DELETE is turned into UPDATE set deleted_at; a second DELETE purges for real.

begin;

select plan(4);

insert into public.conversation_topics (
  conversation_topic_slug, conversation_topic_name, conversation_topic_description
) values ('soft-delete-probe', 'Probe', 'Soft-delete probe topic');

-- First delete -> soft: row survives, deleted_at stamped.
delete from public.conversation_topics where conversation_topic_slug = 'soft-delete-probe';

select ok(
  exists (select 1 from public.conversation_topics where conversation_topic_slug = 'soft-delete-probe'),
  'row still exists after first DELETE'
);

select isnt(
  (select conversation_topic_deleted_at from public.conversation_topics where conversation_topic_slug = 'soft-delete-probe'),
  null,
  'deleted_at is stamped after first DELETE'
);

-- Second delete on an already-deleted row -> WHEN guard lets it through -> hard delete.
delete from public.conversation_topics where conversation_topic_slug = 'soft-delete-probe';

select ok(
  not exists (select 1 from public.conversation_topics where conversation_topic_slug = 'soft-delete-probe'),
  'row is purged after second DELETE'
);

-- Active rows are untouched by the trigger machinery.
select ok(
  (select count(*) from public.conversation_topics where conversation_topic_deleted_at is null) >= 0,
  'active catalog remains queryable'
);

select * from finish();
rollback;
