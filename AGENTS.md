# SaaS Template — Multi-tenant SaaS Starter

> **Recommended skills:** run `/codebase` to load the generated whole-monorepo reference before working anywhere in the repo, and `/caveman` for ultra-compressed, token-efficient responses.

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

Tenant routing is **path-based** (`/t/{slug}/{organization_id}/...`) — there is no `[locale]` URL segment (locale is resolved from cookie/header by the proxy) and no subdomain extraction.

- `<apex>/...` and `www.<apex>/...` → main site + the authenticated app shell. Proxy detects locale from cookie/`Accept-Language` and persists it in a cookie; it does **not** add a URL segment.
- `{slug}.<apex>/...` → legacy tenant subdomains are not used for routing; such hosts redirect to the apex. Reach a tenant via the path `<apex>/t/{slug}/{organization_id}/...`.
- Custom apex domains — phase 2; unknown hosts redirect to configured apex. Cookies can't span apexes without SSO redirect/exchange flow.

`<apex>` is `NEXT_PUBLIC_APEX_HOSTNAME` (hostname only) + `process.env.PORT` (assigned per instance). `lvh.me` + `7003` in dev (Conductor reassigns `PORT` for parallel instances), `example.com` + implicit `443` in prod.

### Auth + onboarding

- `proxy.ts` calls `updateSession` (`@packages/supabase/client.middleware`) to refresh JWT cookie, then reads `sub` claim (the `profile_id`) — only claim hook carries. JWT no longer holds tenant/organization/agency/onboarding metadata; resolve from DB via `viewer_*` helpers (or `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server`).
- Gates, in order: public path bypass → auth (redirect to `/auth?next=…`, `next` derived from `Host` header since `request.url` drops subdomain in Next dev) → for tenant subdomains, membership check from DB (`viewer_tenant_validate`). Onboarding completion is **not** hard gate — surfaced via /home banner.
- Reserved slugs (`auth`, `home`, `tenants`, `health`, `api`, `_next`, `www`, …) rejected at tenant creation (`apps/platform/app/(app)/tenants/create/schemas.ts`, enforced by `internal.slug_reserved_validate()` in DB) — never collide with first-party routes.
- **Public paths in proxy:** adding new marketing pages (e.g., `/faq`, `/pricing`) → update `PUBLIC_PATH_REGEX` in `apps/platform/proxy.ts` to avoid auth gate. Regex matches root + any route under `/auth`, `/legal`, plus exact matches.

### Reserved Slugs

Reserved slugs seeded in `packages/supabase/supabase/seed.sql` and cached per-request in `apps/platform/lib/get-tenant-reserved-slugs.ts` using React's `cache()`. Cache deduplicates queries within single request; new/changed slugs picked up on next request automatically.

### Local Dev Ports

| Service | Default port | URL |
|---|---|---|
| `apps/platform` | 7003 | https://lvh.me:7003 |
| Supabase Studio | 7100 | http://localhost:7100 |
| Supabase Inbucket (mailbox) | 54424 | http://localhost:54424 |
| `packages/react-email` | 7101 | http://localhost:7101 |
| `packages/react-pdf` | 7102 | http://localhost:7102 |

`lvh.me` is public wildcard DNS resolving every name (apex + subdomain) to `127.0.0.1` — no `/etc/hosts` entries needed. Cookies scoped to `.lvh.me` so session crosses `lvh.me:7003` ↔ `{slug}.lvh.me:7003`.

### Local HTTPS

`apps/platform` runs over HTTPS in dev (`next dev --experimental-https`) — WebAuthn requires secure context, and browser's secure-context allowlist hardcodes `localhost` / `127.0.0.1` / `[::1]` — DNS aliases like `lvh.me` resolving to 127.0.0.1 are NOT on allowlist, so plain HTTP makes `window.PublicKeyCredential` undefined.

