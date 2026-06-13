-- conversation_message_deliveries: reply_token uniqueness, per-message/channel uniqueness,
-- and fan-out to external channels when the recipient has verified contacts.

begin;

select plan(12);

-- ============================================================
-- Setup: create a conversation + message via service_role, capture IDs.
-- Alice (a11c) has no verified contacts in seed data, so in_app only.
-- ============================================================

create temp table _test_emit (conversation_id uuid, conversation_message_id uuid) on commit drop;

insert into _test_emit
select (e).out_conversation_id, (e).out_conversation_message_id
from (select public.conversation_emit(
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'security-alert'::extensions.citext,
  'Delivery test message.'
) as e) sub;

-- ============================================================
-- Verify delivery row was created for in_app
-- ============================================================

select ok(
  (
    select count(*)::int >= 1
    from public.conversation_message_deliveries cmd
    join _test_emit e using (conversation_message_id)
    where cmd.message_channel = 'in_app'
      and cmd.delivery_status = 'queued'
  ),
  'conversation_emit creates an in_app delivery row with status queued'
);

-- in_app delivery has no reply_token.
select ok(
  (
    select reply_token is null
    from public.conversation_message_deliveries cmd
    join _test_emit e using (conversation_message_id)
    where cmd.message_channel = 'in_app'
  ),
  'in_app delivery has no reply_token'
);

-- No email delivery for Alice who has no verified contact.
select is(
  (
    select count(*)::int
    from public.conversation_message_deliveries cmd
    join _test_emit e using (conversation_message_id)
    where cmd.message_channel = 'email'
  ),
  0,
  'no email delivery row when recipient has no verified email contact'
);

-- ============================================================
-- Unique constraint: (conversation_message_id, message_channel)
-- ============================================================

select throws_ok(
  $$ insert into public.conversation_message_deliveries (
       conversation_message_id, message_channel
     )
     select conversation_message_id, 'in_app'
     from _test_emit $$,
  '23505',
  null,
  'duplicate (conversation_message_id, message_channel) is rejected'
);

-- ============================================================
-- reply_token uniqueness (manual insert on a different channel)
-- ============================================================

insert into public.conversation_message_deliveries (
  conversation_message_id, message_channel, reply_token
)
select conversation_message_id, 'email', 'token-abc-123'
from _test_emit;

select ok(
  (
    select count(*)::int = 1
    from public.conversation_message_deliveries
    where reply_token = 'token-abc-123'
  ),
  'reply_token is stored and retrievable'
);

select throws_ok(
  $$ insert into public.conversation_message_deliveries (
       conversation_message_id, message_channel, reply_token
     )
     select conversation_message_id, 'sms', 'token-abc-123'
     from _test_emit $$,
  '23505',
  null,
  'duplicate reply_token is rejected'
);

-- ============================================================
-- RLS: authenticated sees only own deliveries
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {}
}';

select is(
  (select count(*)::int from public.conversation_message_deliveries),
  0,
  'Bob cannot see Alice delivery rows'
);

reset role;

-- ============================================================
-- Fan-out test: emit to a recipient with a verified email contact.
-- We create a temporary auth user + profile + verified contact, then emit.
-- ============================================================

-- Insert a throwaway auth.users row (profiles are created by the trigger).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-f4400000e111'::uuid,
  'authenticated', 'authenticated',
  'fanout-test@humane.test',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Fan Out Tester"}'::jsonb,
  current_timestamp, current_timestamp,
  '', '', '', ''
)
on conflict (id) do nothing;

-- Insert a verified email contact for that profile.
insert into public.profile_contacts (
  profile_id, message_channel, contact_value, contact_verified_at
)
values (
  '00000000-0000-0000-0000-f4400000e111'::uuid,
  'email',
  'fanout-test@example.com',
  current_timestamp
)
on conflict do nothing;

create temp table _fan_emit (conversation_id uuid, conversation_message_id uuid) on commit drop;

insert into _fan_emit
select (e).out_conversation_id, (e).out_conversation_message_id
from (select public.conversation_emit(
  '00000000-0000-0000-0000-f4400000e111'::uuid,
  'security-alert'::extensions.citext,
  'Fan-out test message.'
) as e) sub;

-- in_app delivery always present.
select ok(
  (
    select count(*)::int = 1
    from public.conversation_message_deliveries cmd
    join _fan_emit e using (conversation_message_id)
    where cmd.message_channel = 'in_app'
  ),
  'fan-out emit: in_app delivery always present'
);

-- email delivery created because verified contact exists.
select ok(
  (
    select count(*)::int = 1
    from public.conversation_message_deliveries cmd
    join _fan_emit e using (conversation_message_id)
    where cmd.message_channel = 'email'
      and cmd.delivery_status = 'queued'
  ),
  'fan-out emit: email delivery created when verified contact exists'
);

-- email delivery has a non-null reply_token (48 hex chars = 24 bytes).
select ok(
  (
    select reply_token is not null
      and length(reply_token) = 48
    from public.conversation_message_deliveries cmd
    join _fan_emit e using (conversation_message_id)
    where cmd.message_channel = 'email'
  ),
  'fan-out emit: email delivery has a 48-char hex reply_token'
);

-- in_app delivery is NOT enqueued in pgmq (only external channels are).
-- The queue table is pgmq.q_conversation_outbound.
select is(
  (
    select count(*)::int
    from pgmq.q_conversation_outbound
    where (message->>'message_id')::uuid = (select conversation_message_id from _fan_emit)
      and message->>'channel' = 'in_app'
  ),
  0,
  'fan-out emit: in_app delivery is NOT enqueued in pgmq'
);

-- email delivery IS enqueued in pgmq.
select ok(
  (
    select count(*)::int >= 1
    from pgmq.q_conversation_outbound
    where (message->>'message_id')::uuid = (select conversation_message_id from _fan_emit)
      and message->>'channel' = 'email'
  ),
  'fan-out emit: email delivery is enqueued in pgmq conversation_outbound'
);

select * from finish();
rollback;
