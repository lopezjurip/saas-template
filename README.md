# Humane — Chilean HR/Payroll Platform

Chat-first HR and payroll platform for Chilean companies (50–250 employees).

## Getting started

```bash
pnpm install
pnpm db:start                                       # starts local Supabase (Docker required)
cp .env.example apps/platform/.env.local            # copy local-dev defaults
bash scripts/setup-https.sh                         # generate mkcert TLS certs (one-time)
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
bash scripts/setup-https.sh
```

That script runs `mkcert -install` (adds the local CA to your system + Firefox trust stores) and generates `apps/platform/certs/lvh.me-{cert,key}.pem` covering `lvh.me`, `*.lvh.me`, `localhost`, and `127.0.0.1`. The `apps/platform` dev script picks those up automatically. Certs expire in ~2.5 years; re-run the script to refresh.

Files under `apps/platform/certs/` are gitignored (private keys, machine-specific). Each contributor runs `setup-https.sh` once on their own machine.

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

- `CLAUDE.md` — full architecture, stack, coding rules, and Chilean labor law reference
- `docs/04-legal-regulatory-compendium.md` — authoritative payroll/labor law rules
- `docs/08-user-journeys.md` — 5 roles, 38 journeys (source of truth for product behavior)