TLS cert from [mkcert](https://github.com/FiloSottile/mkcert). One-time setup:

```bash
bash scripts/development/https-setup.sh
```

Runs `mkcert -install` and emits `apps/platform/certs/lvh.me-{cert,key}.pem` covering `lvh.me`, `*.lvh.me`, `localhost`, `127.0.0.1`. Dev script in `apps/platform/package.json` references those paths. `apps/platform/certs/` is gitignored (`**/certs/` in root `.gitignore`).

Keep these aligned with HTTPS dev origin — flipping any to `http://` breaks OAuth callbacks and passkey verification:

- `WEBAUTHN_RELYING_PARTY_ORIGIN` (in `.env.example` + `apps/platform/.env.local`): `https://lvh.me:7003`
- `supabase/config.toml` `[auth].site_url`: `https://lvh.me:7003`
- `supabase/config.toml` `[auth].additional_redirect_urls`: `https://lvh.me:7003/**` + `https://*.lvh.me:7003/**`

`WEBAUTHN_RELYING_PARTY_ID` stays `lvh.me` (host only, no protocol/port). `NEXT_PUBLIC_APEX_HOSTNAME` is `lvh.me` (hostname only); port from `process.env.PORT` (Conductor assigns per parallel instance, dev script falls back to 7003); `proxy.ts` derives protocol from `request.nextUrl.protocol` / `x-forwarded-proto` and builds full host via `APP_HOST` in `apps/platform/lib/constants.ts`.

After editing `config.toml`, restart Supabase (`pnpm db:stop && pnpm db:start`) — `pnpm db:reset` also picks them up but wipes data.

## Skills

Three kinds of skills, all materialized on `pnpm install` by `scripts/skills-setup.js` (postinstall). The generated dirs `.agents/skills/` and `.claude/skills/` are **gitignored** — never committed, always regenerated. Read relevant skill before working in that subsystem.

- **First-party (`my-*`)** — sources committed in `skills/my-*`. The script symlinks them into `.agents/skills/` and `.claude/skills/`.
- **Third-party** — pinned in `skills-lock.json` (committed), restored by the `skills` CLI (a devDependency). The script's restore step snapshots `skills-lock.json` and writes it back after, so installs never churn the committed lock.
- **Generated codebase reference (`codebase`)** — `repomix --skill-generate` packs the whole monorepo into a LLM-loadable reference skill at `skills/codebase/` (committed source, registered in `SKILLS[]`, symlinked like the `my-*` skills). Regenerate with `pnpm generate:repomix:skills` after significant changes. **Generated — never hand-edit.** Exclusions (codegen, `**/generated/**`, `node_modules`, `.env*`, `pnpm-lock.yaml`, all tests/`**/certificates/**`/`**/*.pem`, and the skill itself to avoid recursive bloat) live in `repomix.config.ts`; secrets are stripped by repomix's `security` check.

`.agents/skills/` is the **universal store** read directly by Codex, Cursor, GitHub Copilot, OpenCode, and Zed; `.claude/skills/` is Claude Code's. Source of truth = `skills/` (first-party) + `skills-lock.json` (third-party).

Add a third-party skill (writes the file tree + records it in `skills-lock.json`):

```bash
pnpm dlx skills add <registry-url> --skill <skill-name>
```

Commit the resulting `skills-lock.json` change — the file tree itself is gitignored and reappears on the next `pnpm install`. Update pins with `pnpm dlx skills update`.

**Caveat:** `skills-lock.json` records the source repo, not a commit SHA, so restore re-clones each skill at upstream **HEAD** — `computedHash` is descriptive, not enforced. Third-party skills track latest, not a frozen version. Skills run with **full agent permissions** — review skill source before using in production.

## Documentation

Fetch current docs before writing code — training data goes stale.

1. **Context7 MCP** — `mcp__context7__resolve-library-id` → `mcp__context7__query-docs`. Any stack package (Next.js, Supabase, Tailwind, shadcn/ui, React, etc.).
2. **Repository skills** — `skills/my-*` for repo-specific subsystems (auth, graphql, i18n, supabase, etc.). Read skill before touching that subsystem.
3. **`context7-mcp` skill** — `/context7-mcp` shorthand; wraps both MCP calls above.

## `@packages/ui-common`

Shared UI in `packages/ui-common`. Two layers:

- **`src/shadcn/**`** — shadcn/ui primitives + `cn` utility. Managed by shadcn CLI.
- **`src/**`** — hand-written shared components (e.g. `logo.tsx`, brand-specific UI). One file per component, no barrels.

Conventions:

- Add primitives: `pnpm dlx shadcn add <component>` from `packages/ui-common/` — land in `src/shadcn/components/ui/`.
- Import primitives: `import { Button } from "@packages/ui-common/shadcn/components/ui/button"`
- Import `cn`: `import { cn } from "@packages/ui-common/shadcn/lib/utils"`
- Import hand-written: `import { Logo } from "@packages/ui-common/logo"`
- Each app's `globals.css` imports `../../packages/ui-common/src/shadcn/globals.css` for CSS variables and `@source "../../packages/ui-common/src"` for Tailwind scanning.
- Each app's `next.config.ts` includes `@packages/ui-common` in `transpilePackages`.

### Switching visual style

Current style: **`radix-rhea`** (set in `packages/ui-common/components.json`).

Available styles (all keep `radix-ui` as primitive — no `@base-ui/react`):
`radix-vega` · `radix-nova` · `radix-maia` · `radix-lyra` · `radix-mira` · `radix-luma` · `radix-rhea` · `radix-sera`

To switch (e.g. to `radix-luma`):

```bash
# 1. Change one field in components.json
#    "style": "radix-rhea"  →  "style": "radix-luma"

# 2. Re-generate all components (overwrites src/shadcn/components/ui/)
pnpm dlx shadcn@latest add --overwrite --cwd packages/ui-common \
  accordion alert avatar badge button card checkbox dialog \
  input input-otp label select separator switch table tabs textarea sonner

# 3. Run Biome + type-check
pnpm format:apply-unsafe && pnpm build:dry

# 4. Visual QA: auth, dashboard, dark mode
```

**Critical rule:** never hand-edit files in `src/shadcn/components/ui/` — they are generated and will be overwritten on the next style switch. Customizations go in `src/` wrappers that compose the primitives.

## MCP Status

Remote MCP server lives at `/api/mcp` (Streamable HTTP, stateless, via `mcp-handler`). Auth model: Supabase OAuth 2.1 Authorization Server (beta) with Dynamic Client Registration (DCR). Flow:

1. MCP client hits `/api/mcp` without token → `withMcpAuth` returns 401 + `WWW-Authenticate`.
2. Client fetches `/.well-known/oauth-protected-resource` (public, RFC 9728 PRM) → discovers Authorization Server at `${SUPABASE_URL}/auth/v1`.
3. Client registers via DCR, runs PKCE flow → Supabase redirects to `/oauth/consent?authorization_id=<id>`.
4. User approves on consent page → code → token exchange → Supabase JWT.
5. Client sends `Authorization: Bearer <jwt>` → `verifyToken` validates via `supabase.auth.getUser(token)` → passes token to `GraphyClientSupabase` → RLS enforces per-user access.

Key paths:
- **MCP endpoint:** `/api/mcp` (handled by `mcp-handler`; auth via `withMcpAuth`)
- **PRM discovery:** `/.well-known/oauth-protected-resource` (public; served by `protectedResourceHandler`)
- **Consent page:** `/oauth/consent` (protected — requires login; calls `supabase.auth.oauth.*`)

Tenant scoping: currently global endpoint (apex host) with optional tenant arg per tool. Path-based subdomain scoping is phase 2. Config: `packages/supabase/supabase/config.toml` block `[auth.oauth_server]` (enabled, `authorization_url_path = "/oauth/consent"`, `allow_dynamic_registration = true`).

## Database Workflow (Prototype Phase)

No incremental migrations. All schema in single file: `packages/supabase/supabase/migrations/00000000000000_schema.sql`. To change schema: edit that file directly, run `pnpm db:reset && pnpm generate:types`. Migrations introduced before first production launch.

- `pnpm db:start` / `pnpm db:stop` — start/stop local Supabase (Docker)
- `pnpm db:reset` — drop everything, replay schema, run seed
- `pnpm generate:types` — regenerate `packages/supabase/src/types.ts` from local DB
- Supabase Studio: `http://127.0.0.1:7100`

## Multi-tenancy & RLS

Two-level model:

- `public.tenants` (int4 serial PK) — billing / customer relationship. Subdomain `{tenant_slug}.example.com` routes to tenant.
- `public.organizations` (int4 serial PK, FK to tenants) — actual operating unit. Most tenants have one organization mirroring the tenant; large companies have several (e.g. one per country / branch).
- `public.organization_memberships(organization_membership_id, organization_id, profile_id, lifecycle timestamps, invite fields)` — users belong to organizations, not directly to tenants. No `role` column — access is permission-based. Pending invitations and active memberships share this table.

Every tenant-scoped data table carries denormalized `tenant_id int` (cheap to filter, cheap in indexes) and, when data is org-scoped, also `organization_id int`. Supabase RLS enforces isolation at DB layer — never rely on application-level filtering alone.

**Active tenant from the path segment.** Tenant routing is path-based: `apps/platform/proxy.ts` validates membership against DB (`viewer_tenant_validate`) for requests under `/t/{tenant_slug}/...`; there is no subdomain extraction and no `[locale]` segment. Every tenant route lives under `app/(app)/t/[tenant_slug]/[organization_id]/...`, reached at `<apex>/t/{tenant_slug}/{organization_id}/...`. Pages use viewer-scoped GraphQL helpers or resolve `tenant_id` from DB via `viewer_*` helpers; no `x-tenant-*` headers. Direct table queries must explicitly filter `tenant_id`.

**Custom domain mapping (`public.tenant_domains`, many domains per tenant)** staged in schema, not yet wired into proxy — phase 2. `tenant_tier` (`free` / `pro` / `enterprise`) gates advanced features once billing exists.

**Permissions (capability-based, not role-based):**
- `public.permissions(permission_id citext PK)` — catalog of atomic capability slugs. Ships English admin capabilities: `*`, `organization_manage` (org-level: name, logo, members, presets), `tenant_manage` (company/tenant-level: name, logo, billing, domains — distinct from `organization_manage`), `members_manage`, `presets_manage`. Reserved slug `*` is wildcard — membership holding `*` passes every permission check inside its organization (and, via the tenant helpers, every tenant check too). Used for tenant creator and other "full admin" grants without enumerating every slug.
- `public.organization_membership_permissions(organization_membership_id, permission_id)` — explicit grants. Organization/profile derive through membership row. Composite PK prevents duplicate grants; deletion cascades from memberships.
- `public.permission_presets(permission_preset_id, organization_id?, permission_preset_name, permission_preset_slugs[])` — UX-only named bundles; carries no enforcement. `organization_id IS NULL` = global preset. Seeded global presets: `Owner` / `Administrator` / `Member manager`. Trigger validates every slug.

Permissions deliberately NOT in JWT (size, and they change at runtime). All enforcement reads `public.organization_membership_permissions` at query time via security-definer helpers below.

**JWT carries only `profile_id` (the `sub` claim).** `public.user_auth_hook` is pass-through — injects nothing. Tenant / organization / agency / onboarding state not embedded in token; resolved from DB at query time via `viewer_*` helpers. Onboarding is UX nudge, not proxy hard gate.

Tenant/organization/agency/onboarding state read from DB → no `refreshSession()` dance after those mutations — take effect immediately. Permission changes likewise DB-backed.

**Use `viewer_*` SQL helpers in RLS policies, not raw JWT parsing:**

DB-resolved (SECURITY DEFINER; query DB directly, not JWT):
- `public.viewer_profile_id()` / `public.viewer_profile()` — current user from `sub` claim (with optional `strict => true`)
- `public.viewer_tenant_ids()` — set of tenant_ids caller belongs to, resolved from DB
- `public.viewer_tenant_validate(tenant_id)` — true iff caller belongs to any org in this tenant
- `public.viewer_organization_ids()` — set of organization_ids caller belongs to, resolved from DB
- `public.viewer_organization_validate(organization_id)` — true iff caller is member of this org
- `public.viewer_agency_ids()` / `public.viewer_is_agency_member()` — agency memberships, resolved from DB

Permission-backed (DB lookup, security definer; wildcard `*` honored):
- `public.viewer_permission_org_ids(permission_id)` — orgs where caller has perm (or `*`). Use in RLS `IN`-subqueries.
- `public.viewer_has_permission(organization_id, permission_id)` — boolean shortcut for single (org, perm) check.
- `public.viewer_organization_membership_permissions()` — setof `(organization_id, permission_id)` for UI listing.
- `public.viewer_permission_tenant_ids(permission_id)` — tenants where caller has perm (or `*`) on **any org in that tenant**. There is no tenant-membership table — tenant authority rides on org grants (the espejo org from `tenant_create` is where `tenant_manage` is granted by default). Use in RLS `IN`-subqueries.
- `public.viewer_has_tenant_permission(tenant_id, permission_id)` — boolean shortcut for a single (tenant, perm) check. Gates the `tenants` UPDATE policy, the `tenants` storage bucket, the company settings layout, and the tenant onboarding RPCs.

## Critical Rules

### Contradicciones entre código y documentación
Si al trabajar en una tarea se detecta una contradicción entre lo que dice el código real y lo que indica `AGENTS.md` o alguna skill propia (`skills/my-*`), **no elegir un camino silenciosamente**. Detener el trabajo, exponer la contradicción al usuario con precisión (archivo:línea del código vs. sección del doc), preguntar qué fuente prevalece, y luego corregir tanto el código como el markdown que resulte incorrecto. La fuente de verdad debe quedar consistente en ambos lados.

### No barrel index files
Never create `index.ts` (or `index.tsx`) whose sole purpose is re-exporting. Import directly from source file.

### Never Use `DROP ... CASCADE`
Critical safety rule for SQL. Always explicit.

### No hyphens in SQL identifiers or enum values
Never use `-` in Postgres identifiers (tables, views, functions, columns, schemas, types) **or in enum values**. Use `snake_case` only — pg_graphql rejects names not matching `[_a-zA-Z0-9]`, which silently breaks entire GraphQL schema introspection. If external spec defines values that won't pass (e.g. WebAuthn's `"public-key"`), store column as `text` with `check` constraint instead of enum — keeps spec literal in DB without breaking pg_graphql.

