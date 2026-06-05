---
name: my-auth
description: Supabase Auth patterns, session handling, JWT claims, WebAuthn passkeys, and OAuth flows.
---

# Supabase Auth Patterns

## Session & JWT Claims

**Always decode JWT directly** — `auth.getUser()` returns persisted record without hook claims.

```typescript
import { jwtDecode } from "jwt-decode";

export function getSupabaseServerUserMetadata() {
  const session = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const decoded = jwtDecode<{
    sub: string;
    email: string;
    app_metadata: {
      tenants: Array<{ id: number; slug: string }>;
      organizations: number[];
      is_concierge: boolean;
      onboarded: boolean;
    };
  }>(session.access_token);

  return decoded.app_metadata;
}
```

JWT carries:
- `app_metadata.tenants` — list of accessible tenants
- `app_metadata.organizations` — org memberships
- `app_metadata.is_concierge` — internal admin role
- `app_metadata.onboarded` — onboarding gate

## Auth Hook (Token Issuance)

Supabase runs `public.user_auth_hook()` on every token refresh:

```sql
CREATE FUNCTION public.user_auth_hook(event jsonb) RETURNS jsonb AS $$
DECLARE
  _tenant_ids jsonb;
  _org_ids jsonb;
  _user_id BIGINT;
  _claims jsonb;
BEGIN
  -- Extract user from event
  _user_id := (event->'user'->>'id')::BIGINT;

  -- Fetch tenant list (distinct tenants user has org membership in)
  SELECT jsonb_agg(
    jsonb_build_object('id', t.id, 'slug', t.slug)
  ) INTO _tenant_ids
  FROM tenants t
  INNER JOIN organizations o ON o.tenant_id = t.id
  INNER JOIN members m ON m.organization_id = o.id
  WHERE m.user_id = _user_id;

  -- Fetch all organizations
  SELECT jsonb_agg(org_id) INTO _org_ids
  FROM members
  WHERE user_id = _user_id;

  -- Check concierge status
  DECLARE _is_concierge BOOLEAN;
  BEGIN
    SELECT TRUE INTO _is_concierge
    FROM protected.concierges
    WHERE user_id = _user_id
    LIMIT 1;
  END;

  -- Build app_metadata
  _claims := jsonb_build_object(
    'tenants', COALESCE(_tenant_ids, '[]'::jsonb),
    'organizations', COALESCE(_org_ids, '[]'::jsonb),
    'is_concierge', COALESCE(_is_concierge, false),
    'onboarded', false
  );

  event->'user'->'app_metadata' := _claims;
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Register in `supabase/config.toml`:
```toml
[auth]
hook_events = "auth.user_created"
hook_func_name = "user_auth_hook"
```

## Refresh Session After Permission Changes

When user is added to org or granted permission, refresh JWT:

```typescript
// After INSERT into memberships or membership_permissions
await supabase.auth.refreshSession();

// Also revoke old sessions if removing access
await supabase.auth.admin.signOut(user_id, "all");
```

## Sign Up with Email

```typescript
export async function actionSignUpEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) throw error;
  return data.user;
}
```

## Passkey Registration (WebAuthn)

Requires HTTPS + secure context. `WebAuthn.isUserVerifyingPlatformAuthenticatorAvailable()` must be true.

```typescript
"use client";

import { useCallback, useState } from "react";

export function RegisterPasskey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithWebAuthn({
        options: {
          displayName: "My Device",
        },
      });

      if (error) throw error;
      console.log("Passkey registered:", data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Add Passkey"}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

**Env vars required:**
```env
WEBAUTHN_RELYING_PARTY_ID=lvh.me
WEBAUTHN_RELYING_PARTY_ORIGIN=https://lvh.me:7003
```

## OAuth Setup (GitHub, Google, etc.)

**`supabase/config.toml`:**
```toml
[auth.external.github]
enabled = true
client_id = "env(GITHUB_OAUTH_CLIENT_ID)"
secret = "env(GITHUB_OAUTH_CLIENT_SECRET)"

[auth.external.google]
enabled = true
client_id = "env(GOOGLE_OAUTH_CLIENT_ID)"
secret = "env(GOOGLE_OAUTH_CLIENT_SECRET)"
```

**Sign in:**
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "github",
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
});
```

## OAuth Callback Handler

```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "~/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=no_code", request.url));
  }

  const supabase = createSupabaseClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, request.url)
    );
  }

  return NextResponse.redirect(new URL("/home", request.url));
}
```

## Sign Out

```typescript
export async function actionSignOut() {
  await supabase.auth.signOut();
  redirect("/");
}
```

## RLS + auth.uid()

Every RLS policy can check `auth.uid()`:

```sql
CREATE POLICY posts_author_delete ON posts FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY members_view ON members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM members
      WHERE user_id = auth.uid()
    )
  );
```

## Password Reset

```typescript
export async function actionRequestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`,
  });

  if (error) throw error;
}

// Handle reset at /auth/reset?token=...
export async function actionResetPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  redirect("/home");
}
```

## Email Templates

Customize in Supabase Studio → Auth → Email Templates. Variables:
- `{{ .ConfirmationURL }}`
- `{{ .TokenHash }}`
- `{{ .RedirectTo }}`
- `{{ .Email }}`

## Multi-Tenancy Auth Gate

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const metadata = getSupabaseServerUserMetadata();
  const tenantFromSubdomain = extractTenantFromHost(request.headers.get("host"));

  const hasTenant = metadata?.tenants.some((t) => t.id === tenantFromSubdomain.id);

  if (!hasTenant) {
    return NextResponse.redirect(new URL("/home", request.url)); // Org picker
  }

  return NextResponse.next();
}
```
