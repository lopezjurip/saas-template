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
| MCP server | `@modelcontextprotocol/sdk` (TS), exposed in `apps/tenant` |
| Linting/Formatting | Biome.js 2.x |
| Analytics | PostHog (EU cloud — Ley 21.719 compliance) |
| Hosting | Vercel |

## Architecture

3 separate Next.js apps + shared packages. Each app deploys independently on Vercel.

```
humane/
├── apps/
│   ├── landing/              # @apps/landing — www.humane.cl — marketing site
│   │   ├── app/
│   │   ├── styles/globals.css
│   │   └── next.config.ts
│   │
│   ├── app/                  # @apps/platform — app.humane.cl — auth, account, internal ops
│   │   ├── app/
│   │   │   ├── (auth)/       # sign in, sign up, password reset
│   │   │   ├── (account)/    # profile, billing, org switcher
│   │   │   └── (internal)/   # concierge ops (migrations, escalations, regulatory)
│   │   ├── middleware.ts
│   │   ├── styles/globals.css
│   │   └── next.config.ts
│   │
│   └── tenant/               # @apps/tenant — {slug}.humane.cl — the product
│       ├── app/
│       │   ├── (tenant)/
│       │   │   ├── admin/    # Contadora / HR admin surface
│       │   │   ├── manager/  # Manager surface
│       │   │   └── empleado/ # Employee web surface
│       │   └── mcp/[transport]/ # MCP endpoint
│       ├── middleware.ts     # Extracts tenant slug from subdomain
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

### App Responsibilities

| App | Package | Domain | Contains |
|---|---|---|---|
| `landing` | `@apps/landing` | `www.humane.cl` | Marketing, pricing, blog, SEO. Zero auth, zero PII. Only uses `@packages/ui-common`. |
| `app` | `@apps/platform` | `app.humane.cl` | Auth, account home, billing, profile, internal concierge ops. |
| `tenant` | `@apps/tenant` | `{slug}.humane.cl` | The product: admin, manager, empleado surfaces + MCP endpoint. |

### Package Scopes

- `@apps/*` — apps
- `@packages/*` — shared packages

### Isolation Rules

- `apps/landing` must NEVER import from anything that touches PII or auth. It can only use `@packages/ui-common`.
- `apps/platform` and `apps/tenant` can import any `@packages/*`.
- Never import directly across apps — extract to a package.

### Subdomain Routing

- `www.humane.cl` → `apps/landing` (separate Vercel deployment)
- `app.humane.cl` → `apps/platform` (separate Vercel deployment)
- `{slug}.humane.cl` → `apps/tenant` — middleware extracts slug, sets `x-tenant-slug` header

### Local Dev Ports

| Service | Default port | URL |
|---|---|---|
| `apps/platform` | 7000 | http://localhost:7000 |
| `apps/landing` | 7001 | http://localhost:7001 |
| `apps/tenant` | 7002 | http://localhost:7002 |
| Supabase Studio | 7100 | http://localhost:7100 |
| `packages/react-email` | 7101 | http://localhost:7101 |
| `packages/react-pdf` | 7102 | http://localhost:7102 |

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
Actual webhook handlers, tool definitions, and agent logic live in `apps/platform/` or `apps/tenant/` depending on the surface.

When building Kapso tools:
- Each tool = one user intent (e.g., `get_liquidacion`, `request_vacation`, `team_status`)
- Tools receive structured args from Kapso, return `KapsoToolResponse`
- Kapso formats the response into WhatsApp messages (text, buttons, PDFs)

## MCP Server

Lives at `apps/tenant/app/mcp/[transport]/route.ts`. Exposed at `{slug}.humane.cl/mcp/`.
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
- `public.organization_members(organization_id, profile_id, role)` — users belong to organizations, not directly to tenants. The set of tenants a user can access is derived from the tenants of their organizations.

Every tenant-scoped data table carries denormalized `tenant_id int` (cheap to filter, cheap in indexes) and, when data is org-scoped, also `organization_id int`. Supabase RLS enforces isolation at the DB layer — never rely on application-level filtering alone.

**Active tenant comes from the subdomain.** `apps/tenant/middleware.ts` resolves `{tenant_slug}.humane.cl` → `tenant_id` via the service-role client and forwards `x-tenant-id` to downstream code. Server-side queries must explicitly `.eq("tenant_id", ...)` with that value. Org switching happens inside the app (per-tab or per-session selection).

**JWT carries two arrays** (`public.user_auth_hook` on token issuance):
- `app_metadata.tenants: [{id, slug}]` — distinct tenants the user has any org membership in
- `app_metadata.organizations: [{id, role}]` — every organization the user is a member of, with role

Plus `app_metadata.is_concierge: boolean` for the global internal role and `app_metadata.onboarded: boolean` for the onboarding gate.

After any `organization_members` (or `tenants` / `organizations`) mutation, call `supabase.auth.refreshSession()` so the client picks up the new claims; for revocations also call `supabase.auth.admin.signOut(profile_id)` server-side.

**Use the `viewer_*` SQL helpers in RLS policies, not raw JWT parsing:**
- `public.viewer_profile_id()` / `public.viewer_profile()` — current user (with optional `strict => true`)
- `public.viewer_tenant_ids()` — set of tenant_ids from JWT
- `public.viewer_tenant_validate(tenant_id)` — true iff caller belongs to any org in this tenant
- `public.viewer_organization_ids()` — set of organization_ids from JWT
- `public.viewer_organization_validate(organization_id, roles[])` — true iff caller is a member of this org, optionally role-restricted
- `public.viewer_is_concierge()` — global internal role

Per-organization roles use the `public.organization_member_role` enum (`employee`, `manager`, `accountant`, `owner`). Enum values are in English; the UI localizes to Spanish. Concierge is global and lives in `protected.concierge_users` (service-role only).

## User Roles

5 roles, each with a distinct product surface:

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

### Type Generation
- After Supabase schema changes: `pnpm generate:types` (runs against `@packages/supabase`)
- Never use `as any`

### Imports
- Use `~/` alias for imports within each app's root (e.g., `~/components/...` in `apps/tenant/`)
- Workspace packages: `@packages/ui-common`, `@packages/supabase`, `@packages/kapso`, `@packages/react-email`, `@packages/react-pdf`
- Never import across apps directly — extract to a package instead

### Code Style
- Biome.js handles formatting/linting — don't fight it
- Follow existing patterns in the codebase
- Chilean Spanish for user-facing strings, English for code/comments

### Commit Messages
Conventional Commits with scope: `type(scope): description`
- `feat(payroll): add semana corrida calculation`
- `fix(kapso): handle expired WhatsApp session`
- `chore(supabase): regenerate types after schema migration`

### Generated Files
Stage normally in git. Ignore when writing commit messages:
- `packages/supabase/src/types.ts` — Supabase DB types

## Testing Strategy

- Payroll calculations: unit tests with known inputs/outputs from `04-legal-regulatory-compendium.md`
- Run parallel calculations against Buk output during migration (internal ops validates)
- Every new regulatory rule gets a test case before the implementation
- RLS policies: test with different role JWTs to verify isolation

## What NOT to Do

- Don't add new technology without strong justification — the stack is intentionally familiar
- Don't build HR-org navigation for managers — their surface is opinionated, not a mini-admin
- Don't skip legal context in approval flows — inline Art. references are a core differentiator
- Don't hardcode regulatory values — they change monthly/yearly
- Don't process payroll without checking `04-legal-regulatory-compendium.md` first
- Don't let `apps/landing/` import anything that touches PII or auth
- Don't import across apps — extract to a package instead
- Don't put shadcn components in individual apps — they belong in `packages/ui-common/src/shadcn`
