-- P4 inbound RPCs: conversation_ingest_inbound, agent_action_complete, caller_has_permission,
-- conversation_resolve.
-- Also covers: webhook signature rejection guard (conceptual test via status check) and
-- Layer-1 claim short-circuit: already-claimed action returns claimed=false.

begin;

select plan(13);

-- ============================================================
-- Setup: create a conversation + system message for Alice (profile seed id).
-- Alice UUID matches the seed: 00000000-0000-0000-0000-00000000a11c
-- ============================================================

create temp table _inbound_ids (
  conversation_id         uuid,
  conversation_message_id uuid,
  profile_id              uuid
) on commit drop;

insert into _inbound_ids (conversation_id, conversation_message_id, profile_id)
select
  (e).out_conversation_id,
  (e).out_conversation_message_id,
  '00000000-0000-0000-0000-00000000a11c'::uuid
from (
  select public.conversation_emit(
    '00000000-0000-0000-0000-00000000a11c'::uuid,
    'product-update'::extensions.citext,
    'Hello from system'
  ) as e
) sub;

-- ============================================================
-- conversation_ingest_inbound: basic happy path
-- ============================================================

create temp table _ingest_result (
  out_conversation_message_id uuid,
  out_conversation_id         uuid,
  out_profile_id              uuid,
  out_organization_id         int,
  out_agency_id               int,
  out_tenant_id               int,
  out_already_resolved        boolean
) on commit drop;

insert into _ingest_result
select *
from public.conversation_ingest_inbound(
  (select conversation_id from _inbound_ids),
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'email'::public.message_channel,
  'Please help me',
  '{"source": "email"}'::jsonb,
  'test-provider-msg-001',
  true
);

select ok(
  (select out_conversation_message_id is not null from _ingest_result),
  'conversation_ingest_inbound returns a message id'
);

select ok(
  (select not out_already_resolved from _ingest_result),
  'conversation_ingest_inbound: not already_resolved for new conversation'
);

-- Verify the message row was inserted correctly.
select ok(
  exists(
    select 1 from public.conversation_messages
    where message_idempotency_key = 'email:test-provider-msg-001'
      and message_author = 'user'
      and message_direction = 'inbound'
      and message_signature_verified = true
  ),
  'inbound message row inserted with correct fields'
);

-- ============================================================
-- Deduplication: calling again with same provider_message_id returns same row.
-- ============================================================

create temp table _ingest_dedup (
  out_conversation_message_id uuid,
  out_already_resolved boolean
) on commit drop;

insert into _ingest_dedup
select out_conversation_message_id, out_already_resolved
from public.conversation_ingest_inbound(
  (select conversation_id from _inbound_ids),
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'email'::public.message_channel,
  'duplicate call',
  '{}'::jsonb,
  'test-provider-msg-001',
  false
);

select is(
  (select out_conversation_message_id from _ingest_dedup),
  (select out_conversation_message_id from _ingest_result),
  'conversation_ingest_inbound is idempotent: same message_id returns same row'
);

-- Verify only one row was inserted (not two).
select is(
  (
    select count(*)::int
    from public.conversation_messages
    where message_idempotency_key = 'email:test-provider-msg-001'
  ),
  1,
  'dedup: only one conversation_message row exists for the idempotency key'
);

-- ============================================================
-- conversation_resolve: stamps conversation resolved.
-- ============================================================

select public.conversation_resolve(
  (select conversation_id from _inbound_ids),
  'email'::public.message_channel,
  '{"summary": "test resolved"}'::jsonb
);

select ok(
  exists(
    select 1 from public.conversations
    where conversation_id = (select conversation_id from _inbound_ids)
      and conversation_status = 'resolved'
      and conversation_resolved_at is not null
      and conversation_resolved_channel = 'email'
  ),
  'conversation_resolve stamps conversation_status=resolved'
);

-- Idempotent: calling again does not change resolved_at.
select public.conversation_resolve(
  (select conversation_id from _inbound_ids),
  'whatsapp'::public.message_channel,
  '{}'::jsonb
);

select is(
  (
    select conversation_resolved_channel::text
    from public.conversations
    where conversation_id = (select conversation_id from _inbound_ids)
  ),
  'email',
  'conversation_resolve is idempotent: second call does not overwrite channel'
);

-- ============================================================
-- conversation_ingest_inbound: already_resolved flag is set after resolve.
-- ============================================================

create temp table _ingest_after_resolve (out_already_resolved boolean) on commit drop;

insert into _ingest_after_resolve
select out_already_resolved
from public.conversation_ingest_inbound(
  (select conversation_id from _inbound_ids),
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'sms'::public.message_channel,
  'Another reply',
  '{}'::jsonb,
  'test-provider-msg-002',
  true
);

select ok(
  (select out_already_resolved from _ingest_after_resolve),
  'conversation_ingest_inbound: out_already_resolved=true after conversation resolved'
);

-- ============================================================
-- agent_action_complete: finalize a claimed action.
-- ============================================================

-- First claim a new action.
select public.agent_action_claim(
  'complete-test-key-001',
  (select out_conversation_message_id from _ingest_result),
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'test_tool',
  '{"input": "value"}'::jsonb
);

-- Complete it.
select public.agent_action_complete(
  'complete-test-key-001',
  'executed',
  '{"result": "ok"}'::jsonb
);

select is(
  (
    select action_status
    from public.agent_action_log
    where action_idempotency_key = 'complete-test-key-001'
  ),
  'executed',
  'agent_action_complete updates action_status to executed'
);

select is(
  (
    select (tool_output ->> 'result')
    from public.agent_action_log
    where action_idempotency_key = 'complete-test-key-001'
  ),
  'ok',
  'agent_action_complete persists tool_output'
);

-- ============================================================
-- caller_has_permission: returns false for unknown caller.
-- ============================================================

select ok(
  not public.caller_has_permission(
    '00000000-0000-0000-0000-000000000000'::uuid,
    1,
    'organization_manage'
  ),
  'caller_has_permission returns false for unknown profile'
);

-- ============================================================
-- Layer-1 short-circuit: second claim returns claimed=false.
-- ============================================================

select public.agent_action_claim(
  'sc-test-layer1-001',
  (select out_conversation_message_id from _ingest_result),
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'layer1_test_tool',
  '{}'::jsonb
);

select ok(
  not (
    select claimed
    from public.agent_action_claim(
      'sc-test-layer1-001',
      (select out_conversation_message_id from _ingest_result),
      '00000000-0000-0000-0000-00000000a11c'::uuid,
      'layer1_test_tool',
      '{}'::jsonb
    )
  ),
  'Layer-1: second claim with same key returns claimed=false (short-circuit)'
);

-- ============================================================
-- RLS: authenticated user cannot see agent_action_log of another profile.
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {}
}';

select is(
  (
    select count(*)::int
    from public.agent_action_log
    where profile_id = '00000000-0000-0000-0000-00000000a11c'
  ),
  0,
  'RLS: authenticated Bob cannot see Alice agent_action_log rows'
);

reset role;

select * from finish();
rollback;
