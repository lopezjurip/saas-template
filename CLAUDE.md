# Humane — Chilean HR/Payroll Platform

## What This Is

A chat-first HR and payroll platform for Chilean companies (50–250 employees). Competing with Buk.cl by shipping better UX, WhatsApp-native workflows, and embedded legal context — while matching Buk's regulatory compliance moat.

**Read before implementing anything payroll-related:** `docs/04-legal-regulatory-compendium.md` — those rules are authoritative. When in doubt, the compendium wins over any other doc.

**User journeys are the source of truth for product behavior:** `docs/08-user-journeys.md` — 5 roles, 38 journeys. Build journey-by-journey, not feature-by-feature.

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
| API | Server Actions + tRPC (type-safe end-to-end) |
| Database + Auth | Supabase (Postgres + Auth + Storage + Realtime + RLS) |
| ORM | Supabase (generated types via CLI, no Drizzle) |
| WhatsApp agent | Kapso (BSP + conversation state + agent runtime) |
| PDF generation | `@react-pdf/renderer` (in `packages/react-pdf`) |
| Email | Resend + React Email (in `packages/react-email`) |
| Mass payouts | Shinkansen |
| AI | Vercel AI Gateway + Anthropic Claude |
| MCP server | `@modelcontextprotocol/sdk` (TS), exposed at `[tenant_slug]/mcp/` |
| Linting/Formatting | Biome.js 2.x |
| Analytics | PostHog (EU cloud — Ley 21.719 compliance) |
| Hosting | Vercel |

## Architecture

One Next.js app — `apps/platform` — that hosts marketing, auth, dashboard, and tenant surfaces, routed by hostname and URL path. Shared logic lives in `@packages/*`.

```
humane/
├── apps/
│   └── platform/             # @apps/platform — single Next.js app
│       ├── app/
│       │   ├── page.tsx              # / — marketing landing (public)
│       │   ├── health/route.ts       # /health — canonical health check (public)
│       │   ├── auth/                 # /auth/* — sign in/up, callback, logout, onboarding hub + 6 substeps (public)
│       │   ├── home/page.tsx         # /home — post-auth org picker (always shown, no auto-redirect)
│       │   ├── home/account/         # /home/account/[section] — profile, security, sessions, etc.
│       │   ├── tenants/create/       # /tenants/create — new tenant flow
│       │   └── [tenant_slug]/        # /[slug]/* — tenant product (proxy rewrites {slug}.<apex>/* here)
│       │       ├── admin/            # Contadora / HR admin surface (future)
│       │       ├── manager/          # Manager surface (future)
│       │       ├── empleado/         # Employee web surface (future)
│       │       └── mcp/[transport]/  # MCP endpoint (future)
│       ├── proxy.ts          # Routes by host: apex vs {slug}.apex, auth + onboarded + membership gates
│       ├── styles/globals.css
│       └── next.config.ts
│
├── packages/
│   ├── typescript-config/    # @packages/typescript-config — base, nextjs, react-library presets
│   ├── ui-common/            # @packages/ui-common — shadcn primitives (src/shadcn/**) + shared components (src/**)
│   ├── supabase/             # @packages/supabase — client factories + generated types
│   ├── react-email/          # @packages/react-email — Resend email templates
│   ├── react-pdf/            # @packages/react-pdf — PDF templates (liquidaciones, contratos, etc.)
│   └── kapso/                # @packages/kapso — lite Kapso client + types
│
└── docs/                     # Strategy, product spec, legal compendium, user journeys
```

### Package Scopes

- `@apps/*` — apps (currently just `@apps/platform`)
- `@packages/*` — shared packages

### Routing

Hostname determines whether a request enters tenant context:

- `<apex>/...` and `www.<apex>/...` → main site. URL path picks the page (`/`, `/auth/*`, `/home`, `/tenants/create`, `/[tenant_slug]/...`).
- `{slug}.<apex>/...` → `apps/platform/proxy.ts` rewrites to `/{slug}{path}` so the same `[tenant_slug]` route renders. `/auth/*` (which now includes `/auth/onboarding/*`) and `/health` on a subdomain redirect back to the apex so auth lives at one origin.
- Custom apex domains (e.g. `center.burgercool.com`) — phase 2; the proxy currently returns 404. Cookies can't span apexes without an SSO redirect/exchange flow.

