---
name: my-auth
description: Repository-specific Supabase Auth, JWT claim, OAuth, OTP, onboarding, and native Supabase passkey patterns. Use for auth code in apps/platform or auth schema/config in packages/supabase.
---

# Auth

Use current code. Do not invent generic Supabase wrappers.

## Source map

- Clients: `packages/supabase/src/client.{browser,server,middleware}.ts`, `metadata.ts`
- Routes/actions: `apps/platform/app/[locale]/auth/**`
- Passkeys: `apps/platform/lib/passkeys.client.ts`
- Hook/schema: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Config/templates: `packages/supabase/supabase/config.toml`, `supabase/templates/*`
- Gate: `apps/platform/proxy.ts`

## Identity

Validated identity:

```ts
const user = await getSupabaseServerUser();
```

Cookie session/raw token:

```ts
const session = await getSupabaseServerSession();
```

The JWT carries only `profile_id` (the `sub`/`auth.uid`). It no longer injects
`app_metadata.{tenants,organizations,agencies,onboarded}`. Resolve tenant/org/agency membership
from the DB, not from claims.

## Token hook

`public.user_auth_hook(event jsonb)` is now a pass-through: it returns the `event` unchanged and
injects no custom claims. Tenant/org/agency membership and onboarding state are resolved from the
DB on demand, and permissions stay DB-backed, not JWT-backed.

Hook config:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/user_auth_hook"
```

Because membership lives in the DB rather than the token, membership/onboarding changes take
effect without a JWT refresh. The viewer helpers
(`viewer_tenant_ids` / `viewer_tenant_validate` / `viewer_organization_ids` /
`viewer_organization_validate` / `viewer_agency_ids`) resolve membership directly from the DB and
are `security definer` to avoid RLS recursion — they are not JWT/claims-based.

## OAuth

Provider catalog lives in `auth/providers.ts`. Form posts provider + `next` to OAuth action.
Callback must use typed route context and same-origin resolver:

```ts
export async function GET(
  request: NextRequest,
  _ctx: RouteContext<"/[locale]/auth/callback">,
) {
  const { searchParams, origin } = new URL(request.url);
  const next = RESOLVE_AUTH_NEXT(searchParams.get("next"), origin);
  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(
    searchParams.get("code")!,
  );
  if (error) return NextResponse.redirect(`${origin}/[locale]/auth/error`);
  return NextResponse.redirect(next);
}
```

Never trust raw `next`; use `RESOLVE_AUTH_NEXT`.

## OTP

Email/phone forms call browser Supabase directly. Existing pattern:

```ts
await supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: true },
});
await supabase.auth.verifyOtp({ email, token, type: "email" });
await supabase.auth.refreshSession();
```

Email links route through `/[locale]/auth/confirm`; route validates allowed `EmailOtpType`,
calls `verifyOtp({ token_hash, type })`, then uses safe `next`.

## Passkeys

Native Supabase WebAuthn API (supabase-js ≥ 2.105). No custom tables — Supabase manages storage internally.

Config in `packages/supabase/supabase/config.toml`:

```toml
[auth.passkey]
enabled = true

[auth.webauthn]
rp_display_name = "SaaS Template"
rp_id = "lvh.me"
rp_origins = ["https://lvh.me:7003"]
```

Flow:

- **Register** (authenticated): `supabase.auth.registerPasskey()` — browser only.
- **Sign in** (discoverable, no email needed): `supabase.auth.signInWithPasskey()` — browser only.
- **List**: `supabase.auth.passkey.list()` — works server-side and client-side.
- **Delete**: `supabase.auth.passkey.delete({ passkeyId })` — browser, authenticated.
- **Rename**: `supabase.auth.passkey.update({ passkeyId, friendlyName })`.

Sign-in button appears at: auth root (`/auth`), email step, and phone step — always visible (discoverable credentials; no `has_passkey` check needed).

Dev must use mkcert HTTPS (same requirement as before — WebAuthn requires secure context).

## Identity validators

- `public.cl_rut_normalize` / `public.cl_rut_validate`: normalize and validate Chilean RUT.
- `internal.email_validate` / `internal.phone_validate`: back the `invite_email` / `invite_phone`
  CHECK constraints on `public.organization_memberships`.
- `internal.slug_reserved_validate`: rejects reserved slugs.

## Rules

- Exported functions in `"use server"` files: `action*`.
- External payload fields: bracket access.
- Enumeration RPCs remain server-side when `AUTH_EXPOSE_ACCOUNT_EXISTENCE=true`.
- Service role only after caller validation; never expose key/client to browser.
- Onboarding is page UX, not proxy hard gate.
- Auth changes: run `pnpm test:db`; UI journeys: `pnpm test:e2e` with dev server.
