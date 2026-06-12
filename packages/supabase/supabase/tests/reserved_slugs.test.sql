-- public.reserved_slugs table + internal.slug_reserved_validate function
-- Validates that reserved slugs are blocked at the CHECK on public.tenants.tenant_slug.

begin;

select plan(8);

-- ============================================================
-- 1. slug_reserved_validate function semantics
-- ============================================================

select is(internal.slug_reserved_validate('acme'), true, 'normal slug "acme" is allowed');
select is(internal.slug_reserved_validate('my-company-2026'), true, 'kebab-case multiword slug is allowed');

-- Seeded reserved slugs are rejected.
select is(internal.slug_reserved_validate('admin'), false, 'reserved "admin" is rejected');
select is(internal.slug_reserved_validate('en'), false, 'reserved locale "en" is rejected');
select is(internal.slug_reserved_validate('home'), false, 'reserved "home" is rejected');

-- Malformed slugs (regex fail) are also rejected.
select is(internal.slug_reserved_validate('UPPERCASE'), false, 'uppercase slug is rejected (slug_validate)');
select is(internal.slug_reserved_validate('two words'), false, 'whitespace slug is rejected (slug_validate)');

-- ============================================================
-- 2. tenants CHECK constraint actually fires
-- ============================================================

prepare insert_reserved as
  insert into public.tenants (tenant_slug, tenant_name) values ('admin', 'Reserved Test');

select throws_ok(
  'execute insert_reserved',
  '23514',  -- check_violation
  null,
  'insert with reserved slug fails the check'
);

deallocate insert_reserved;

select * from finish();
rollback;