### plpgsql naming: `_` prefix for DECLARE locals only, not parameters
Inside `declare` blocks, prefix **local variables** with leading underscore (`_user_id`, `_claims`, `_canonical`). Visually disambiguates from column names, avoids ambiguous-reference errors. **Function parameters do NOT get `_` prefix** — write `agency_id`, `profile_id`, `caller_id`, not `_agency_id`, `_profile_id`, `_caller_id`. Follow existing `viewer_*` / `user_auth_hook` style.

### Type Generation
- After Supabase schema changes: `pnpm generate:types` (runs against `@packages/supabase`)
- Never use `as any`

### Imports
- Use `~/` alias for imports within `apps/platform/` (e.g., `~/lib/...`, `~/hooks/...`).
- Workspace packages: `@packages/ui-common`, `@packages/supabase`, `@packages/react-email`, `@packages/react-pdf`, etc.
- App code in `apps/platform/`; reusable logic in `@packages/*`.

### Typed route helpers (Next.js 16) — REQUIRED

**Always use `PageProps<"route">` for `page.tsx`, `LayoutProps<"route">` for `layout.tsx`, `RouteContext<"route">` for `route.ts`.** With `typedRoutes: true` in `next.config.ts`, Next.js generates these as global types under `.next/dev/types/`. Use instead of hand-rolling `{ params: Promise<...> }` — stay in sync with actual file path, so renaming folder fails type-check on next `pnpm build:dry`.

