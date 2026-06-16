---
name: my-proxy
description: Repository-specific Next.js proxy routing for locale, apex, tenant path gate, Supabase session refresh, public paths, auth gates, tenant membership, and cookies.
---

# Platform Proxy

File: `apps/platform/proxy.ts`. This skill means Next.js request proxy, not network/SOCKS proxy.

## Order

Preserve order:

1. Classify host: apex / Vercel preview (treat as apex) / unknown (redirect to apex). All tenant routing is path-based (`/t/{slug}/...`) — no subdomain extraction.
2. Resolve locale from the `NEXT_LOCALE` cookie (else `Accept-Language`/default); mirror it onto the request and persist on the response only when absent. Locale never appears in the URL — there is no sentinel.
3. Global metadata asset paths (`/icon`, `/opengraph-image`, …) → `updateSession`, return.
4. Canonical `/health` → `updateSession`, return (no auth).
5. `updateSession` — refresh the Supabase session.
6. Bots on public paths → public content, no session overhead.
7. Public paths → allow; redirect logged-in users off auth-entry pages to `/home`; bootstrap PostHog on marketing paths.
8. Everything else is a protected path → pass the refreshed session through.

Reordering can break cookie/session visibility. **The auth and tenant-membership gates are NOT in the proxy — they live in the route layouts** (see Auth + Tenant gate below).

## Host constants

From `apps/platform/lib/constants.ts`:

```ts
APEX_HOSTNAME
APP_PORT
APP_HOST
```

`NEXT_PUBLIC_APEX_HOSTNAME` is hostname only. Port comes from `PORT`. Do not hardcode `7003`
inside proxy URLs.

## Public routes

Current regex:

```ts
const PUBLIC_PATH_REGEX =
  /^(\/|(\/(?:auth|legal|faq|pricing|opengraph-image|twitter-image|icon)(?:\/|$)))/;
```

New public marketing route must be added here. Matcher already excludes API/static/image and
metadata files.

## Session

```ts
const { response: sessionResponse, supabase } =
  await updateSession(request);
```

`updateSession` mutates request cookies and response cookies, then calls `auth.getUser()` to
rotate token. Rewrites/redirects must preserve session cookies with `copyCookies` where needed.

Locale cookie must mutate incoming request before this call:

```ts
request.cookies.set(LOCALE_COOKIE, locale);
```

Otherwise server components see stale locale during same request.

## Auth + tenant gates live in layouts, not the proxy

The proxy passes protected paths through; the access-control gates are server-component layouts:

- **Auth gate** — `app/(app)/layout.tsx` calls `getSupabaseServerUserRedirect()`, redirecting unauthenticated users to `/auth`.
- **Tenant membership** — `app/(app)/t/[tenant_slug]/layout.tsx` calls `getViewerTenantBySlugAssert(tenant_slug)`; it runs through the user's session client so RLS returns the tenant only for a member / agency-grant holder, otherwise `notFound()`. The JWT carries only `profile_id` (`sub`); membership is resolved from the DB (`viewer_tenant_ids` / `viewer_tenant_validate`), never the token.
- **Org-in-tenant** — `app/(app)/t/[tenant_slug]/[organization_id]/layout.tsx` validates the org belongs to the tenant, else `notFound()`.

The only app-path redirect the proxy itself performs is bouncing already-logged-in users off auth-entry pages (`/auth`, `/auth/email`, …) to `/home`.

## Custom domains

`tenant_domains` schema exists, but the proxy does not resolve custom domains. Unknown hosts
redirect to the configured apex. Custom domain support (phase 2) would add a DB lookup here:
hostname → tenant slug → path `/t/{slug}/...`.

## Tests

Routing/auth changes need Playwright journeys. Cover apex, tenant path access, unauthenticated
redirect, forbidden tenant, public path, and cookie preservation.
