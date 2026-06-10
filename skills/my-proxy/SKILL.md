---
name: my-proxy
description: Repository-specific Next.js proxy routing for locale, apex and tenant subdomains, Supabase session refresh, public paths, auth gates, tenant membership, rewrites, cookies, and custom-domain staging.
---

# Platform Proxy

File: `apps/platform/proxy.ts`. This skill means Next.js request proxy, not network/SOCKS proxy.

## Order

Preserve gate order:

1. Classify apex, tenant subdomain, Vercel preview, unknown host.
2. Handle canonical `/health`.
3. Resolve `/[locale]/` sentinel.
4. Add missing locale from cookie/header/default.
5. Set locale on request before `updateSession`.
6. Refresh Supabase session.
7. Move tenant-subdomain `/auth/*` to apex.
8. Public path handling.
9. Auth gate with same request URL in `next`.
10. Decode JWT tenant claims.
11. Subdomain reserved-slug, tenant, membership checks.
12. Rewrite to `/{locale}/{tenant_slug}{path}`.

Reordering can break cookie/session visibility.

## Host constants

From `apps/platform/lib/constants.ts`:

```ts
APEX_HOSTNAME
APP_PORT
APP_HOST
SUBDOMAIN_MODE
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

Do not use `request.url` alone; Next dev can lose original subdomain.

## Tenant subdomain

- Reject reserved slug from request-cached DB list.
- Resolve active tenant with service role.
- Decode `session.access_token`; `auth.getUser()` lacks hook claims.
- Require tenant ID in `app_metadata.tenants`.
- Rewrite, do not redirect, to locale + slug route.
- Avoid duplicate slug when browser path already includes it.

Path-form tenant access on apex remains supported. Page/layout validates viewer tenant/org via
GraphQL helpers.

## Locale sentinel

Server redirects and client links may use `"/[locale]/..."`. Proxy replaces sentinel using
locale cookie/header. Handle raw and percent-encoded brackets.

## Custom domains

`tenant_domains` schema exists, but proxy does not resolve custom apex domains. Unknown hosts
currently redirect to configured apex. Do not claim custom-domain support without SSO/cookie
exchange design.

## Tests

Routing/auth changes need Playwright journeys. Cover apex, tenant subdomain, unauthenticated
`next`, forbidden tenant, locale sentinel, public path, and cookie preservation.
