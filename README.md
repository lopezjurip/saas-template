# SaaS Template

A production-grade starter for building a multi-tenant SaaS: Next.js 16 + React 19 +
Supabase + Turborepo, with authentication (email/password, OAuth, phone OTP, WebAuthn
passkeys), two-level multi-tenancy with Postgres RLS, capability-based permissions, i18n,
React Email/PDF template packages, and a shadcn design system already wired together.

The repo ships with example product surfaces as reference implementations — replace them with
your own product; the infrastructure under `packages/*` is the part meant to be reused.

## Getting started

```bash
pnpm install
pnpm db:start                                       # starts local Supabase (Docker required)
cp .env.example apps/platform/.env.local            # copy local-dev defaults
bash scripts/development/https-setup.sh             # generate mkcert TLS certs (one-time)
pnpm dev                                            # runs all apps and packages in parallel
```

Open `https://lvh.me:7003`. (See HTTPS section below — passkeys / WebAuthn require it.)

## Local dev ports

| Service | Default port | URL |
|---|---|---|
| `apps/platform` | 7003 | https://lvh.me:7003 |
| Supabase Studio | 7100 | http://localhost:7100 |
| Supabase Inbucket (mailbox) | 54424 | http://localhost:54424 |
| `packages/react-email` | 7101 | http://localhost:7101 |
| `packages/react-pdf` | 7102 | http://localhost:7102 |

## Local HTTPS (required for passkeys)

`apps/platform` runs over HTTPS in dev because WebAuthn (`navigator.credentials.create` / `.get`) only works in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) — and the browser's secure-context allowlist matches the literal strings `localhost` / `127.0.0.1` / `[::1]`, not DNS aliases that resolve there. `lvh.me` resolves to `127.0.0.1` but is *not* on the allowlist, so plain HTTP fails with `window.PublicKeyCredential === undefined`.

The fix: [mkcert](https://github.com/FiloSottile/mkcert) + Next's `--experimental-https` flag. Install mkcert (`brew install mkcert` on macOS), then:

```bash
bash scripts/development/https-setup.sh
```

That script runs `mkcert -install` (adds the local CA to your system + Firefox trust stores) and generates `apps/platform/certs/lvh.me-{cert,key}.pem` covering `lvh.me`, `*.lvh.me`, `localhost`, and `127.0.0.1`. The `apps/platform` dev script picks those up automatically. Certs expire in ~2.5 years; re-run the script to refresh.

Files under `apps/platform/certs/` are gitignored (private keys, machine-specific). Each contributor runs `https-setup.sh` once on their own machine.

If you skip HTTPS setup: OAuth and email/password still work over plain `http://lvh.me:7003` (you'd also need to flip `WEBAUTHN_RELYING_PARTY_ORIGIN`, `site_url`, and `additional_redirect_urls` back to `http://`), but passkey registration and sign-in will fail silently in the browser.

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

- `AGENTS.md` — full architecture, stack, and coding rules
- `skills/my-*` — source-backed per-subsystem agent guides

`pnpm install` symlinks bundled skills into `.agents/skills/` and `.claude/skills/`.
`my-proxy` documents `apps/platform/proxy.ts`; it is not a residential/SOCKS proxy skill.
