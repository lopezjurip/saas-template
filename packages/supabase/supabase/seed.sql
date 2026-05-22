-- Local-dev seed. Not run in production.
-- Two tenants (acme + globex), each with one organization, and two users with crossed memberships:
--   alice@humane.test  -> owner @ acme org, accountant @ globex org
--   bob@humane.test    -> employee @ acme org
-- Passwords: "password123" for both.

-- ------------------------------------------------------------
-- auth.users (profiles are created by the users_handle_created trigger)
-- ------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000a11c',
    'authenticated', 'authenticated',
    'alice@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Alice Owner"}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000b00b',
    'authenticated', 'authenticated',
    'bob@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Bob Employee"}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-00000000a11c',
    '00000000-0000-0000-0000-00000000a11c',
    '{"sub":"00000000-0000-0000-0000-00000000a11c","email":"alice@humane.test"}'::jsonb,
    'email',
    current_timestamp, current_timestamp, current_timestamp
  ),
  (
    '00000000-0000-0000-0000-00000000b00b',
    '00000000-0000-0000-0000-00000000b00b',
    '{"sub":"00000000-0000-0000-0000-00000000b00b","email":"bob@humane.test"}'::jsonb,
    'email',
    current_timestamp, current_timestamp, current_timestamp
  )
on conflict (provider_id, provider) do nothing;

-- ------------------------------------------------------------
-- tenants (serial PKs — fixed for seed predictability)
-- ------------------------------------------------------------

insert into public.tenants (tenant_id, tenant_slug, tenant_name)
values
  (1, 'acme', 'Acme SpA'),
  (2, 'globex', 'Globex SA')
on conflict (tenant_id) do nothing;

select setval(pg_get_serial_sequence('public.tenants', 'tenant_id'), (select max(tenant_id) from public.tenants));

-- ------------------------------------------------------------
-- organizations — one default org per tenant, slug + name mirror the tenant
-- ------------------------------------------------------------

insert into public.organizations (organization_id, tenant_id, organization_slug, organization_name)
values
  (1, 1, 'acme', 'Acme SpA'),
  (2, 2, 'globex', 'Globex SA')
on conflict (organization_id) do nothing;

select setval(pg_get_serial_sequence('public.organizations', 'organization_id'), (select max(organization_id) from public.organizations));

-- ------------------------------------------------------------
-- organization_members
-- ------------------------------------------------------------

insert into public.organization_members (organization_id, profile_id, organization_member_role)
values
  (1, '00000000-0000-0000-0000-00000000a11c', 'owner'),
  (2, '00000000-0000-0000-0000-00000000a11c', 'accountant'),
  (1, '00000000-0000-0000-0000-00000000b00b', 'employee')
on conflict (organization_id, profile_id) do nothing;

-- Mark seed users as onboarded so manual end-to-end testing skips /onboarding.
update public.profiles
  set profile_onboarded_at = current_timestamp
  where profile_id in (
    '00000000-0000-0000-0000-00000000a11c',
    '00000000-0000-0000-0000-00000000b00b'
  );