There is **no `locale` route param** — locale comes from a cookie/header, so `params` only ever holds real dynamic segments.

```ts
// page.tsx — dynamic segments come from props.params
export default async function Page(props: PageProps<"/t/[tenant_slug]/[organization_id]">) {
  const { tenant_slug, organization_id } = await props.params;
  const sp = await props.searchParams;
  const tab = SINGLE(sp["tab"]) ?? "";
  // ...
}

// layout.tsx — static route, no params to read
export default async function Layout(props: LayoutProps<"/home">) {
  return <main>{props.children}</main>;
}

// route.ts
export async function GET(request: NextRequest, ctx: RouteContext<"/auth/callback">) {
  // const { ... } = await ctx.params; // only when the route has dynamic segments
  // ...
}
```

`searchParams` typed as `Record<string, string | string[] | undefined>` because URL params can repeat. Narrow with `SINGLE(sp["foo"])` from `@packages/utils/array` to get first value as `string | undefined`.

**Exception:** `page.tsx` or `layout.tsx` not `async` and not accessing `params` or `searchParams` — no typed props needed. But always make `async` if needing any server-side capability.

### Bracket notation for external data
Reading properties off objects from outside program (GraphQL/REST responses, parsed JSON, file contents, webhook payloads, MCP tool results) → use bracket notation, not dot access.

