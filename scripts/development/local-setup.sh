#!/usr/bin/env bash
# Default-mode local bring-up — the equivalent of worktree-setup.sh (Conductor) or
# exe-dev-setup.sh (exe.dev), for a plain `git clone` + `pnpm dev` on your machine.
#
# WHY: `pnpm dev` only runs the app/dev servers (turbo run dev). It does NOT start
# Supabase, generate the env, or mint local TLS certs — those happen automatically only
# inside the Conductor/exe.dev setup scripts. In the default flow you must do them once;
# this script does, idempotently.
#
# Steps (each skipped if already satisfied):
#   1. mkcert TLS certs for lvh.me   (apps/platform/certs/) — needed by `next dev --experimental-https`
#   2. supabase start                (default ports from config.toml: API 54421, DB 54422, Studio 7200)
#   3. .env.development.local        (from `supabase status`, via env-setup.ts)
#
# Usage:  pnpm setup:local   (then `pnpm dev`)   — or one shot:  pnpm dev:local
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Conductor and exe.dev have their own setup; don't double-provision under them.
if [ -n "${CONDUCTOR_PORT:-}" ]; then
  echo "CONDUCTOR_PORT set → use the Conductor flow (worktree-setup.sh), not local-setup.sh." >&2
  exit 1
fi
if [ -n "${EXE_HOST:-}" ]; then
  echo "EXE_HOST set → use exe-dev-setup.sh, not local-setup.sh." >&2
  exit 1
fi

# --- 1. TLS certs (mkcert) ---
if [ -f apps/platform/certs/lvh.me-key.pem ] && [ -f apps/platform/certs/lvh.me-cert.pem ]; then
  echo "✓ TLS certs present"
else
  echo "→ generating local TLS certs (mkcert)…"
  bash scripts/development/https-setup.sh
fi

# --- 2. Supabase (default project from config.toml) ---
PROJECT="$(sed -n 's/^project_id[[:space:]]*=[[:space:]]*"\(.*\)".*/\1/p' packages/supabase/supabase/config.toml | head -1)"
RUNNING=$(docker ps -q --filter "label=com.supabase.cli.project=${PROJECT}" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RUNNING" -gt 0 ]; then
  echo "✓ Supabase '${PROJECT}' already running"
else
  echo "→ starting Supabase '${PROJECT}'…"
  pnpm db:start
fi

# --- 3. Env file ---
echo "→ writing .env.development.local…"
pnpm run -w db:env:development

cat <<'EOF'

✅ Local dev environment ready. Start the app with:
   pnpm dev          # → https://lvh.me:7003
EOF
