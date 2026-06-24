-- conversation_scopes.test.sql
-- Verifies that viewer_conversations_collection() and viewer_unread_count() correctly filter
-- by p_scope: 'personal', 'organization', 'agency', and legacy null (all).
--
-- Seed: Alice (00000000-0000-0000-0000-00000000a11c) gets three conversations:
--   1. org-scoped    (organization_id = 1, agency_id IS NULL)
--   2. agency-scoped (organization_id IS NULL, agency_id = 'a0000000-…')
--   3. personal      (organization_id IS NULL, agency_id IS NULL)
-- Each has one unread outbound message so viewer_unread_count can be asserted per scope.

begin;

select plan(16);

-- ============================================================
-- Setup: insert three scoped conversations + one message each (as service_role)
-- ============================================================

-- temp table to hold the three conversation ids.
create temp table _scope_convs (
  scope       text primary key,
  conv_id     uuid not null
) on commit drop;
grant select on _scope_convs to authenticated;

-- Org-scoped conversation (organization 1 = acme, tenant 1).
with org_conv as (
  insert into public.conversations (
    profile_id, tenant_id, organization_id, agency_id, conversation_kind
  )
  values (
    '00000000-0000-0000-0000-00000000a11c'::uuid,
    1,
    1,
    null,
    'notification'
  )
  returning conversation_id
)
insert into _scope_convs (scope, conv_id)
select 'organization', conversation_id from org_conv;

-- Agency-scoped conversation (no org, no tenant).
with agency_conv as (
  insert into public.conversations (
    profile_id, tenant_id, organization_id, agency_id, conversation_kind
  )
  values (
    '00000000-0000-0000-0000-00000000a11c'::uuid,
    null,
    null,
    1,
    'notification'
  )
  returning conversation_id
)
insert into _scope_convs (scope, conv_id)
select 'agency', conversation_id from agency_conv;

-- Personal conversation (both org and agency null).
with personal_conv as (
  insert into public.conversations (
    profile_id, tenant_id, organization_id, agency_id, conversation_kind
  )
  values (
    '00000000-0000-0000-0000-00000000a11c'::uuid,
    null,
    null,
    null,
    'notification'
  )
  returning conversation_id
)
insert into _scope_convs (scope, conv_id)
select 'personal', conversation_id from personal_conv;

-- Insert one unread outbound message per conversation so unread_count yields 1 each.
insert into public.conversation_messages (
  conversation_id, message_author, message_direction, message_body, message_read_at
)
select conv_id, 'system', 'outbound', 'Scope test message', null
from _scope_convs;

-- ============================================================
-- Authenticate as Alice
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {}
}';

-- ============================================================
-- viewer_conversations_collection — scope = 'personal'
-- ============================================================

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, null, null, 'personal')
    where conversation_id = (select conv_id from _scope_convs where scope = 'personal')
  ),
  1,
  'viewer_conversations_collection personal scope returns the personal conversation'
);

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, null, null, 'personal')
    where conversation_id = (select conv_id from _scope_convs where scope = 'organization')
  ),
  0,
  'viewer_conversations_collection personal scope excludes org-scoped conversation'
);

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, null, null, 'personal')
    where conversation_id = (select conv_id from _scope_convs where scope = 'agency')
  ),
  0,
  'viewer_conversations_collection personal scope excludes agency-scoped conversation'
);

-- ============================================================
-- viewer_conversations_collection — scope = 'organization'
-- ============================================================

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, 1, null, 'organization')
    where conversation_id = (select conv_id from _scope_convs where scope = 'organization')
  ),
  1,
  'viewer_conversations_collection organization scope returns the org conversation'
);

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, 1, null, 'organization')
    where conversation_id = (select conv_id from _scope_convs where scope = 'personal')
  ),
  0,
  'viewer_conversations_collection organization scope excludes personal conversation'
);

-- Wrong org id returns nothing.
select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, 9999, null, 'organization')
    where conversation_id = (select conv_id from _scope_convs where scope = 'organization')
  ),
  0,
  'viewer_conversations_collection organization scope with foreign org_id returns nothing'
);

-- ============================================================
-- viewer_conversations_collection — scope = 'agency'
-- ============================================================

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, null, 1, 'agency')
    where conversation_id = (select conv_id from _scope_convs where scope = 'agency')
  ),
  1,
  'viewer_conversations_collection agency scope returns the agency conversation'
);

select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, null, 1, 'agency')
    where conversation_id = (select conv_id from _scope_convs where scope = 'personal')
  ),
  0,
  'viewer_conversations_collection agency scope excludes personal conversation'
);

-- Wrong agency id returns nothing.
select is(
  (
    select count(*)::int
    from public.viewer_conversations_collection(false, null, 999999, 'agency')
    where conversation_id = (select conv_id from _scope_convs where scope = 'agency')
  ),
  0,
  'viewer_conversations_collection agency scope with foreign agency_id returns nothing'
);

-- ============================================================
-- viewer_conversations_collection — scope = null (legacy: all three visible)
-- ============================================================

select ok(
  (
    select count(*)::int
    from public.viewer_conversations_collection()
  ) >= 3,
  'viewer_conversations_collection with null scope (legacy) returns all scoped conversations'
);

-- ============================================================
-- viewer_unread_count — per scope
-- ============================================================

select is(
  public.viewer_unread_count(null, null, 'personal'),
  1,
  'viewer_unread_count personal scope returns 1 (one unread personal message)'
);

select is(
  public.viewer_unread_count(1, null, 'organization'),
  1,
  'viewer_unread_count organization scope returns 1 (one unread org message)'
);

select is(
  public.viewer_unread_count(null, 1, 'agency'),
  1,
  'viewer_unread_count agency scope returns 1 (one unread agency message)'
);

-- Wrong foreign org_id → 0 unread.
select is(
  public.viewer_unread_count(9999, null, 'organization'),
  0,
  'viewer_unread_count organization scope with foreign org_id returns 0'
);

-- Legacy null scope → all three unread messages visible (>= 3).
select ok(
  public.viewer_unread_count() >= 3,
  'viewer_unread_count with null scope (legacy) returns all unread messages'
);

-- Wrong foreign agency_id → 0 unread.
select is(
  public.viewer_unread_count(null, 999999, 'agency'),
  0,
  'viewer_unread_count agency scope with foreign agency_id returns 0'
);

reset role;

select * from finish();
rollback;
