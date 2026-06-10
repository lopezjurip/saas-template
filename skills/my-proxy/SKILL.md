---
name: my-proxy
description: Repository-specific Next.js proxy routing for locale, apex, tenant path gate, Supabase session refresh, public paths, auth gates, tenant membership, and cookies.
---

# Platform Proxy

File: `apps/platform/proxy.ts`. This skill means Next.js request proxy, not network/SOCKS proxy.

## Order

Preserve gate order:

1. Classify apex, Vercel preview, unknown host (bounce unknown to apex).
2. Handle canonical `/health`.
3. Resolve `/[locale]/` sentinel.
4. Add missing locale from cookie/header/default.
5. Set locale on request before `updateSession`.
6. Refresh Supabase session.
7. Public path handling.
8. Auth gate with same request URL in `next`.
9. Decode JWT tenant claims.
10. Tenant path gate for `/{locale}/t/{slug}/...` — resolve tenant, check membership.

Reordering can break cookie/session visibility.

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

## Auth redirect

Build `next` from `Host`, protocol, path, query:

```ts
const next = `${proto}://${hostname}${pathname}${request.nextUrl.search}`;
const authUrl = new URL(`/${locale}/auth`, `${proto}://${APP_HOST}`);
authUrl.searchParams.set("next", next);
```

## Tenant path gate

Tenant routes live at `/{locale}/t/{slug}/...`. The proxy is the access-control boundary:

- Resolve active tenant from slug via service-role DB query (catches disabled tenants).
- Decode `session.access_token`; `auth.getUser()` lacks hook-injected claims.
- Require tenant ID in `app_metadata.tenants` JWT claim.
- Return 404 for unknown/disabled tenant, 403 for non-member.
- No rewrite needed — path already maps to `app/[locale]/t/[tenant_slug]/...`.

A logged-in non-member hitting `/es/t/acme/123` must receive a 403 here.

## Locale sentinel

Server redirects and client links may use `"/[locale]/..."`. Proxy replaces sentinel using
locale cookie/header. Handle raw and percent-encoded brackets.

## Custom domains

`tenant_domains` schema exists, but proxy does not resolve custom domains. Unknown hosts
redirect to configured apex. Custom domain support (phase 2) would add a DB lookup here:
hostname → tenant slug → rewrite to `/t/{slug}/...`.

## Tests

Routing/auth changes need Playwright journeys. Cover apex, tenant path, unauthenticated
`next`, forbidden tenant, locale sentinel, public path, and cookie preservation.
