# Humane — Chilean HR/Payroll Platform

Chat-first HR and payroll platform for Chilean companies (50–250 employees).

## Getting started

```bash
pnpm install
pnpm db:start   # starts local Supabase (Docker required)
pnpm dev        # runs all apps and packages in parallel
```

## Local dev ports

| Service | Default port | URL |
|---|---|---|
| `apps/platform` | 8000 | http://localhost:8000 |
| `apps/landing` | 8001 | http://localhost:8001 |
| `apps/tenant` | 8002 | http://localhost:8002 |
| Supabase Studio | 8100 | http://localhost:8100 |
| `packages/react-email` | 8101 | http://localhost:8101 |
| `packages/react-pdf` | 8102 | http://localhost:8102 |

## Useful commands

```bash
pnpm dev                  # start all services
pnpm build                # build all packages and apps
pnpm db:start             # start local Supabase
pnpm db:stop              # stop local Supabase
pnpm db:reset             # drop + replay schema + seed
pnpm generate:types       # regenerate Supabase TS types
```

## Docs

- `CLAUDE.md` — full architecture, stack, coding rules, and Chilean labor law reference
- `docs/04-legal-regulatory-compendium.md` — authoritative payroll/labor law rules
- `docs/08-user-journeys.md` — 5 roles, 38 journeys (source of truth for product behavior)
