-- Catalog + profile preference tests for the notifications system.
-- Verifies slug/priority constraints and RLS around per-profile preferences.

begin;

select plan(16);

-- ============================================================
-- Catalog invariants
-- ============================================================

select lives_ok(
  $$ insert into public.notifications (notification_slug, notification_name, notification_description)
     values ('test-notification', 'Test notification', 'A temporary notification type used by pgTAP.') $$,
  'valid notification catalog row is accepted'
);

select is(
  (
    select notification_kind
    from public.notifications
    where notification_slug = 'test-notification'
  )::text,
  'log',
  'notification kind defaults to log when omitted'
);

select is(
  (
    select notification_priority
    from public.notifications
    where notification_slug = 'test-notification'
  )::text,
  'medium',
  'notification priority defaults to medium when omitted'
);

select throws_ok(
  $$ insert into public.notifications (notification_slug, notification_name, notification_description, notification_priority)
     values ('bad slug', 'Bad slug', 'Slugs must pass internal.slug_validate()', 'high') $$,
  '23514',
  null,
  'invalid notification slug is rejected'
);

select throws_ok(
  $$ insert into public.notifications (notification_slug, notification_name, notification_description, notification_priority)
     values ('bad-priority', 'Bad priority', 'Priority must be one of the enum values', 'super_high') $$,
  '22P02',
  null,
  'notification priority outside the enum is rejected'
);

select throws_ok(
  $$ insert into public.notifications (notification_slug, notification_name, notification_description, notification_priority, notification_kind)
     values ('bad-kind', 'Bad kind', 'Kind must be one of the enum values', 'high', 'super_kind') $$,
  '22P02',
  null,
  'notification kind outside the enum is rejected'
);

-- ============================================================
-- Alice can manage only her own profile_notifications rows
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000a11c",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}, {"id": 2, "slug": "globex"}],
    "organizations": [{"id": 1}, {"id": 2}]
  }
}';

select lives_ok(
  $$ insert into public.profile_notifications (profile_id, notification_slug, profile_notification_enabled)
     values ('00000000-0000-0000-0000-00000000a11c', 'test-notification', false) $$,
  'Alice can create her own preference row'
);

select is(
  (
    select profile_notification_enabled
    from public.viewer_profile_notifications()
    where notification_slug = 'test-notification'
  ),
  false,
  'Alice sees her own override in the viewer_profile_notifications function'
);

select is(
  (
    select profile_notification_kind
    from public.viewer_profile_notifications()
    where notification_slug = 'test-notification'
  )::text,
  'log',
  'Alice inherits the catalog kind when she omits the preference kind'
);

select is(
  (
    select profile_notification_priority
    from public.viewer_profile_notifications()
    where notification_slug = 'test-notification'
  )::text,
  'medium',
  'Alice inherits the catalog priority when she omits the preference priority'
);

reset role;

-- ============================================================
-- Bob cannot read or write Alice's preference row, but can manage his own
-- ============================================================

set local role authenticated;
set local request.jwt.claims to '{
  "sub": "00000000-0000-0000-0000-00000000b00b",
  "app_metadata": {
    "tenants": [{"id": 1, "slug": "acme"}],
    "organizations": [{"id": 1}]
  }
}';

select is(
  (
    select count(*)
    from public.profile_notifications
    where profile_id = '00000000-0000-0000-0000-00000000a11c'
  ),
  0::bigint,
  'Bob cannot see Alice profile_notifications rows'
);

select throws_ok(
  $$ insert into public.profile_notifications (profile_id, notification_slug, profile_notification_enabled)
     values ('00000000-0000-0000-0000-00000000a11c', 'test-notification', true) $$,
  '42501',
  null,
  'Bob cannot write Alice preference rows'
);

select lives_ok(
  $$ insert into public.profile_notifications (profile_id, notification_slug, profile_notification_enabled)
     values ('00000000-0000-0000-0000-00000000b00b', 'test-notification', false) $$,
  'Bob can create his own preference row'
);

select is(
  (
    select profile_notification_enabled
    from public.viewer_profile_notifications()
    where notification_slug = 'test-notification'
  ),
  false,
  'Bob sees his own override in the viewer_profile_notifications function'
);

select is(
  (
    select profile_notification_kind
    from public.viewer_profile_notifications()
    where notification_slug = 'test-notification'
  )::text,
  'log',
  'Bob inherits the catalog kind when he omits the preference kind'
);

select is(
  (
    select profile_notification_priority
    from public.viewer_profile_notifications()
    where notification_slug = 'test-notification'
  )::text,
  'medium',
  'Bob inherits the catalog priority when he omits the preference priority'
);

reset role;

select * from finish();
rollback;