```ts
// External data → brackets
const organization = edge["node"];
const tenantSlug = organization["tenants"]?.["tenant_slug"];
const slug = params["tenant_slug"]; // route params come from the request
const body = await request.json();
const email = body["email"];

// Class instances / library methods → dot
const { data, error } = await supabase.auth.getUser();
const session = await graphy.query({ query: DashboardPageQuery });
```

Brackets mark "this shape is contractual with another system" — distinguishes from class properties/methods owned by program. TypeScript narrowing works through brackets; no type-safety cost. Don't introduce intermediate `.map()`/`.filter()` arrays to extract key — iterate original collection and bracket from there.

**Mock/fixture data counts as external.** Objects from `~/lib/*-mock.ts` (and any fixture standing in for DB rows / API responses) are contractual with future backend — read with brackets too (`agency["name"]`, `aff["email"]`, `org["slug"]`). Destructuring top-level is fine — `const { org } = item` — then bracket leaf reads: `org["name"]`.

### Links — bare paths, never pass `locale`
Locale is **not** a URL segment — the proxy resolves it from a cookie/header. So links are plain paths and **never** carry a locale. Do **not** pass `locale` into `ROUTE`/`ROUTE_HREF` (the helper strips it anyway — see `delete query["locale"]` in `apps/platform/lib/route.ts`), and do **not** thread `locale` / `localePrefix` / a pre-built `base` string from server `page.tsx` into a client component just to build hrefs.

