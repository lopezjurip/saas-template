-- The internal.permission_preset_validate_slugs trigger rejects presets that reference
-- a permission slug not in public.permissions. This is the only safety net keeping
-- the preset catalog in sync with the permission catalog.

begin;

select plan(3);

-- ============================================================
-- Insert with all-valid slugs succeeds
-- ============================================================

select lives_ok(
  $$ insert into public.permission_presets (organization_id, permission_preset_name, permission_preset_slugs)
     values (null, 'Test Valid', array['members_manage', 'presets_manage']::extensions.citext[]) $$,
  'preset with known slugs is accepted'
);

-- ============================================================
-- Unknown slug must throw
-- ============================================================

select throws_ok(
  $$ insert into public.permission_presets (organization_id, permission_preset_name, permission_preset_slugs)
     values (null, 'Test Invalid', array['members_manage', 'totally_made_up']::extensions.citext[]) $$,
  'P0001',
  null,
  'preset with unknown slug raises exception'
);

-- ============================================================
-- UPDATE with unknown slug must also throw (trigger fires on UPDATE OF slugs)
-- ============================================================

-- Pick a seeded global preset and try to corrupt it with an unknown slug.
select throws_ok(
  $$ update public.permission_presets
     set permission_preset_slugs = array['members_manage', 'made_up_slug']::extensions.citext[]
     where permission_preset_name = 'Owner' and organization_id is null $$,
  'P0001',
  null,
  'updating slugs to include an unknown one also raises'
);

select * from finish();
rollback;
