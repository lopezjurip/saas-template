# SaaS Template — Multi-tenant SaaS Starter

## What This Is

A production-grade starter for building a multi-tenant SaaS. It ships with the hard parts
already wired together: authentication (email/password, OAuth, phone OTP, WebAuthn passkeys),
two-level multi-tenancy with Postgres RLS, capability-based permissions, an agency/affiliate
surface for cross-tenant partner access, i18n, React Email/PDF template packages, and a
shadcn-based design system — all in a Turborepo monorepo.

Reusable infrastructure (`packages/*`, auth, tenancy, routing, permissions, and the
**agency/affiliate** surface — a generic B2B pattern for partners/resellers/firms that work
across multiple customer tenants) is meant to be kept. The **HR/payroll-style tenant surface**
is just an example product implementation of these patterns — replace it with your own.

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
| API | Server Actions + typed `pg_graphql` operations |
| Database + Auth | Supabase (Postgres + Auth + Storage + Realtime + RLS) |
| ORM | Supabase (generated types via CLI, no Drizzle) |
| GraphQL | `pg_graphql` + a typed client (`@packages/graphy`) |
| PDF generation | `@react-pdf/renderer` (in `packages/react-pdf`) |
| Email templates | React Email (in `packages/react-email`; delivery not wired) |
| i18n | `@packages/rosetta` + `[locale]` route segment |
| Linting/Formatting | Biome.js 2.x |
| Hosting | Vercel |

> Optional integrations included as examples: `@packages/kapso` (WhatsApp BSP). Remove the
> ones you don't need.

## Architecture

One Next.js app — `apps/platform` — that hosts marketing, auth, dashboard, and tenant surfaces,
routed by hostname and URL path. Shared logic lives in `@packages/*`.