```tsx
// ✅ build hrefs with ROUTE and the real params only — no locale
const inviteHref = ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/new", {
  tenant_slug: agency["slug"],
  organization_id,
});
<Link href={inviteHref}>…</Link>
<Link href={ROUTE("/agencies/create")}>…</Link>

// ❌ never — locale is dead here and gets stripped
<Link href={ROUTE("/agencies/create", { locale })}>…</Link>
```

### i18n dictionaries — each file owns its own copy

Never pass dictionary object as props; never import or export `LOCALES` between files. Each file is sole owner of its strings.

- **Server page** (`page.tsx`): define minimal `LOCALES` with only what `generateMetadata` needs (e.g. `title`, `subtitle`). Use `ROSETTA(LOCALES, locale)` from `~/lib/i18n`.
- **Client component**: define full `LOCALES` at top of file. Use `useRosetta(LOCALES)` from `@packages/rosetta/use-rosetta` inside component — no `dict` prop.
- Sub-components in same file can also call `useRosetta(LOCALES)` directly — `LOCALES` is module-scoped.
- Two files needing same key (e.g. `title`) → each duplicates it. No sharing.
- **`LOCALE_ES` and `LOCALES` always at bottom of file**, after all component/function definitions. Data constants — keep imports and logic at top.

```tsx
// ❌ Never — passing dict as props
export default async function Page() {
  const { t } = await getRosetta(LOCALES);
  const dict = { title: t("title"), ... };
  return <MyClient dict={dict} />;
}

// ✅ Client component owns its strings
"use client";
const LOCALES = { es: { title: "Hola" }, en: { title: "Hello" } satisfies ... };
export function MyClient() {
  const { t } = useRosetta(LOCALES);
  return <h1>{t("title")}</h1>;
}
```

### Multi-step DB writes must be a single SQL RPC

**Never sequence multiple `.from().insert()` / `.from().update()` calls for single logical operation.** Each call is own round-trip and transaction — crash or race between them leaves DB in partial state. Write `security definer` plpgsql function performing read-check + write atomically, call via `.rpc()`.

```ts
// ❌ Race condition: check → insert are separate transactions
const existing = await admin.from("agency_memberships").select(...).maybeSingle();
if (!existing.data) {
  await admin.from("agency_memberships").insert({ agency_id, profile_id });
}

// ✅ Atomic: permission check + upsert in one DB round-trip
const { error } = await admin.rpc("agency_membership_invite", {
  agency_id, profile_id, caller_id: user.id,
});
```

**What moves to SQL vs. stays in TS:**
- DB mutations (insert, update, upsert, permission checks) → SQL RPC, `security definer`
- External side effects (`auth.admin.*`, GoTrue user creation, email send) → stay in action; can't be transactional

**Error convention:** RPCs raise with stable locale key as message:
```sql
raise exception 'already_member' using errcode = 'P0001';
```
Action matches `rpcError.message` against LOCALES keys — never parse prose.

**Client choice:**
- **Service-role client** for RPCs requiring `caller_id` passed explicitly (service role has no JWT `sub`).
- **Authenticated server client** for RPCs calling `viewer_profile_id()` internally (e.g., `actionRespondInvitation`).
- **`useGraphyMutation` directly from client components — the DEFAULT for viewer-scoped mutations.** If an RPC's entire workflow is transactional SQL, calls `viewer_*` helpers internally, and needs no server-only API or secret, expose it through pg_graphql and call it as a GraphQL mutation from the client. **Do NOT wrap it in a Server Action** — a pass-through `action*` that only forwards args to `.rpc()` is an anti-pattern (it adds a network hop, a file, and a serialization boundary for nothing). Reserve Server Actions for workflows that genuinely need the server: a secret/service-role, a non-DB side effect (`auth.admin.*`, email), or `redirect()`/cookie work. Renames, status toggles, onboarding step writes, soft-dismiss, etc. → GraphQL mutation, not an action.
  ```tsx
  // ❌ pass-through action — don't
  export const actionRenameTenant = authedAction.inputSchema(...).action(({ ctx }) => ctx.supabase.rpc("viewer_tenant_update", ...));
  // ✅ GraphQL mutation from the client component
  const [, renameTenant] = useGraphyMutation(UpdateTenantNameMutation);
  const { data, error } = await renameTenant({ tenant_id, tenant_name });
  ```
- **Mutating-RPC return shape + exposure:** viewer-scoped mutating RPCs (`public.viewer_*_create` / `_update` / etc.) return `setof public.<table> rows 1` and are explicitly `volatile` (volatility decides Query vs Mutation in pg_graphql). Leave the default `EXECUTE` grant — `public` already covers `anon`/`authenticated`, and the function self-guards via its internal `viewer_*` permission check, so the `revoke … from public; grant … to anon, authenticated` boilerplate is unnecessary noise. pg_graphql then exposes the function as a singular table object on `Mutation`.
- **Regen workflow after adding/altering an RPC:** edit `schema.sql` → `pnpm db:reset` → `pnpm generate:graphql:schema` (live introspection — **not** `:local`, which only reformats the cached JSON and will silently miss new fields) → `pnpm generate:types`. Then write the `gql()` doc and run `pnpm generate:graphql:platform`.

