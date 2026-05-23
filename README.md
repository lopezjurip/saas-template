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
| `apps/platform` | 7003 | http://lvh.me:7003 |
| Supabase Studio | 7100 | http://localhost:7100 |
| `packages/react-email` | 7101 | http://localhost:7101 |
| `packages/react-pdf` | 7102 | http://localhost:7102 |

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
