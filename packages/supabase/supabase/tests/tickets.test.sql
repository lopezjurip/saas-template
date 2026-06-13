-- Tickets: RLS via agency grant, claim mutex, resolve cascade, non-granted user blocked.
-- Uses seed data:
--   Alice (a11c)  = acme org member (org 1, tenant 1)
--   Iris  (ca401) = accepted agency affiliate of Demo Auditores → wildcard grant on acme org 1
--   Bob   (b00b)  = acme org member, no agency affiliation

begin;

select plan(17);

-- ============================================================
-- Setup: emit a conversation for Alice with org 1, capture the IDs
-- ============================================================

create temp table _t_ids (conversation_id uuid not null, ticket_id uuid) on commit drop;
grant select, insert, update on _t_ids to authenticated;

insert into _t_ids (conversation_id)
select (e).out_conversation_id
from (select public.conversation_emit(
  '00000000-0000-0000-0000-00000000a11c'::uuid,
  'billing-change'::extensions.citext,
  'Your subscription was renewed.',
  '{}'::jsonb,
  'Billing notice'::text,
  1::int   -- organization_id = acme (tenant_id resolved to 1 inside function)
) as e) sub;

-- Alice escalates the conversation to a ticket.
set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

select lives_ok(
  $$ update _t_ids
     set ticket_id = public.ticket_escalate(
       conversation_id,
       'Help with billing question',
       'medium'::public.notification_priority
     ) $$,
  'Alice can escalate her conversation to a ticket'
);

select ok(
  (select count(*)::int >= 1 from public.tickets t join _t_ids i on i.ticket_id = t.ticket_id),
  'ticket exists after escalation'
);

select is(
  (select ticket_status::text from public.tickets t join _t_ids i on i.ticket_id = t.ticket_id),
  'open',
  'ticket status is open after escalation'
);

-- Idempotent: second escalate returns the same ticket_id.
select ok(
  (
    select public.ticket_escalate(
      (select conversation_id from _t_ids limit 1),
      'Help with billing question',
      'medium'::public.notification_priority
    ) = (select ticket_id from _t_ids limit 1)
  ),
  'escalate is idempotent: returns same ticket_id on second call'
);

-- Alice can see her own ticket via RLS (owner check).
select ok(
  (select count(*)::int >= 1 from public.tickets),
  'Alice sees at least one ticket (her own)'
);

reset role;

-- ============================================================
-- Bob (no agency grant) cannot see the ticket
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {}
}';

select is(
  (
    select count(*)::int
    from public.tickets t
    join _t_ids i on i.ticket_id = t.ticket_id
  ),
  0,
  'Bob (no agency grant) cannot see Alice ticket'
);

reset role;

-- ============================================================
-- Iris (accepted agency affiliate, * grant on org 1) can see ticket
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-0000000ca401",
  "app_metadata": {}
}';

select ok(
  (
    select count(*)::int >= 1
    from public.tickets t
    join _t_ids i on i.ticket_id = t.ticket_id
  ),
  'Iris (agency affiliate with * grant) can see tickets for acme org'
);

-- ============================================================
-- ticket_claim: Iris can claim the ticket
-- ============================================================

select lives_ok(
  $$ select public.ticket_claim(
       (select ticket_id from _t_ids limit 1)
     ) $$,
  'Iris can claim an open ticket'
);

select is(
  (select ticket_status::text from public.tickets t join _t_ids i on i.ticket_id = t.ticket_id),
  'claimed',
  'ticket status is claimed after claim'
);

select is(
  (select assigned_profile_id from public.tickets t join _t_ids i on i.ticket_id = t.ticket_id),
  '00000000-0000-0000-0000-0000000ca401'::uuid,
  'ticket is assigned to Iris after claim'
);

-- assigned_agency_id is set to the granting agency (not null).
select ok(
  (select assigned_agency_id is not null from public.tickets t join _t_ids i on i.ticket_id = t.ticket_id),
  'ticket assigned_agency_id is set (not null) after claim'
);

-- ============================================================
-- ticket_claim mutex: second claim raises ticket_already_claimed
-- ============================================================

select throws_ok(
  $$ select public.ticket_claim(
       (select ticket_id from _t_ids limit 1)
     ) $$,
  'P0001',
  'ticket_already_claimed',
  'second ticket_claim raises ticket_already_claimed'
);

-- ============================================================
-- ticket_resolve: Iris resolves the ticket
-- ============================================================

select lives_ok(
  $$ select public.ticket_resolve(
       (select ticket_id from _t_ids limit 1),
       '{"note": "Issue resolved via billing portal."}'::jsonb
     ) $$,
  'Iris can resolve the ticket'
);

select is(
  (select ticket_status::text from public.tickets t join _t_ids i on i.ticket_id = t.ticket_id),
  'resolved',
  'ticket status is resolved after resolve'
);

reset role;

-- Check conversation resolved (service_role — no RLS restriction).
select is(
  (
    select c.conversation_status
    from public.conversations c
    join _t_ids i on i.conversation_id = c.conversation_id
  ),
  'resolved',
  'conversation is resolved after ticket_resolve (cascade)'
);

-- ============================================================
-- ticket_resolve: already-resolved raises ticket_already_resolved
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-0000000ca401",
  "app_metadata": {}
}';

select throws_ok(
  $$ select public.ticket_resolve(
       (select ticket_id from _t_ids limit 1)
     ) $$,
  'P0001',
  'ticket_already_resolved',
  'ticket_resolve raises ticket_already_resolved when ticket is already resolved'
);

reset role;

-- ============================================================
-- Non-agency user (Bob) cannot claim tickets (reset to open first)
-- ============================================================

update public.tickets
  set ticket_status = 'open', assigned_profile_id = null, ticket_claimed_at = null
  where ticket_id = (select ticket_id from _t_ids limit 1);

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {}
}';

select throws_ok(
  $$ select public.ticket_claim(
       (select ticket_id from _t_ids limit 1)
     ) $$,
  'P0001',
  null,
  'Bob (no agency grant) cannot claim a ticket'
);

reset role;

select * from finish();
rollback;