### SQL / PL/pgSQL style

**Prefer `if / elsif` over consecutive `if … end if; if … end if;` blocks.** Consecutive guards waste lines and force reader to scan more `end if`s. Use `elsif` to chain, or combine with `or` when body is identical:

```sql
-- ❌ Two separate blocks
if public.viewer_profile_id() is null then
  return old;
end if;
if old.permission_id not in ('members_manage', '*') then
  return old;
end if;

-- ✅ Single block, elsif
if public.viewer_profile_id() is null then
  return old;
elsif old.permission_id not in ('members_manage', '*') then
  return old;
end if;

-- ✅ Same action → combine with `or`
if old.organization_membership_revoked_at is not null or new.organization_membership_revoked_at is null then
  return new;
end if;
```

### Code Style
- Biome.js handles formatting/linting — don't fight it
- Follow existing patterns in codebase
- English for code/comments; user-facing strings in locale files (i18n)
- **Pure functions → `UPPER_CASE`**. Pure = deterministic on inputs, no observable side effects (no I/O, no DB/network/filesystem calls, no `redirect()`, no argument mutations, no `Date.now()`/`Math.random()`). Side-effectful or async-with-I/O functions stay `camelCase`. Constants stay `UPPER_CASE`. React components stay PascalCase regardless.
- **Server Actions → `action*` prefix**. Every exported function from `"use server"` file gets `action` prefix (e.g. `actionSetPassword`, `actionUpdateEmail`, `actionDeletePasskey`). Prefix replaces verbs like `set`/`update`/`save`/`do` — write `actionSetPassword`, not `actionDoSetPassword`. Applies to both `next-safe-action` actions and `formAction()` adapters (e.g. `actionSignOutForm`).
- **Named functions, never arrow functions**. Use `function myFn() {}` or `export function myFn() {}`, never `const myFn = () => {}`. Named functions are hoisted, show up in stack traces. Exception: short inline callbacks in `.map()` / `.filter()`.
- **Tailwind: prefer native scale sizes over arbitrary px.** Width/height/size/gap/padding → use scale (`size-5`, `h-9`, `gap-2`) including v4 fractional steps like `size-4.5` (18px) — not arbitrary `h-[18px]`. Typography too: font-size scale (`text-xs`, `text-sm`, `text-2xl`) over `text-[13px]`. Recurring size off scale → add named `@theme` token in `apps/platform/styles/globals.css` (follow `--text-tiny: 0.6875rem` precedent) and use as `text-tiny`. Arbitrary bracket values reserved for things scale and tokens genuinely can't express.
- **Map discriminant to values with keyed lookup, not `let` + `if/else`.** Several values varying together by one key → return from `Record`-typed helper indexed by key — `const head = CONSOLE_HEAD(t)[tab]` — not mutable `let`s reassigned in `if/else if` chain.
- **JSDoc + `@example` for new exports.** Small JSDoc with at least one `@example` on new functions, components, classes, constants. Skip `page.tsx` and `layout.tsx` — framework entry points, not reusable exports.
  ```ts
  /**
   * Builds the full apex URL for the given path.
   * @example APEX_URL("/home") // "https://example.com/home"
   */
  export function APEX_URL(path: string): string { … }
  ```
- **Logging pattern.** Top of each file declare namespaced logger mirroring file's route path:
  ```ts
  const log = debug("app:t:[tenant_slug]:[organization_id]:settings:members:actions")
  ```
  Always call method — `log.error(…)`, `log.warn(…)`, `log.info(…)` — never bare `log(…)`. Always prefix message with `[functionName]` or `[handlerName]`:
  ```ts
  log.error("[actionInviteMember] permission check failed: %o", { organization_id, error })
  ```

### Hooks & Abstractions

**Avoid thin wrappers.** Hook wrapping single SDK call adds noise without clarity. Prefer direct code:

```ts
// ❌ Thin wrapper — unnecessary indirection
function useSetEmail() {
  const [error, setError] = useState(null);
  async function setEmail(email: string) {
    try {
      await supabase.auth.updateUser({ email });
    } catch (e) {
      setError(e.message);
    }
  }
  return { setEmail, error };
}

// ✅ Call SDK directly in the component, handle error in place
async function onSubmit(email: string) {
  try {
    await supabase.auth.updateUser({ email });
  } catch (e) {
    setError(e.message);
  }
}
```

