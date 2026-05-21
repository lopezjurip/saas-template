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
| Styling | Tailwind CSS 4.x + shadcn/ui (new-york, in `packages/shadcn`) |
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
│   ├── landing/              # @humane/landing — www.humane.cl — marketing site
│   │   ├── app/
│   │   ├── styles/globals.css
│   │   └── next.config.ts
│   │
│   ├── app/                  # @humane/platform — app.humane.cl — auth, account, internal ops
│   │   ├── app/
│   │   │   ├── (auth)/       # sign in, sign up, password reset
│   │   │   ├── (account)/    # profile, billing, org switcher
│   │   │   └── (internal)/   # concierge ops (migrations, escalations, regulatory)
│   │   ├── middleware.ts
│   │   ├── styles/globals.css
│   │   └── next.config.ts
│   │
│   └── tenant/               # @humane/tenant — {slug}.humane.cl — the product
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
│   ├── shadcn/               # @packages/shadcn — shadcn/ui primitives + cn utility
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
| `landing` | `@humane/landing` | `www.humane.cl` | Marketing, pricing, blog, SEO. Zero auth, zero PII. Only uses `@packages/shadcn`. |
| `app` | `@humane/platform` | `app.humane.cl` | Auth, account home, billing, profile, internal concierge ops. |
| `tenant` | `@humane/tenant` | `{slug}.humane.cl` | The product: admin, manager, empleado surfaces + MCP endpoint. |

### Package Scopes

- `@humane/*` — apps
- `@packages/*` — shared packages

### Isolation Rules

- `apps/landing` must NEVER import from anything that touches PII or auth. It can only use `@packages/shadcn`.
- `apps/platform` and `apps/tenant` can import any `@packages/*`.
- Never import directly across apps — extract to a package.

### Subdomain Routing

- `www.humane.cl` → `apps/landing` (separate Vercel deployment)
- `app.humane.cl` → `apps/platform` (separate Vercel deployment)
- `{slug}.humane.cl` → `apps/tenant` — middleware extracts slug, sets `x-tenant-slug` header

## shadcn/ui in packages/shadcn

shadcn components live in `packages/shadcn`, not inside individual apps.

- Run `pnpm dlx shadcn add <component>` from `packages/shadcn/` to add components
- Components are exported via the `exports` map in `packages/shadcn/package.json`
- Import as: `import { Button } from "@packages/shadcn/components/ui/button"`
- Import `cn`: `import { cn } from "@packages/shadcn/lib/utils"`
- Each app's `globals.css` imports `../../packages/shadcn/src/globals.css` for CSS variables
- Each app's `globals.css` includes `@source "../../packages/shadcn/src"` for Tailwind scanning
- Each app's `next.config.ts` includes `@packages/shadcn` in `transpilePackages`

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

## Multi-tenancy & RLS

Every table with tenant data has `tenant_id` column. Supabase RLS enforces isolation at the DB layer. Never rely on application-level filtering alone.

When writing queries: always scope by `tenant_id`. When writing RLS policies: the JWT contains `tenant_id` claim set during auth.

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
- Workspace packages: `@packages/shadcn`, `@packages/supabase`, `@packages/kapso`, `@packages/react-email`, `@packages/react-pdf`
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
- Don't put shadcn components in individual apps — they belong in `packages/shadcn`
