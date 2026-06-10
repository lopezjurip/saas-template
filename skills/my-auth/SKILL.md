---
name: my-auth
description: Repository-specific Supabase Auth, JWT claim, OAuth, OTP, onboarding, and SimpleWebAuthn passkey patterns. Use for auth code in apps/platform or auth schema/config in packages/supabase.
---

# Auth

Use current code. Do not invent generic Supabase wrappers.

## Source map

- Clients/claims: `packages/supabase/src/client.{browser,server,middleware}.ts`, `metadata.ts`
- Routes/actions: `apps/platform/app/[locale]/auth/**`
- Passkeys: `apps/platform/lib/passkeys.{actions,client}.ts`
- Hook/schema: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Config/templates: `packages/supabase/supabase/config.toml`, `supabase/templates/*`
- Gate: `apps/platform/proxy.ts`

## Identity vs claims

Validated identity:

```ts
const user = await getSupabaseServerUser();
```

Cookie session/raw token:

```ts
const session = await getSupabaseServerSession();
```

Hook claims:

```ts
const metadata = await getSupabaseServerUserMetadata();
const tenant = metadata?.["tenants"]?.find((item) => item["slug"] === tenant_slug);
```

Never read hook claims from `auth.getUser()`. Claims exist only in access token. Current
`AppMetadataSchema`: `tenants: [{id, slug}]`, `organizations: [{id, tenant_id}]`,
`agencies: [{id}]`, `onboarded`.

## Token hook

`public.user_auth_hook(event jsonb)` reads `event->'claims'` and `event->>'user_id'`.
It includes only active/accepted memberships, active agencies, onboarding state. Permissions
stay DB-backed, not JWT-backed.

Hook config:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/user_auth_hook"
```

After tenant/membership/onboarding changes:

```ts
const refresh = await supabase.auth.refreshSession();
if (refresh.error) log.warn("session refresh failed", { error: refresh.error });
```

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

Not Supabase WebAuthn API. Uses `@simplewebauthn/browser` + server package.

Flow:

1. `actionCreatePasskeyChallenge`: authenticated, generate options, upsert challenge.
2. Browser `startRegistration({ optionsJSON })`.
3. `actionVerifyPasskeyRegistration`: consume challenge, cryptographically verify, insert credential.
4. Sign-in resolves profile by email, generates challenge, browser `startAuthentication`, verifies, then creates Supabase session through admin link + OTP verification.

Required:

```env
WEBAUTHN_RELYING_PARTY_ID=lvh.me
WEBAUTHN_RELYING_PARTY_NAME=SaaS Template
WEBAUTHN_RELYING_PARTY_ORIGIN=https://lvh.me:7003
```

Dev must use mkcert HTTPS. Credential spec literals such as `"public-key"` use `text` +
checks, never SQL enums containing hyphens.

## Rules

- Exported functions in `"use server"` files: `action*`.
- External payload fields: bracket access.
- Enumeration RPCs remain server-side when `AUTH_EXPOSE_ACCOUNT_EXISTENCE=true`.
- Service role only after caller validation; never expose key/client to browser.
- Onboarding is page UX, not proxy hard gate.
- Auth changes: run `pnpm test:db`; UI journeys: `pnpm test:e2e` with dev server.