**Encapsulate only when genuinely reusable.** Create hook when:
- Same logic + state pattern repeats across 2+ components
- Reduces boilerplate significantly (e.g., OTP send/verify pair with error/pending state)
- "Headless" hook owning behavior but returning primitives for caller to render

If package already does it (react-use, usehooks-ts, etc.), prefer package. Don't invent.

### Components used only once stay in the same file

Don't extract component to own file unless reused in 2+ places. Single-use components belong inline in page/layout that owns them.

**Exception:** Component long enough to hurt readability of parent (>80 lines) → move to separate file as implementation detail. Comment why: `// Local component — used only in /auth/page.tsx`.

### Lint + Build (run in parallel)
After changes, run these concurrently — independent, safe to parallelize:

```bash
pnpm format:apply-unsafe  # Biome auto-fix including unsafe transforms
pnpm build:dry            # Turbo type-check / build without emitting output
```

**`build:dry` false positives — `PageProps` / `LayoutProps` / `RouteContext` not found:** Globals generated by `next dev` into `.next/dev/types/`. Without running dev server, `build:dry` emits ~40 `Cannot find name 'PageProps'` errors. Expected — not real failures. For clean output, run `pnpm dev` first (writes type files), then `build:dry`.

**New route → run route typegen, don't rely on `pnpm dev`:** after **adding a new route folder** (e.g. `app/oauth/consent/page.tsx`), `tsc`/`build:dry` fails with `Type '"/oauth/consent"' does not satisfy the constraint 'AppRoutes'`. `tsc` reads the **build** route union in `.next/types/routes.d.ts`, which is separate from the dev one in `.next/dev/types/` — a running dev server alone does **not** refresh it. Regenerate it explicitly (same command as the `postinstall` script):

```bash
cd apps/platform && NODE_ENV=development pnpm exec next typegen
```

Then `PageProps<"/new-route">` and the `AppRoutes` union pick up the new path and `build:dry` passes.

### File & Script Naming
Use `noun-verb` order, not `verb-noun`: `skills-setup`, `alert-create`, `user-import`. Domain first, action second.

### Commit Messages
Conventional Commits with scope: `type(scope): description`
- `feat(auth): add passkey registration`
- `fix(proxy): handle subdomain redirect on auth routes`
- `chore(supabase): regenerate types after schema migration`

### Generated Files
Stage normally in git. Ignore when writing commit messages:
- `packages/supabase/src/types.ts` — Supabase DB types

## Testing Strategy

Three layers, each owned by different runner:

| Layer | Runner | Command | Lives in |
|---|---|---|---|
| TypeScript units | Vitest | `pnpm test` (turbo) | `packages/*/src/**/*.test.ts` |
| SQL (RLS, viewer_*, triggers, hook) | pgTAP via `supabase test db` | `pnpm test:db` | `packages/supabase/supabase/tests/**/*.test.sql` |
| End-to-end UI journeys | Playwright + Chromium | `pnpm test:e2e` | `apps/platform/tests/e2e/**/*.spec.ts` |

`pnpm test:db` and `pnpm test:e2e` both run against same local Supabase as `pnpm dev`. pgTAP tests wrap in `begin … rollback` — leave no trace; Playwright provisions/cleans up own users via `auth.admin`. Playwright assumes dev server already running (`pnpm dev`).

Guidelines:
- RLS policies: add pgTAP file under `packages/supabase/supabase/tests/`; mock caller with `set local role authenticated; set local request.jwt.claims to '…';`. Without `set local role`, RLS bypassed silently.
- UI journeys: add Playwright spec under `tests/e2e/journeys/...`. Pre-create users with `CREATE_CONFIRMED_USER` from supabase fixture; clean up in `afterAll`. Don't fight onboarding — not hard gate (see `proxy.ts`); skip via `page.goto` unless testing onboarding itself.

## What NOT to Do

- Don't add new technology without strong justification — stack intentionally familiar
- Don't use tenant slug from reserved-route list (auth, home, tenants, health, …) — schema check in `apps/platform/app/(app)/tenants/create/schemas.ts` + `internal.reserved_slugs` is source of truth
- Don't expect tenant / organization / agency / onboarding state in JWT — hook is pass-through, only `profile_id` (the `sub` claim) carried. Resolve from DB via `viewer_*` helpers or `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server`
- Don't put shadcn components in `apps/platform/` — they belong in `packages/ui-common/src/shadcn`