```
<repo>/
├── apps/
│   └── platform/             # @apps/platform — single Next.js app
│       ├── app/
│       │   ├── health/route.ts       # /health — canonical health check (public)
│       │   └── [locale]/
│       │       ├── (marketing)/      # /{locale} — public landing, FAQ, pricing, legal
│       │       ├── auth/             # /{locale}/auth/* — auth + onboarding
│       │       ├── home/             # /{locale}/home — org picker + account
│       │       ├── tenants/create/   # /{locale}/tenants/create
│       │       └── [tenant_slug]/    # /{locale}/{slug}/* tenant product
│       ├── proxy.ts          # Locale, host routing, session, auth, tenant membership gates
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

Hostname determines whether a request enters tenant context:

- `<apex>/...` and `www.<apex>/...` → main site. Proxy adds the locale segment when missing.
- `{slug}.<apex>/...` → proxy rewrites to `/{locale}/{slug}{path}` so the same `[tenant_slug]` route renders. `/auth/*` and `/health` on a subdomain redirect to the apex.
- Custom apex domains — phase 2; unknown hosts currently redirect to the configured apex. Cookies can't span apexes without an SSO redirect/exchange flow.

Where `<apex>` is `NEXT_PUBLIC_APEX_HOSTNAME` (hostname only) + `process.env.PORT` (assigned per instance). `lvh.me` + `7003` in dev (Conductor reassigns `PORT` for parallel instances), `example.com` + implicit `443` in prod.

### Auth + onboarding

- `proxy.ts` calls `updateSession` (`@packages/supabase/client.middleware`) to refresh the JWT cookie, then **decodes the JWT directly** to read hook-injected claims. `auth.getUser()` returns the persisted user record without hook claims — always decode `session.access_token` (or use `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server` which does this internally).
- Gates, in order: public path bypass → auth (redirect to `/auth?next=…`, `next` derived from the `Host` header since `request.url` drops the subdomain in Next dev) → for tenant subdomains, membership check against JWT `app_metadata.tenants`. Onboarding completion is **not** a hard gate — it's surfaced via the /home banner.
- Reserved slugs (`auth`, `home`, `tenants`, `health`, `api`, `_next`, `www`, …) are rejected at tenant creation (`apps/platform/app/[locale]/tenants/create/schemas.ts`, enforced by `internal.reserved_slug_validate()` in the DB) so they never collide with first-party routes.
- **Public paths in proxy:** when adding new marketing pages (e.g., `/faq`, `/pricing`), update `PUBLIC_PATH_REGEX` in `apps/platform/proxy.ts` to avoid auth gate. Regex matches root + any route under `/auth`, `/legal`, plus exact matches.

### Reserved Slugs

Reserved slugs are seeded in `packages/supabase/supabase/seed.sql` and cached per-request in `apps/platform/lib/get-tenant-reserved-slugs.ts` using React's `cache()`. The cache deduplicates queries within a single request; new/changed slugs are picked up on the next request automatically.

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

Agent skill sources live in `skills/my-*`. `pnpm install` runs `scripts/skills-setup.js`, which
symlinks them into `.agents/skills/` and `.claude/skills/`. Read the relevant skill before
working in that subsystem.

To install a third-party skill:

```bash
pnpm dlx skills add <registry-url> --skill <skill-name>
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

## MCP Status

`@modelcontextprotocol/sdk` is installed in `apps/platform`, but no MCP route is currently
implemented. Do not document or expose an endpoint until a tenant-scoped route and auth model
exist.

## Database Workflow (Prototype Phase)

No incremental migrations yet. All schema lives in a single file: `packages/supabase/supabase/migrations/00000000000000_schema.sql`. To change the schema, edit that file directly and run `pnpm db:reset && pnpm generate:types`. Migrations will be introduced before the first production launch.

- `pnpm db:start` / `pnpm db:stop` — start/stop local Supabase (Docker)
- `pnpm db:reset` — drop everything, replay schema, run seed
- `pnpm generate:types` — regenerate `packages/supabase/src/types.ts` from local DB
- Supabase Studio: `http://127.0.0.1:7100`

## Multi-tenancy & RLS

Two-level model:

- `public.tenants` (int4 serial PK) — the billing / customer relationship. Subdomain `{tenant_slug}.example.com` routes to a tenant.
- `public.organizations` (int4 serial PK, FK to tenants) — the actual operating unit. Most tenants have exactly one organization that mirrors the tenant; large companies have several (e.g. one per country / branch).
- `public.memberships(membership_id, organization_id, profile_id, lifecycle timestamps, invite fields)` — users belong to organizations, not directly to tenants. No `role` column — access is permission-based. Pending invitations and active memberships share this table.

Every tenant-scoped data table carries denormalized `tenant_id int` (cheap to filter, cheap in indexes) and, when data is org-scoped, also `organization_id int`. Supabase RLS enforces isolation at the DB layer — never rely on application-level filtering alone.

**Active tenant comes from the subdomain or locale-prefixed path segment.** `apps/platform/proxy.ts` resolves `{tenant_slug}.<apex>` via the service-role client, validates membership against the JWT, and **rewrites** the URL to `/{locale}/{tenant_slug}/...` — every tenant route lives under `app/[locale]/[tenant_slug]/...`. Path access (`<apex>/{locale}/{tenant_slug}/...`) works without a host rewrite. Pages use viewer-scoped GraphQL helpers or derive `tenant_id` from validated JWT metadata; no `x-tenant-*` headers. Direct table queries must explicitly filter `tenant_id`.

**Custom domain mapping (`public.tenant_domains`, many domains per tenant)** is staged in the schema but not yet wired into the proxy — phase 2. `tenant_tier` (`free` / `pro` / `enterprise`) gates advanced features once billing exists.

**Permissions (capability-based, not role-based):**
- `public.permissions(permission_id citext PK)` — catalog of atomic capability slugs (`organization_manage`, `members_manage`, etc.). The reserved slug `*` is the wildcard — a membership holding `*` passes every permission check inside its organization. Used for the tenant creator and other "full admin" grants without enumerating every slug.
- `public.membership_permissions(membership_id, permission_id)` — explicit grants. Organization/profile derive through the membership row. The composite PK prevents duplicate grants and deletion cascades from memberships.
- `public.permission_presets(permission_preset_id, organization_id?, permission_preset_name, permission_preset_slugs[])` — UX-only named bundles; carries no enforcement. `organization_id IS NULL` = global preset. A trigger validates every slug.

Permissions are deliberately NOT in the JWT (size, and they change at runtime). All enforcement reads `public.membership_permissions` at query time via the security-definer helpers below.

**JWT carries three arrays** (`public.user_auth_hook` on token issuance):
- `app_metadata.tenants: [{id, slug}]` — distinct tenants the user has any org membership in
- `app_metadata.organizations: [{id, tenant_id}]` — every active organization membership
- `app_metadata.agencies: [{id}]` — every active agency affiliation

Plus `app_metadata.onboarded: boolean`. Onboarding is a UX nudge, not a proxy hard gate.

After mutations affecting tenant, organization, agency, or onboarding claims, call `supabase.auth.refreshSession()`. Permission-only changes are DB-backed and take effect without new JWT claims.

**Use the `viewer_*` SQL helpers in RLS policies, not raw JWT parsing:**

JWT-backed (fast, no DB):
- `public.viewer_profile_id()` / `public.viewer_profile()` — current user (with optional `strict => true`)
- `public.viewer_tenant_ids()` — set of tenant_ids from JWT
- `public.viewer_tenant_validate(tenant_id)` — true iff caller belongs to any org in this tenant
- `public.viewer_organization_ids()` — set of organization_ids from JWT
- `public.viewer_organization_validate(organization_id)` — true iff caller is a member of this org
- `public.viewer_agency_ids()` / `public.viewer_is_agency_member()` — agency claims

Permission-backed (DB lookup, security definer; wildcard `*` is honored):
- `public.viewer_permission_org_ids(permission_id)` — orgs where the caller has the perm (or `*`). Use this in RLS `IN`-subqueries.
- `public.viewer_has_permission(organization_id, permission_id)` — boolean shortcut for a single (org, perm) check.
- `public.viewer_membership_permissions()` — setof `(organization_id, permission_id)` for UI listing.

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
- Workspace packages: `@packages/ui-common`, `@packages/supabase`, `@packages/react-email`, `@packages/react-pdf`, etc.
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

**Mock/fixture data counts as external.** Objects from `~/lib/*-mock.ts` (and any fixture standing in for DB rows / API responses) are contractual with a future backend — read them with brackets too (`agency["name"]`, `aff["email"]`, `org["slug"]`), even though they're typed in-program consts today. When the mock becomes a real query, the access sites already match. (Destructuring the top-level object is still fine — `const { org } = item` — then bracket the leaf reads: `org["name"]`.)

### Locale-prefixed links — use the `/[locale]/…` sentinel
Client-side hrefs that need the active locale must use the **literal** `/[locale]/…` sentinel. `proxy.ts` rewrites `/[locale]/…` to the real locale on the way through (the same mechanism the server-side `redirect("/[locale]/auth")` calls rely on). Do **not** thread `locale` / `localePrefix` / a pre-built `base` string from a server `page.tsx` into a client component just to build links — build the href inside the component with the sentinel:

```tsx
// ✅ client component — no locale prop threaded in
const inviteHref = `/[locale]/admin/agencies/${agency["slug"]}/affiliates/new`;
<Link href={inviteHref}>…</Link>
<Link href="/[locale]/agencies/create">…</Link>
```

### i18n dictionaries — each file owns its own copy

Never pass a dictionary object as props, and never import or export `LOCALES` between files. Each file is the sole owner of its strings.

- **Server page** (`page.tsx`): define its own minimal `LOCALES` with only what `generateMetadata` needs (e.g. `title`, `subtitle`). Use `ROSETTA(LOCALES, locale)` from `~/lib/i18n`.
- **Client component**: define its own full `LOCALES` at the top of the file. Use `useRosetta(LOCALES)` from `@packages/rosetta/use-rosetta` inside the component — no `dict` prop.
- Sub-components in the same file can also call `useRosetta(LOCALES)` directly — `LOCALES` is module-scoped.
- If two files need the same key (e.g. `title`), each duplicates it. No sharing.

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

### SQL / PL/pgSQL style

**Prefer `if / elsif` over consecutive `if … end if; if … end if;` blocks.** Consecutive guards with separate `end if; if` pairs waste lines and force the reader to scan more `end if`s. Use `elsif` to chain them, or combine with `or` when the body is identical:

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
if old.membership_revoked_at is not null or new.membership_revoked_at is null then
  return new;
end if;
```

### Code Style
- Biome.js handles formatting/linting — don't fight it
- Follow existing patterns in the codebase
- English for code/comments; keep user-facing strings in your product's locale files (i18n)
- **Pure functions → `UPPER_CASE`**. A pure function is deterministic on its inputs and has no observable side effects (no I/O, no DB/network/filesystem calls, no `redirect()`, no mutations of arguments, no `Date.now()`/`Math.random()`). Side-effectful or async-with-I/O functions stay `camelCase`. Constants stay `UPPER_CASE` as before. The visual cue is the same idea as bracket notation: at a glance, a caller can tell whether the function is safe to call repeatedly with no observable effect (`SLUGIFY(name)`, `RESOLVE_STEP(state, step)`) vs. one that touches the world (`loadOnboardingState()`, `createTenant(...)`). React components stay PascalCase regardless.
- **Server Actions → `action*` prefix**. Every exported function from a `"use server"` file gets the `action` prefix (e.g. `actionSetPassword`, `actionUpdateEmail`, `actionDeletePasskey`). Same visual-cue motivation as bracket notation and `UPPER_CASE`: a caller seeing `actionSetPassword(...)` immediately knows it crosses the network into a server roundtrip, without having to chase imports or re-read `"use server"` directives. The prefix replaces verbs like `set`/`update`/`save`/`do` — write `actionSetPassword`, not `actionDoSetPassword`. Applies to both `next-safe-action` actions and `formAction()` adapters (e.g. `actionSignOutForm`).
- **Named functions, never arrow functions**. Use `function myFn() {}` or `export function myFn() {}`, never `const myFn = () => {}`. Named functions are hoisted (can call before declaration), show up clearly in stack traces, and are clearer to read. The only exception: short inline callbacks in `.map()` / `.filter()` where clarity is obvious from context.
- **Tailwind: prefer native scale sizes over arbitrary px.** For width/height/size/gap/padding use the scale (`size-5`, `h-9`, `gap-2`) — including v4 fractional steps like `size-4.5` (18px) — instead of arbitrary `h-[18px]` / `w-[18px]`. Arbitrary bracket values are reserved for things the scale genuinely can't express. (Exact-px typography from a design spec is the accepted exception; the rule targets box sizing.)
- **Map a discriminant to values with a keyed lookup, not `let` + `if/else`.** When several values vary together by one key (a tab, a status, a kind), return them from a `Record`-typed helper indexed by the key — `const head = CONSOLE_HEAD(t)[tab]` — rather than declaring mutable `let`s and reassigning them in an `if/else if` chain.
- **Logging pattern.** At the top of each file declare a namespaced logger whose name mirrors the file's route path:
  ```ts
  const log = debug("app:[locale]:t:[tenant_slug]:[organization_id]:settings:members:actions")
  ```
  Always call a method — `log.error(…)`, `log.warn(…)`, `log.info(…)` — never bare `log(…)`. Always prefix the message with `[functionName]` or `[handlerName]`:
  ```ts
  log.error("[actionInviteMember] permission check failed: %o", { organization_id, error })
  ```

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

**`build:dry` false positives — `PageProps` / `LayoutProps` / `RouteContext` not found:** These globals are generated by `next dev` into `.next/dev/types/`. Without a running dev server, `build:dry` emits ~40 `Cannot find name 'PageProps'` (and related) errors. Expected — not real failures. To get clean output, run `pnpm dev` first (writes the type files), then `build:dry`.

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

Three layers, each owned by a different runner:

| Layer | Runner | Command | Lives in |
|---|---|---|---|
| TypeScript units | Vitest | `pnpm test` (turbo) | `packages/*/src/**/*.test.ts` |
| SQL (RLS, viewer_*, triggers, hook) | pgTAP via `supabase test db` | `pnpm test:db` | `packages/supabase/supabase/tests/**/*.test.sql` |
| End-to-end UI journeys | Playwright + Chromium | `pnpm test:e2e` | `apps/platform/tests/e2e/**/*.spec.ts` |

`pnpm test:db` and `pnpm test:e2e` both run against the same local Supabase as `pnpm dev`. The pgTAP tests wrap themselves in `begin … rollback` so they leave no trace; Playwright provisions/cleans up its own users via `auth.admin`. Playwright assumes a dev server is already running (`pnpm dev`).

Guidelines:
- RLS policies: add a pgTAP file under `packages/supabase/supabase/tests/`; mock the caller with `set local role authenticated; set local request.jwt.claims to '…';`. Without `set local role`, RLS is bypassed silently.
- UI journeys: add a Playwright spec under `tests/e2e/journeys/...`. Pre-create users with `CREATE_CONFIRMED_USER` from the supabase fixture; clean up in `afterAll`. Don't fight onboarding — it's not a hard gate (see `proxy.ts`); skip it via `page.goto` unless you're testing onboarding itself.

## What NOT to Do

- Don't add new technology without strong justification — the stack is intentionally familiar
- Don't use a tenant slug from the reserved-route list (auth, home, tenants, health, …) — the schema check in `apps/platform/app/[locale]/tenants/create/schemas.ts` + `internal.reserved_slugs` is the source of truth
- Don't read `app_metadata.tenants` / `onboarded` from `auth.getUser()` — those claims live in the JWT only. Use `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server` (or decode `session.access_token` directly in middleware)
- Don't put shadcn components in `apps/platform/` — they belong in `packages/ui-common/src/shadcn`
