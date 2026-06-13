-- agent_action_claim mutex tests.
-- Verifies: first claim succeeds (claimed=true), second with same key returns claimed=false.
-- The new signature accepts the triggering inbound conversation_message_id directly.
-- Sequential within single transaction (pgTAP does not support parallel sessions).

begin;

select plan(7);

-- ============================================================
-- Setup: conversation_emit to create a real message for Alice,
-- then capture the conversation_message_id to pass to agent_action_claim.
-- ============================================================

create temp table _ac_ids (conversation_message_id uuid) on commit drop;

insert into _ac_ids (conversation_message_id)
select (e).out_conversation_message_id
from (select public.conversation_emit(
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'product-update'::extensions.citext,
  'Agent coordination test.'
) as e) sub;

-- ============================================================
-- First claim: should succeed (claimed=true, prior_status=null)
-- ============================================================

select ok(
  (
    select claimed
    from public.agent_action_claim(
      'idem-key-001',
      (select conversation_message_id from _ac_ids),
      '00000000-0000-0000-0000-00000000a11c'::uuid,
      null::int,
      'send_welcome_email',
      '{"template": "welcome"}'::jsonb
    )
  ),
  'first agent_action_claim with new key returns claimed=true'
);

-- ============================================================
-- Verify claim row exists in agent_action_log
-- ============================================================

select ok(
  (
    select count(*)::int >= 1
    from public.agent_action_log
    where action_idempotency_key = 'idem-key-001'
      and action_status = 'claiming'
  ),
  'agent_action_log row exists with status claiming after first claim'
);

-- ============================================================
-- Second claim with same key: should return claimed=false and prior_status='claiming'
-- ============================================================

select ok(
  not (
    select claimed
    from public.agent_action_claim(
      'idem-key-001',
      (select conversation_message_id from _ac_ids),
      '00000000-0000-0000-0000-00000000a11c'::uuid,
      null::int,
      'send_welcome_email',
      '{"template": "welcome"}'::jsonb
    )
  ),
  'second agent_action_claim with same key returns claimed=false'
);

select is(
  (
    select prior_status
    from public.agent_action_claim(
      'idem-key-001',
      (select conversation_message_id from _ac_ids),
      '00000000-0000-0000-0000-00000000a11c'::uuid,
      null::int,
      'send_welcome_email',
      '{"template": "welcome"}'::jsonb
    )
  ),
  'claiming',
  'repeated claim: prior_status reflects existing status'
);

-- ============================================================
-- Different key: should succeed independently
-- ============================================================

select ok(
  (
    select claimed
    from public.agent_action_claim(
      'idem-key-002',
      (select conversation_message_id from _ac_ids),
      '00000000-0000-0000-0000-00000000a11c'::uuid,
      null::int,
      'generate_report',
      '{}'::jsonb
    )
  ),
  'different idempotency key succeeds independently'
);

-- ============================================================
-- RLS: authenticated cannot read agent_action_log of another user
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
  'Bob cannot see Alice agent_action_log rows'
);

reset role;

-- ============================================================
-- Both claim keys exist in agent_action_log
-- ============================================================

select ok(
  (
    select count(distinct action_idempotency_key)::int >= 2
    from public.agent_action_log
    where action_idempotency_key in ('idem-key-001', 'idem-key-002')
  ),
  'both test idempotency keys are present in agent_action_log'
);

select * from finish();
rollback;