Where `<apex>` is `NEXT_PUBLIC_APEX_HOSTNAME` (hostname only) + `process.env.PORT` (assigned per instance). `lvh.me` + `7003` in dev (Conductor reassigns `PORT` for parallel instances), `resolvecom.com` + implicit `443` in prod.

### Auth + onboarding

- `proxy.ts` calls `updateSession` (`@packages/supabase/client.middleware`) to refresh the JWT cookie, then **decodes the JWT directly** to read hook-injected claims. `auth.getUser()` returns the persisted user record without hook claims — always decode `session.access_token` (or use `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server` which does this internally).
- Gates, in order: public path bypass → auth (redirect to `/auth?next=…`, `next` derived from the `Host` header since `request.url` drops the subdomain in Next dev) → for tenant subdomains, membership check against JWT `app_metadata.tenants`. Onboarding completion is **not** a hard gate — it's surfaced via the /home banner.
- Reserved slugs (`auth`, `home`, `tenants`, `health`, `api`, `_next`, `www`, …) are rejected at tenant creation (`apps/platform/app/[locale]/tenants/create/schemas.ts`, enforced by `internal.reserved_slug_validate()` in the DB) so they never collide with first-party routes.

### Local Dev Ports

| Service | Default port | URL |
|---|---|---|
| `apps/platform` | 7003 | https://lvh.me:7003 |
| Supabase Studio | 7100 | http://localhost:7100 |
| Supabase Inbucket (mailbox) | 54424 | http://localhost:54424 |
| `packages/react-email` | 7101 | http://localhost:7101 |
| `packages/react-pdf` | 7102 | http://localhost:7102 |

`lvh.me` is a public wildcard DNS that resolves every name (apex + subdomain) to `127.0.0.1` — no `/etc/hosts` entries needed. Cookies are scoped to `.lvh.me` so the session crosses `lvh.me:7003` ↔ `{slug}.lvh.me:7003`.

### Local HTTPS

`apps/platform` runs over HTTPS in dev (`next dev --experimental-https`) because WebAuthn requires a secure context, and the browser's secure-context allowlist hardcodes the literal strings `localhost` / `127.0.0.1` / `[::1]` — DNS aliases like `lvh.me` that resolve to 127.0.0.1 are NOT on the allowlist, so plain HTTP makes `window.PublicKeyCredential` undefined.

