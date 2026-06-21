# SaaS Template — Multi-tenant SaaS Starter

> **Required skills:**
>
> - `/codebase` — load the generated whole-monorepo reference before working anywhere in the repo.
> - `/context7-mcp` — fetch current library/framework docs before writing code (training data goes stale).
> - `/my-conventions` — **read before writing ANY TS/TSX** (imports, typed routes, bracket notation, code style, naming, commits).
> - `/caveman` — ultra-compressed, token-efficient responses.
> - `/ponytail` — laziest solution that actually works (YAGNI, stdlib before deps, shortest path).
>
> **Session start:** if `.env.development.local` exists at repo root, read the comments, we are in a worktree.
>
> **This file is the map, not the manual.** It holds macro architecture + a [Skill Router](#skill-router).
> Execution rules live in skills — open the skill for the subsystem you touch. See [Governance](#governance)
> before adding anything here.

## What This Is

Production-grade multi-tenant SaaS starter. Hard parts pre-wired: authentication (email/password, OAuth, phone OTP, WebAuthn passkeys), two-level multi-tenancy with Postgres RLS, capability-based permissions, agency/affiliate surface for cross-tenant partner access, i18n, React Email/PDF template packages, shadcn-based design system — all in Turborepo monorepo.

Keep reusable infrastructure (`packages/*`, auth, tenancy, routing, permissions, **agency/affiliate** surface — generic B2B pattern for partners/resellers/firms working across multiple customer tenants). **HR/payroll-style tenant surface** is example product implementation — replace with your own.

## Package Manager

Always use **pnpm**. Never npm or yarn.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 24 |
| Package manager | pnpm 10.x |
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 6 |
| Styling | Tailwind CSS 4.x + shadcn/ui (new-york, in `packages/ui-common/src/shadcn`) |
| API | Typed `pg_graphql` operations + Server Actions for server-only effects |
| Database + Auth | Supabase (Postgres + Auth + Storage + Realtime + RLS) |
| ORM | Supabase (generated types via CLI, no Drizzle) |
| GraphQL | `pg_graphql` + a typed client (`@packages/graphy`) |
| PDF generation | `@react-pdf/renderer` (in `packages/react-pdf`) |
| Email templates | React Email (in `packages/react-email`; delivery not wired) |
| i18n | `@packages/rosetta` + locale from cookie/header (no URL segment) |
| Linting/Formatting | Biome.js 2.x |
| Hosting | Vercel |

> Optional integrations included as examples: `@packages/kapso` (WhatsApp BSP). Remove ones you don't need.

## Architecture

One Next.js app — `apps/platform` — hosts marketing, auth, dashboard, and tenant surfaces, routed by hostname and URL path. Shared logic in `@packages/*`.

```
<repo>/
├── apps/
│   └── platform/             # @apps/platform — single Next.js app
│       ├── app/
│       │   ├── health/route.ts       # /health — canonical health check (public)
│       │   ├── (marketing)/          # / — public landing, FAQ, pricing, legal
│       │   ├── auth/                 # /auth/* — auth + onboarding
│       │   ├── oauth/                # /oauth/* — MCP consent
│       │   ├── api/                  # route handlers (e.g. /api/mcp)
│       │   └── (app)/                # authenticated shell (route group, no URL segment)
│       │       ├── home/             # /home — org picker + account
│       │       ├── tenants/create/   # /tenants/create
│       │       ├── t/[tenant_slug]/[organization_id]/   # /t/{slug}/{org_id}/* — tenant product
│       │       ├── a/[agency_slug]/  # /a/{slug}/* — agency surface
│       │       └── agencies/         # /agencies/* — agency management
│       ├── proxy.ts          # Host routing, locale (cookie/header), session, auth, tenant membership gates
│       ├── styles/globals.css
│       └── next.config.ts
│
├── packages/
│   ├── typescript-config/    # @packages/typescript-config — base, nextjs, react-library presets
│   ├── ui-common/            # @packages/ui-common — shadcn primitives (src/shadcn/**) + shared components (src/**)
│   ├── supabase/             # @packages/supabase — client factories + generated types + schema/RLS/seed/tests
│   ├── graphy/               # @packages/graphy — typed pg_graphql client
│   ├── rosetta/              # @packages/rosetta — i18n runtime
│   ├── react-email/          # @packages/react-email — React Email templates + preview
│   ├── react-pdf/            # @packages/react-pdf — PDF templates
│   ├── debug/ utils/ react-hooks/   # small shared utilities
│   └── kapso/                # @packages/kapso — lite WhatsApp BSP client (optional)
│
└── (your docs)              # Strategy, product spec, etc.
```

### Package Scopes

- `@apps/*` — apps (currently just `@apps/platform`)
- `@packages/*` — shared packages

### Routing

Tenant routing is **path-based** (`/t/{slug}/{organization_id}/...`) — **no `[locale]` URL segment** (locale resolved from cookie/header by the proxy) and **no subdomain extraction**. Details + gates: **`/my-proxy`**.

- `<apex>/...` and `www.<apex>/...` → main site + authenticated app shell.
- `{slug}.<apex>/...` → legacy tenant subdomains are not used; such hosts redirect to the apex. Reach a tenant via the path `<apex>/t/{slug}/{organization_id}/...`.
- Custom apex domains — phase 2; unknown hosts redirect to the configured apex.

`<apex>` is `NEXT_PUBLIC_APEX_HOSTNAME` (hostname only) + `process.env.PORT` (per instance). `lvh.me` + `7003` in dev (Conductor reassigns `PORT` for parallel instances), `example.com` + implicit `443` in prod.

### Auth + onboarding

`proxy.ts` calls `updateSession` to refresh the JWT cookie, then reads the `sub` claim (the `profile_id`) — the only claim the hook carries. JWT holds **no** tenant/organization/agency/onboarding metadata; resolve from DB via `viewer_*` helpers (or `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server`). Gates run in order: public path bypass → auth redirect (`/auth?next=…`) → tenant membership check (`viewer_tenant_validate`). Onboarding completion is **not** a hard gate — surfaced via a /home banner. Full flows + helpers: **`/my-auth`**, **`/my-proxy`**.

**Public paths:** new marketing pages (e.g. `/faq`, `/pricing`) → update `PUBLIC_PATH_REGEX` in `apps/platform/proxy.ts` to avoid the auth gate.

### Reserved Slugs

Reserved slugs are seeded in `packages/supabase/supabase/seed.sql` and cached per-request in `apps/platform/lib/get-tenant-reserved-slugs.ts` using React's `cache()`. New/changed slugs are picked up on the next request automatically. Tenant creation rejects them (`apps/platform/app/(app)/tenants/create/schemas.ts` + `internal.slug_reserved_validate()`).

### Local Dev Ports

| Module | Service | Default port | URL |
|---|---|---|---|
| `apps/platform` | Next.js main app | 7003 | https://lvh.me:7003 |
| `packages/supabase` | Supabase Studio | 7100 | http://localhost:7100 |
| `packages/supabase` | Supabase Inbucket (mailbox) | 54424 | http://localhost:54424 |
| `packages/react-email` | React Email preview | 7101 | http://localhost:7101 |
| `packages/react-pdf` | React PDF preview | 7102 | http://localhost:7102 |

Table above = **bare-local default**. Conductor/exe.dev shift ports per worktree. See `.env.development.local` at repo root.

`lvh.me` is public wildcard DNS resolving every name (apex + subdomain) to `127.0.0.1` — no `/etc/hosts` needed. Cookies scoped to `.lvh.me` so session crosses `lvh.me:7003` ↔ `{slug}.lvh.me:7003`.

### Local HTTPS

`apps/platform` runs over HTTPS in dev (`next dev --experimental-https`) — WebAuthn requires a secure context, and the browser's secure-context allowlist hardcodes `localhost` / `127.0.0.1` / `[::1]`. DNS aliases like `lvh.me` are NOT on the allowlist, so plain HTTP makes `window.PublicKeyCredential` undefined.

TLS cert from [mkcert](https://github.com/FiloSottile/mkcert). One-time setup: `bash scripts/development/https-setup.sh` (runs `mkcert -install`, emits `apps/platform/certificates/lvh.me-{cert,key}.pem`; the dir is gitignored).

Keep these aligned with the HTTPS dev origin — flipping any to `http://` breaks OAuth callbacks and passkey verification:

- `WEBAUTHN_RELYING_PARTY_ORIGIN` (in `.env.example` + `apps/platform/.env.local`): `https://lvh.me:7003`
- `supabase/config.toml` `[auth].site_url`: `https://lvh.me:7003`
- `supabase/config.toml` `[auth].additional_redirect_urls`: `https://lvh.me:7003/**` + `https://*.lvh.me:7003/**`

`WEBAUTHN_RELYING_PARTY_ID` stays `lvh.me` (host only). `NEXT_PUBLIC_APEX_HOSTNAME` is `lvh.me` (hostname only); port from `process.env.PORT` (dev script falls back to 7003); `proxy.ts` builds the full host via `APP_HOST` in `apps/platform/lib/constants.ts`. After editing `config.toml`, restart Supabase (`pnpm db:stop && pnpm db:start`).

## `@packages/ui-common`

Shared UI in `packages/ui-common`, two layers:

- **`src/shadcn/**`** — shadcn/ui primitives + `cn`. Managed by the shadcn CLI. **Never hand-edit** `src/shadcn/components/ui/` — generated, overwritten on the next style switch. Customizations go in `src/` wrappers.
- **`src/**`** — hand-written shared components (e.g. `logo.tsx`). One file per component, no barrels.

```ts
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Logo } from "@packages/ui-common/logo";
```

Add primitives with `pnpm dlx shadcn add <component>` from `packages/ui-common/`. Current style `radix-rhea` (in `components.json`); switching styles + the regen command → **`/shadcn`** skill. Don't put shadcn components in `apps/platform/`.

## MCP Status

Remote MCP server at `/api/mcp` (Streamable HTTP, stateless, via `mcp-handler`). Auth: Supabase OAuth 2.1 Authorization Server (beta) + Dynamic Client Registration (DCR). Flow:

1. MCP client hits `/api/mcp` without a token → `withMcpAuth` returns 401 + `WWW-Authenticate`.
2. Client fetches `/.well-known/oauth-protected-resource` (public, RFC 9728 PRM) → discovers the Authorization Server at `${SUPABASE_URL}/auth/v1`.
3. Client registers via DCR, runs PKCE → Supabase redirects to `/oauth/consent?authorization_id=<id>`.
4. User approves → code → token exchange → Supabase JWT.
5. Client sends `Authorization: Bearer <jwt>` → `verifyToken` validates via `supabase.auth.getUser(token)` → passes the token to `GraphyClientSupabase` → RLS enforces per-user access.

Key paths: **endpoint** `/api/mcp` (`withMcpAuth`); **PRM discovery** `/.well-known/oauth-protected-resource` (public); **consent** `/oauth/consent` (login required). Tenant scoping is global today (apex host) with an optional tenant arg per tool — path-based scoping is phase 2. Config: `packages/supabase/supabase/config.toml` block `[auth.oauth_server]`.

## Database & Multi-tenancy (macro)

Prototype phase — **no incremental migrations**. All schema in one file: `packages/supabase/supabase/migrations/00000000000000_schema.sql`. Change schema → edit it directly → `pnpm db:reset && pnpm generate:types`. Commands: `pnpm db:start`/`db:stop`, `pnpm db:reset` (drop + replay + seed), Studio `http://127.0.0.1:7100`. Full SQL/RLS/codegen workflow: **`/my-supabase`**, **`/my-supabase-codegen`**.

Two-level model:

- `public.tenants` (int4 serial PK) — billing / customer relationship.
- `public.organizations` (int4 serial PK, FK to tenants) — actual operating unit. Most tenants have one org mirroring the tenant; large companies have several.
- `public.organization_memberships(...)` — users belong to **organizations**, not directly to tenants. No `role` column — access is permission-based. Pending invitations and active memberships share this table.

Every tenant-scoped table carries denormalized `tenant_id int` (and `organization_id int` when org-scoped). RLS enforces isolation at the DB layer — never rely on app-level filtering alone. The active tenant comes from the **path segment** (no `x-tenant-*` headers); pages use viewer-scoped GraphQL helpers or resolve `tenant_id` from DB via `viewer_*` helpers.

**Permissions are capability-based, not role-based.** Catalog `public.permissions` (citext slugs: `*` wildcard, `organization_manage`, `tenant_manage`, `members_manage`, `presets_manage`); explicit grants in `public.organization_membership_permissions`; UX-only bundles in `public.permission_presets`. Permissions are **NOT** in the JWT — enforced at query time via `viewer_*` security-definer helpers (wildcard `*` honored). Helper catalog (`viewer_tenant_ids`, `viewer_organization_validate`, `viewer_permission_org_ids`, `viewer_has_tenant_permission`, …) + RLS patterns: **`/my-supabase`**, **`/my-permissions`**.

## Skills

Three kinds, all **committed** and materialized on `pnpm install` by the `postinstall` script (`scripts/skills-setup.mjs`, exposed as `pnpm skills:install`). It symlinks every dir in `skills/` and `skills-third-party/` into both agent stores — no network, no cloning. The stores `.agents/skills/` and `.claude/skills/` are **gitignored** generated symlinks. Read the relevant skill before working in that subsystem.

- **First-party (`my-*`)** — sources committed in `skills/my-*`.
- **Third-party** — vendored (committed) in `skills-third-party/<name>`. `skills-lock.json` (committed) is the provenance record.
- **Generated codebase reference (`codebase`)** — `repomix --skill-generate` packs the monorepo into `skills/codebase/`. Regenerate with `pnpm generate:repomix:skills`. **Generated — never hand-edit.**

`.agents/skills/` is the **universal store** (Codex, Cursor, Copilot, OpenCode, Zed); `.claude/skills/` is Claude Code's. Source of truth = `skills/` + `skills-third-party/`.

Add/refresh a third-party skill (use the github `owner/repo` shorthand, NOT a skills.sh URL):

```bash
pnpm dlx skills add <owner/repo> --skill <skill-name>   # e.g. dietrichgebert/ponytail --skill ponytail
cp -R .agents/skills/<skill-name> skills-third-party/<skill-name>   # vendor the fetched files
pnpm skills:install                                                 # re-link the stores
```

Commit the `skills-third-party/<skill-name>` files + the `skills-lock.json` bump. Vendored skills are frozen at the fetched commit — they do **not** track upstream. Skills run with **full agent permissions** — review source before vendoring.

## Skill Router

Before touching a subsystem, open its skill — it holds the execution rules this file deliberately omits. Also use **`/context7-mcp`** for any external library/framework docs.

| Working on… | Read first |
|---|---|
| SQL schema, RLS, triggers, storage, pgTAP, plpgsql style, multi-step writes | `/my-supabase`, `/my-permissions`, `/psql-query` |
| Type/schema/operation codegen, generated-type errors | `/my-supabase-codegen`, `/my-graphql-codegen` |
| GraphQL queries/mutations/fragments, operation variables, `pg_graphql` exposure | `/my-graphql`, `/my-graphy` |
| Typed Supabase client, server actions, browser SWR hooks | `/my-supabase-react` |
| i18n: dictionaries, cookie locale, `t`/`LOCALES` rules, email/PDF localization | `/my-i18n` |
| Auth, JWT claim, OAuth, OTP, passkeys, onboarding | `/my-auth` |
| Proxy: locale/apex/tenant gates, session refresh, public paths | `/my-proxy` |
| **Any TS/TSX** — imports, typed routes, `next-zod-route`, bracket notation, code style, naming, hooks, lint/build, commits | **`/my-conventions`** |
| React Email / React PDF templates | `/my-react-email`, `/my-react-pdf` |
| shadcn primitives, styles, presets | `/shadcn` |
| WhatsApp / Kapso | `/integrate-whatsapp` |

## Governance

**This file = macro architecture + the router above. Nothing else.**

- A **new subsystem rule** (SQL, GraphQL, i18n, auth, proxy, …) → add it to that subsystem's `my-*` skill, **not here**.
- A **new cross-cutting TS/TSX rule** → add it to **`/my-conventions`**.
- Only **macro architecture** (new top-level dir, new app, new routing tier, a new subsystem that needs a router row) belongs in this file.
- Do **not** add "Critical Rules" / execution detail here — it loads on every session and must stay small.

### Contradicciones entre código y documentación

Si al trabajar en una tarea se detecta una contradicción entre lo que dice el código real y lo que indica `AGENTS.md` o alguna skill propia (`skills/my-*`), **no elegir un camino silenciosamente**. Detener el trabajo, exponer la contradicción al usuario con precisión (archivo:línea del código vs. sección del doc), preguntar qué fuente prevalece, y luego corregir tanto el código como el markdown que resulte incorrecto. La fuente de verdad debe quedar consistente en ambos lados.

## Testing Strategy

Three layers, each a different runner:

| Layer | Runner | Command | Lives in |
|---|---|---|---|
| TypeScript units | Vitest | `pnpm test` (turbo) | `packages/*/src/**/*.test.ts` |
| SQL (RLS, viewer_*, triggers, hook) | pgTAP via `supabase test db` | `pnpm test:db` | `packages/supabase/supabase/tests/**/*.test.sql` |
| End-to-end UI journeys | Playwright + Chromium | `pnpm test:e2e` | `apps/platform/tests/e2e/**/*.spec.ts` |

`pnpm test:db` and `pnpm test:e2e` run against the same local Supabase as `pnpm dev`. pgTAP tests wrap in `begin … rollback`; Playwright provisions/cleans up its own users via `auth.admin` and assumes the dev server is already running. RLS test detail (`set local role authenticated; set local request.jwt.claims …`) → `/my-supabase`, `/my-permissions`. Don't fight onboarding in e2e — not a hard gate; skip via `page.goto`.

## What NOT to Do

- Don't add new technology without strong justification — the stack is intentionally familiar.
- Don't use a tenant slug from the reserved-route list (auth, home, tenants, health, …) — `tenants/create/schemas.ts` + `internal.reserved_slugs` is the source of truth.
- Don't expect tenant/organization/agency/onboarding state in the JWT — the hook is pass-through, only `profile_id` (the `sub` claim) is carried. Resolve from DB via `viewer_*` helpers.
- Don't put shadcn components in `apps/platform/` — they belong in `packages/ui-common/src/shadcn`.
- Don't add execution rules to this file — see [Governance](#governance).
