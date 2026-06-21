---
name: vercel-cli
description: Deploy, manage, inspect, and troubleshoot Vercel projects from the command line. Use for Vercel deployments, projects and teams, environment variables, domains and DNS, logs, metrics, Speed Insights, Core Web Vitals, request traces, usage, activity, alerts, firewall rules, cache, cron jobs, deploy hooks, Edge Config, feature flags, integrations, connectors, Blob storage, microfrontends, rolling releases, custom environments, Sandbox, agent/MCP setup, OAuth apps, preview access, local development, or `vercel api` fallback.
---
# Vercel CLI Skill

Vercel CLI (`vercel` or `vc`) deploy, manage, develop projects on Vercel from command line. Use `vercel <command> --help` for full flag details.

Installed CLI help = source of truth for obscure/new flags. If example insufficient, check `vercel <command> --help` before guessing.

## Critical: Project Linking

Commands run from dir containing `.vercel` folder (or subdir). How `.vercel` set up depends on project structure:

- **`.vercel/project.json`**: Created by `vercel link`. Links single project. Fine for single-project repos; works in monorepos if only one project.
- **`.vercel/repo.json`**: Created by `vercel link --repo`. Links repo with multiple projects. Always use when any project has non-root dir (e.g., `apps/web`).

Running from project subdir (e.g., `apps/web/`) skips "which project?" prompt — unambiguous.

**When broken, check link first** — inspect `.vercel/` for `project.json` or `repo.json`. Verify team with `vercel whoami` — linking on wrong team common mistake.

## Quick Start

```bash
npm i -g vercel
vercel login
vercel link              # single project
# OR
vercel link --repo       # monorepo
vercel pull
vercel dev        # local development
vercel deploy     # preview deployment
vercel --prod     # production deployment
```

## Decision Tree

Route to correct reference file:

- **Deploy** → `references/deployment.md`
- **Rolling releases, deploy hooks, cron jobs, cache, git connection, Edge Config, redirects, custom environments** → `references/project-infra.md`
- **Local development** → `references/local-development.md`
- **Environment variables** → `references/environment-variables.md`
- **CI/CD automation** → `references/ci-automation.md`
- **Domains or DNS** → `references/domains-and-dns.md`
- **Projects or teams** → `references/projects-and-teams.md`
- **Logs, metrics, Speed Insights, Core Web Vitals, activity, performance, preview access, or production debugging** → `references/monitoring-and-debugging.md`
- **Alerts, usage, contracts, billing purchases, tokens, telemetry, or CLI upgrades** → `references/platform-ops.md`
- **Blob storage** → `references/storage.md`
- **Integrations (databases, storage, etc.)** → `references/integrations.md`
- **Connectors (`vercel connect`)** → `references/connectors.md`
- **Routing rules** → `references/routing.md`
- **Firewall (WAF rules, IP blocks, rate limiting)** → `references/firewall.md`
- **Access preview deployment** → use `vercel curl` (see `references/monitoring-and-debugging.md`)
- **CLI command unavailable or output missing required fields** → use `vercel api` when first-class CLI insufficient (see `references/advanced.md`)
- **Node.js backends (Express, Hono, etc.)** → `references/node-backends.md`
- **Monorepos (Turborepo, Nx, workspaces)** → `references/monorepos.md`
- **Bun runtime** → `references/bun.md`
- **Feature flags** → `references/flags.md`
- **Microfrontends** → `references/microfrontends.md`
- **Sandbox** → `references/sandbox.md`
- **Agent, MCP, skills discovery, or AI Gateway** → `references/agent-and-ai.md`
- **Captured request traces (`vercel traces`, including `--open` / `--view`)** → `references/advanced.md`
- **Vercel Apps / OAuth apps (`vercel oauth-apps`)** → `references/advanced.md`
- **Advanced (`vercel api` fallback, webhooks)** → `references/advanced.md`
- **Global flags** → `references/global-options.md`
- **First-time setup** → `references/getting-started.md`

## Anti-Patterns

- **Wrong link type in monorepos**: `vercel link` creates `project.json`, tracks one project only. Use `vercel link --repo`. When broken, check `.vercel/` first.
- **Auto-link in monorepos**: Commands implicitly run `vercel link` if `.vercel/` missing — creates `project.json`, may be wrong. Run `vercel link` (or `--repo`) explicitly first.
- **Wrong team**: Use `vercel whoami` to check, `vercel teams switch` to change.
- **Missing non-interactive flags in CI/agent**: Use `--non-interactive` for prompt-free; `--yes` only for confirmation commands.
- **`vercel deploy` after `vercel build` without `--prebuilt`**: Build output ignored.
- **Hardcoded tokens in flags**: Use `VERCEL_TOKEN` env var, not `--token`.
- **Disabling deployment protection**: Use `vercel curl` to access preview deploys instead.
- **`vercel api` too early**: Prefer first-class CLI when it exposes needed data/mutation.