The TLS cert comes from [mkcert](https://github.com/FiloSottile/mkcert). One-time setup:

```bash
bash scripts/development/https-setup.sh
```

That runs `mkcert -install` and emits `apps/platform/certs/lvh.me-{cert,key}.pem` covering `lvh.me`, `*.lvh.me`, `localhost`, and `127.0.0.1`. The dev script in `apps/platform/package.json` references those file paths. `apps/platform/certs/` is gitignored (`**/certs/` in root `.gitignore`).

Keep these aligned with the HTTPS dev origin — flipping any to `http://` will break OAuth callbacks and passkey verification:

- `WEBAUTHN_RELYING_PARTY_ORIGIN` (in `.env.example` + `apps/platform/.env.local`): `https://lvh.me:7003`
- `supabase/config.toml` `[auth].site_url`: `https://lvh.me:7003`
- `supabase/config.toml` `[auth].additional_redirect_urls`: `https://lvh.me:7003/**` + `https://*.lvh.me:7003/**`

`WEBAUTHN_RELYING_PARTY_ID` stays `lvh.me` (host only, no protocol/port). `NEXT_PUBLIC_APEX_HOSTNAME` is `lvh.me` (hostname only); port comes from `process.env.PORT` (Conductor assigns per parallel instance, dev script falls back to 7003); `proxy.ts` derives the protocol from `request.nextUrl.protocol` / `x-forwarded-proto` and builds the full host via `APP_HOST` in `apps/platform/lib/constants.ts`.

After editing `config.toml`, restart Supabase (`pnpm db:stop && pnpm db:start`) so the changes take effect — `pnpm db:reset` also picks them up but wipes data.

## Skills

Agent skills extend Claude Code with reusable capabilities. Installed skills live in `.agents/skills/` (gitignored) and are symlinked into Claude Code automatically.

To install a skill:

```bash
pnpm dlx skills add <registry-url> --skill <skill-name>
```

Example — install the `find-skills` skill from the Vercel Labs registry:

```bash
pnpm dlx skills add https://github.com/vercel-labs/skills --skill find-skills
```

Skills run with full agent permissions — review a skill's source before using it in production.

## `@packages/ui-common`

Shared UI lives in `packages/ui-common`. It has two layers:

- **`src/shadcn/**`** — shadcn/ui primitives + `cn` utility. Managed by the shadcn CLI.
- **`src/**`** — hand-written shared components (e.g. `logo.tsx`, brand-specific UI). One file per component, no barrels.

Conventions:

- Run `pnpm dlx shadcn add <component>` from `packages/ui-common/` to add primitives — they land in `src/shadcn/components/ui/`.
- Import primitives: `import { Button } from "@packages/ui-common/shadcn/components/ui/button"`
- Import `cn`: `import { cn } from "@packages/ui-common/shadcn/lib/utils"`
- Import hand-written components: `import { Logo } from "@packages/ui-common/logo"`
- Each app's `globals.css` imports `../../packages/ui-common/src/shadcn/globals.css` for CSS variables and `@source "../../packages/ui-common/src"` for Tailwind scanning.
- Each app's `next.config.ts` includes `@packages/ui-common` in `transpilePackages`.

## Kapso Integration

`packages/kapso` is a lite client — types and a minimal HTTP client only.
Actual webhook handlers, tool definitions, and agent logic live under `apps/platform/app/` — either as platform-level routes (`apps/platform/app/api/...`) or tenant-scoped routes under `apps/platform/app/[tenant_slug]/...` depending on the surface.

When building Kapso tools:
- Each tool = one user intent (e.g., `get_liquidacion`, `request_vacation`, `team_status`)
- Tools receive structured args from Kapso, return `KapsoToolResponse`
- Kapso formats the response into WhatsApp messages (text, buttons, PDFs)

## MCP Server

Lives at `apps/platform/app/[tenant_slug]/mcp/[transport]/route.ts`. Exposed at `{slug}.<apex>/mcp/` (the proxy rewrites the subdomain into the route segment) or `<apex>/{slug}/mcp/` directly.
Tools to expose: headcount, payroll cost, vacation balances, team status, compliance alerts, employee lookup. Read-only for v1.

## Database Workflow (Prototype Phase)

No incremental migrations yet. All schema lives in a single file: `packages/supabase/supabase/migrations/00000000000000_schema.sql`. To change the schema, edit that file directly and run `pnpm db:reset && pnpm generate:types`. Migrations will be introduced before the first production launch.

- `pnpm db:start` / `pnpm db:stop` — start/stop local Supabase (Docker)
- `pnpm db:reset` — drop everything, replay schema, run seed
- `pnpm generate:types` — regenerate `packages/supabase/src/types.ts` from local DB
- Supabase Studio: `http://127.0.0.1:7100`

## Multi-tenancy & RLS

Two-level model:

- `public.tenants` (int4 serial PK) — the billing / customer relationship. Subdomain `{tenant_slug}.humane.cl` routes to a tenant.
- `public.organizations` (int4 serial PK, FK to tenants) — the actual operating unit. Most tenants have exactly one organization that mirrors the tenant; large companies have several (e.g. one per country / branch).
- `public.memberships(organization_id, profile_id)` — users belong to organizations, not directly to tenants. No `role` column — access is permission-based (see below). The set of tenants a user can access is derived from the tenants of their organizations.

Every tenant-scoped data table carries denormalized `tenant_id int` (cheap to filter, cheap in indexes) and, when data is org-scoped, also `organization_id int`. Supabase RLS enforces isolation at the DB layer — never rely on application-level filtering alone.

**Active tenant comes from the subdomain or first path segment.** `apps/platform/proxy.ts` resolves `{tenant_slug}.<apex>` via the service-role client, validates membership against the JWT, and **rewrites** the URL to `/{tenant_slug}/...` — every tenant route lives under `app/[tenant_slug]/...` and reads the slug from route `params`. Path-segment access (`<apex>/{tenant_slug}/...`) works too without any rewrite. Pages derive `tenant_id` from the JWT `app_metadata.tenants` claim (slug→id mapping); no `x-tenant-*` headers. Server-side queries must explicitly `.eq("tenant_id", ...)` with that value. Org switching happens inside the app (per-tab or per-session selection).

**Custom domain mapping (`public.tenant_domains`, 1:1 with tenants)** is staged in the schema but not yet wired into the proxy — phase 2. `tenant_tier` (`free` / `pro` / `enterprise`) gates these advanced features once billing exists.

**Permissions (capability-based, not role-based):**
- `public.permissions(permission_id citext PK)` — catalog of atomic capability slugs (`organization_manage`, `members_manage`, `payroll_run`, `vacations_approve`, etc.). The reserved slug `*` is the wildcard — anyone holding `(org, profile, '*')` passes every permission check inside that org. Used for the tenant creator and other "full admin" grants without needing to enumerate every slug.
- `public.membership_permissions(organization_id, profile_id, permission_id)` — explicit grants. Composite FK back to `memberships` so deleting a membership cascades. PK `(org, profile, permission)` + secondary index `(profile, permission)` cover both "does X have perm Y in org Z" and the cross-org "what orgs grant perm Y to X" lookups.
- `public.permission_presets(id, organization_id?, name, slugs[])` — UX-only catalog of named bundles for the admin UI; carries no enforcement. `organization_id IS NULL` = global preset (seeded: Dueño / Contadora / Manager / Empleado); non-null = tenant-specific custom bundle. A trigger validates every slug in `permission_preset_slugs` exists in the catalog.

Permissions are deliberately NOT in the JWT (size, and they change at runtime). All enforcement reads `public.membership_permissions` at query time via the security-definer helpers below.

**JWT carries two arrays** (`public.user_auth_hook` on token issuance):
- `app_metadata.tenants: [{id, slug}]` — distinct tenants the user has any org membership in
- `app_metadata.organizations: [{id}]` — every organization the user is a member of (no role)

Plus `app_metadata.is_concierge: boolean` for the global internal role and `app_metadata.onboarded: boolean` for the onboarding gate.

After any `memberships` / `membership_permissions` (or `tenants` / `organizations`) mutation, call `supabase.auth.refreshSession()` so the client picks up the new claims; for revocations also call `supabase.auth.admin.signOut(profile_id)` server-side.

**Use the `viewer_*` SQL helpers in RLS policies, not raw JWT parsing:**

JWT-backed (fast, no DB):
- `public.viewer_profile_id()` / `public.viewer_profile()` — current user (with optional `strict => true`)
- `public.viewer_tenant_ids()` — set of tenant_ids from JWT
- `public.viewer_tenant_validate(tenant_id)` — true iff caller belongs to any org in this tenant
- `public.viewer_organization_ids()` — set of organization_ids from JWT
- `public.viewer_organization_validate(organization_id)` — true iff caller is a member of this org
- `public.viewer_is_concierge()` — global internal role

Permission-backed (DB lookup, security definer; wildcard `*` is honored):
- `public.viewer_permission_org_ids(permission_id)` — orgs where the caller has the perm (or `*`). Use this in RLS `IN`-subqueries.
- `public.viewer_has_permission(organization_id, permission_id)` — boolean shortcut for a single (org, perm) check.
- `public.viewer_membership_permissions()` — setof `(organization_id, permission_id)` for UI listing.

Concierge is global and lives in `protected.concierges` (service-role only).

## User Roles

5 product personas, each with a distinct surface. These are UX/product labels, **not** DB-enforced enum values — access is gated by individual permission slugs in `membership_permissions`. The seeded global `permission_presets` (Dueño / Contadora / Manager / Empleado) map these personas to bundles for the admin UI.

| Role | Count/company | Primary UI | Key journeys |
|---|---|---|---|
| **Empleado** | 50–250 | WhatsApp | Liquidaciones, vacaciones, certificados, firma, asistencia |
| **Manager** | 5–30 | WhatsApp + Web | Aprobar vacaciones (with legal context), team status, evaluaciones, turnos |
| **Contadora/HR** | 1–3 | Web | Payroll cycle, Previred, LRE, banco nómina, finiquitos, compliance dashboard |
| **Dueño/CEO** | 1 | Web + WhatsApp digest | Costo nómina, aprobar pagos, métricas rotación |
| **Concierge** | internal | `apps/platform` internal routes | Migrations, legal edge cases, regulatory updates |

The **Manager** surface is NOT a smaller admin console — it's opinionated, mobile-first, designed for someone who never wanted to be in an HR system. Embedded legal coaching (Art. 66, 66 bis, 159, 160, 161) inline in every decision.

## Chilean Labor Law — Critical Rules for Code

**Never hardcode these values.** Read from `topes_imponibles_history` table (seeded monthly):
- UF (daily), UTM (monthly), IMM (annual negotiation), tope imponible (89.1 UF), AFP rates per fund

**Key articles you'll encounter in code:**
- Art. 44: Sueldo mínimo
- Art. 45: Semana corrida
- Art. 50: Gratificación legal
- Art. 66: Permisos matrimonio (5 días, mandatory)
- Art. 66 bis: Duelo (3–7 días by parentesco, mandatory)
- Art. 67–68: Vacaciones (15 días hábiles/año + progresivas after 10 years)
- Art. 159–161: Causales de término (different indemnización rules per causal)
- Art. 163: Indemnización por años de servicio (1 month per year, cap 11)
- Art. 195–199: Fuero maternal
- Ley Bustos: If finiquito payment is late, sueldo keeps running

When implementing any termination/finiquito flow: always check fuero (maternal, sindical, edad). If fuero exists, block the action and explain why.

**Cross-reference `docs/04-legal-regulatory-compendium.md` for the full regulatory reference.**

## Payroll Calculation Flow

```
Novedades (attendance, overtime, licencias, vacaciones)
  → Cálculo bruto (base + gratificación + bonos + semana corrida)
  → Descuentos legales (AFP + Salud + Seguro Cesantía)
  → Descuentos voluntarios (APV, préstamos)
  → Impuesto Único (tramos, apply after descuentos previsionales)
  → Líquido
  → Generate: Liquidación PDF, Previred CSV, LRE CSV, Banco Nómina (Shinkansen)
```

## Critical Rules

### No barrel index files
Never create an `index.ts` (or `index.tsx`) whose sole purpose is re-exporting from other files. Import directly from the source file instead.

### Never Use `DROP ... CASCADE`
Critical safety rule for SQL. Always explicit.

### No hyphens in SQL identifiers or enum values
Never use `-` in Postgres identifiers (tables, views, functions, columns, schemas, types) **or in enum values**. Use `snake_case` only — pg_graphql rejects names that don't match `[_a-zA-Z0-9]`, which silently breaks the entire GraphQL schema introspection (not just the offending object). If an external spec defines values that won't pass that constraint (e.g. WebAuthn's `"public-key"`), store the column as `text` with a `check` constraint instead of an enum — that keeps the spec literal in the DB without breaking pg_graphql.

### plpgsql local variables prefixed with `_`
Inside `declare` blocks in plpgsql functions/triggers, prefix local variables with a leading underscore (`_user_id`, `_claims`, `_canonical`). It visually disambiguates them from column names, parameters, and reserved words, and avoids ambiguous-reference errors when a variable shares a name with a column in a query inside the function body. Follow the existing `viewer_*` / `user_auth_hook` style.

### Type Generation
- After Supabase schema changes: `pnpm generate:types` (runs against `@packages/supabase`)
- Never use `as any`

### Imports
- Use `~/` alias for imports within `apps/platform/` (e.g., `~/lib/...`, `~/hooks/...`).
- Workspace packages: `@packages/ui-common`, `@packages/supabase`, `@packages/kapso`, `@packages/react-email`, `@packages/react-pdf`.
- App code lives in `apps/platform/`; reusable logic belongs in `@packages/*`.

### Typed route helpers (Next.js 16) — REQUIRED

**Always use `PageProps<"route">` for `page.tsx`, `LayoutProps<"route">` for `layout.tsx`, and `RouteContext<"route">` for `route.ts`.** With `typedRoutes: true` in `next.config.ts`, Next.js generates these as global types under `.next/dev/types/`. Use them instead of hand-rolling `{ params: Promise<...> }` — they stay in sync with the actual file path, so renaming a folder fails the type-check the next time we run `pnpm build:dry`.

```ts
// page.tsx
export default async function Page(props: PageProps<"/[locale]/auth/email/login">) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  const email = SINGLE(sp["email"]) ?? "";
  // ...
}

// layout.tsx
export default async function Layout(props: LayoutProps<"/[locale]/home">) {
  const { locale } = await props.params;
  return <main>{props.children}</main>;
}

// route.ts
export async function GET(request: NextRequest, ctx: RouteContext<"/[locale]/auth/callback">) {
  const { locale } = await ctx.params;
  // ...
}
```

`searchParams` is typed as `Record<string, string | string[] | undefined>` because URL params can repeat. Narrow with `SINGLE(sp["foo"])` from `@packages/utils/array` to get the first value as a plain `string | undefined`.

**Exception:** If a `page.tsx` or `layout.tsx` is not `async` and doesn't access `params` or `searchParams`, you don't need typed props — but always make them `async` if you need any server-side capability.

### Bracket notation for external data
When reading properties off objects that originated outside the program (GraphQL/REST responses, parsed JSON, file contents, webhook payloads, MCP tool results), use bracket notation — not dot access.

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

This is a deliberate visual cue: brackets mark "this shape is contractual with another system" so a reader can distinguish it from class properties/methods owned by the program. TypeScript narrowing still works through brackets, so there's no type-safety cost. Don't introduce intermediate `.map()`/`.filter()` arrays just to extract a key — iterate the original collection and bracket from there.

### Code Style
- Biome.js handles formatting/linting — don't fight it
- Follow existing patterns in the codebase
- Chilean Spanish for user-facing strings, English for code/comments
- **Pure functions → `UPPER_CASE`**. A pure function is deterministic on its inputs and has no observable side effects (no I/O, no DB/network/filesystem calls, no `redirect()`, no mutations of arguments, no `Date.now()`/`Math.random()`). Side-effectful or async-with-I/O functions stay `camelCase`. Constants stay `UPPER_CASE` as before. The visual cue is the same idea as bracket notation: at a glance, a caller can tell whether the function is safe to call repeatedly with no observable effect (`SLUGIFY(name)`, `RESOLVE_STEP(state, step)`) vs. one that touches the world (`loadOnboardingState()`, `createTenant(...)`). React components stay PascalCase regardless.
- **Server Actions → `action*` prefix**. Every exported function from a `"use server"` file gets the `action` prefix (e.g. `actionSetPassword`, `actionUpdateEmail`, `actionDeletePasskey`). Same visual-cue motivation as bracket notation and `UPPER_CASE`: a caller seeing `actionSetPassword(...)` immediately knows it crosses the network into a server roundtrip, without having to chase imports or re-read `"use server"` directives. The prefix replaces verbs like `set`/`update`/`save`/`do` — write `actionSetPassword`, not `actionDoSetPassword`. Applies to both `next-safe-action` actions and `formAction()` adapters (e.g. `actionSignOutForm`).
- **Named functions, never arrow functions**. Use `function myFn() {}` or `export function myFn() {}`, never `const myFn = () => {}`. Named functions are hoisted (can call before declaration), show up clearly in stack traces, and are clearer to read. The only exception: short inline callbacks in `.map()` / `.filter()` where clarity is obvious from context.

### Hooks & Abstractions

**Avoid thin wrappers.** A hook that just wraps a single SDK call or state setter adds noise without clarity. Prefer direct code:

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

**Encapsulate only when genuinely reusable.** Create a hook when:
- The same logic + state pattern repeats across 2+ components
- It reduces boilerplate significantly (e.g., OTP send/verify pair with error/pending state)
- It's a "headless" hook that owns behavior but returns primitives for the caller to render

Examples:
- `useOnboardingEmailOtp()` — reused across email form in login + onboarding. ✅
- `useClipboardCopy()` — just wraps `navigator.clipboard`. Use `react-use` or similar instead. ❌

If a package already does it (react-use, usehooks-ts, etc.), prefer the package. Don't invent.

### Components used only once stay in the same file

Don't extract a component to its own file unless it's reused in 2+ places. Single-use components belong inline in the page/layout that owns them.

**Why:** File proliferation = cognitive overhead (which file is it in? is it truly unreused?), needless indirection, and permission bloat in imports.

**Exception:** If a component is long enough to hurt readability of its parent (>80 lines), move it to a separate file as an implementation detail. Comment why: `// Local component — used only in /auth/page.tsx`.

### Lint + Build (run in parallel)
After making changes, run these two commands concurrently — they are independent and safe to parallelize:

```bash
pnpm format:apply-unsafe  # Biome auto-fix including unsafe transforms
pnpm build:dry            # Turbo type-check / build without emitting output
```

### Commit Messages
Conventional Commits with scope: `type(scope): description`
- `feat(payroll): add semana corrida calculation`
- `fix(kapso): handle expired WhatsApp session`
- `chore(supabase): regenerate types after schema migration`

### Generated Files
Stage normally in git. Ignore when writing commit messages:
- `packages/supabase/src/types.ts` — Supabase DB types

## Testing Strategy

Three layers, each owned by a different runner:

| Layer | Runner | Command | Lives in |
|---|---|---|---|
| TypeScript units | Vitest | `pnpm test` (turbo) | `packages/*/src/**/*.test.ts` |
| SQL (RLS, viewer_*, triggers, hook) | pgTAP via `supabase test db` | `pnpm test:db` | `packages/supabase/supabase/tests/**/*.test.sql` |
| End-to-end UI journeys | Playwright + Chromium | `pnpm test:e2e` | `apps/platform/tests/e2e/**/*.spec.ts` |

`pnpm test:db` and `pnpm test:e2e` both run against the same local Supabase as `pnpm dev`. The pgTAP tests wrap themselves in `begin … rollback` so they leave no trace; Playwright provisions/cleans up its own users via `auth.admin`. Playwright assumes a dev server is already running (`pnpm dev`).

Guidelines:
- Payroll calculations: unit tests with known inputs/outputs from `04-legal-regulatory-compendium.md`.
- Run parallel calculations against Buk output during migration (internal ops validates).
- Every new regulatory rule gets a test case before the implementation.
- RLS policies: add a pgTAP file under `packages/supabase/supabase/tests/`; mock the caller with `set local role authenticated; set local request.jwt.claims to '…';`. Without `set local role`, RLS is bypassed silently.
- User journeys (`docs/08-user-journeys.md`): add a Playwright spec under `tests/e2e/journeys/{role}/...`. Pre-create users with `CREATE_CONFIRMED_USER` from the supabase fixture; clean up in `afterAll`. Don't fight onboarding — it's not a hard gate (see `proxy.ts:161-164`); skip it via `page.goto` unless you're testing onboarding itself.

## What NOT to Do

- Don't add new technology without strong justification — the stack is intentionally familiar
- Don't build HR-org navigation for managers — their surface is opinionated, not a mini-admin
- Don't skip legal context in approval flows — inline Art. references are a core differentiator
- Don't hardcode regulatory values — they change monthly/yearly
- Don't process payroll without checking `04-legal-regulatory-compendium.md` first
- Don't use a tenant slug from a reserved-route list (auth, home, tenants, health, …) — the schema check in `apps/platform/app/[locale]/tenants/create/schemas.ts` + `internal.reserved_slugs` is the source of truth
- Don't read `app_metadata.tenants` / `onboarded` from `auth.getUser()` — those claims live in the JWT only. Use `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server` (or decode `session.access_token` directly in middleware)
- Don't put shadcn components in `apps/platform/` — they belong in `packages/ui-common/src/shadcn`
