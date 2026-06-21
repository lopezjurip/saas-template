#!/bin/bash
# exe.dev dev bring-up — sibling of worktree-setup.sh, but for an exe.dev VM
# instead of a local Conductor worktree.
#
# WHY: exe.dev gives each VM a public hostname `<vm>.exe.xyz` and transparently
# proxies HTTPS to any VM port in 3000-9999 (https://<vm>.exe.xyz:<port>/). TLS is
# terminated by exe.dev, so the app serves PLAIN HTTP (no mkcert/--experimental-https).
# Tenancy is path-based (/t/{slug}/...), so the single host is enough — no wildcard
# subdomains needed. See exe.dev docs: proxy.md, faq/nextjs-and-friends.md.
#
# Differences vs Conductor:
#   - one VM per tree => FIXED ports (no base-port juggling). Base = 3000.
#   - URLs use https://<vm>.exe.xyz:<port> instead of *.lvh.me + local certs.
#
# Port map (base 3000, all inside the 3000-9999 proxy range):
#   3000 Next.js app     3001 Supabase API/Kong   3002 DB (postgres)
#   3003 shadow DB       3004 Studio              3005 Inbucket   3006 Analytics
#
# Usage (on the exe.dev VM, repo checked out):
#   bash scripts/development/exe-dev-setup.sh        # patch + start supabase + write env
#   pnpm --filter @apps/platform dev:exe             # then start Next (HTTP, port 3000)
#
# Override the detected hostname with EXE_HOST=<vm>.exe.xyz if `hostname` is wrong.
set -e

cd "$(git rev-parse --show-toplevel)"

# --- Resolve the public exe.dev hostname for this VM ---
# exe.dev addresses VMs as `<vm_name>.exe.xyz`; exeuntu sets `hostname` to <vm_name>.
# Fallback chain: explicit EXE_HOST env > `<hostname>.exe.xyz`. At request time the app
# can also trust X-Forwarded-Host (set by the proxy) — see next.config / proxy.ts.
if [ -z "${EXE_HOST:-}" ]; then
  HN="$(hostname | tr '[:upper:]' '[:lower:]')"
  case "$HN" in
    *.exe.xyz) EXE_HOST="$HN" ;;
    *)         EXE_HOST="${HN}.exe.xyz" ;;
  esac
fi
echo "→ exe.dev host: ${EXE_HOST}"

BASE=3000
APP_PORT=$((BASE + 0))
STUDIO_PORT=$((BASE + 4))
# Unique, stable supabase project_id for this VM (keeps volumes/containers namespaced).
INSTANCE_KEY="exe-$(printf '%s' "$EXE_HOST" | tr -cd 'a-z0-9-' | cut -c1-40)"

# Site URL embedded in auth emails / used as redirect allow-list base.
export SUPABASE_AUTH_SITE_URL="https://${EXE_HOST}:${APP_PORT}"

# --- Write per-VM Supabase env (ports + project_id) ---
# config.toml reads these via env() — no file patching needed.
# redirect allow-list in config.toml covers *.exe.xyz:*/** statically.
cat > packages/supabase/.env.supabase <<EOF
SUPABASE_PROJECT_ID=${INSTANCE_KEY}
SUPABASE_API_PORT=$((BASE+1))
SUPABASE_DB_PORT=$((BASE+2))
SUPABASE_SHADOW_PORT=$((BASE+3))
SUPABASE_STUDIO_PORT=$((BASE+4))
SUPABASE_INBUCKET_PORT=$((BASE+5))
SUPABASE_ANALYTICS_PORT=$((BASE+6))
SUPABASE_AUTH_SITE_URL=https://${EXE_HOST}:${BASE}
SUPABASE_AUTH_WEBAUTHN_RP_ORIGINS=https://${EXE_HOST}:${BASE}
SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=true
EOF
echo "Supabase env written: project=${INSTANCE_KEY} API:$((BASE+1)) DB:$((BASE+2)) Studio:$((BASE+4))"

# --- Start Supabase (fresh project_id => migrations + seed applied on init) ---
RUNNING=$(docker ps -q --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RUNNING" -gt 0 ]; then
  echo "Supabase ${INSTANCE_KEY} already running, skipping db:start"
else
  PORT=$BASE pnpm db:start
fi

# --- Generate env with exe.dev public URLs (env-setup.ts honors EXE_HOST) ---
set -a; source packages/supabase/.env.supabase; set +a
EXE_HOST=$EXE_HOST PORT=$BASE pnpm run -w db:env:development

cat <<EOF

✅ exe.dev dev environment ready.

  App     →  https://${EXE_HOST}:${APP_PORT}      (run: pnpm --filter @apps/platform dev:exe)
  Studio  →  https://${EXE_HOST}:${STUDIO_PORT}
  Mailbox →  https://${EXE_HOST}:$((BASE + 5))

Ports are PRIVATE by default (only users with VM access, logged into exe.dev).
To expose the app publicly:  ssh exe.dev share set-public ${EXE_HOST%%.*} && ssh exe.dev share port ${EXE_HOST%%.*} ${APP_PORT}
Raw psql (proxy is HTTP-only): ssh -L 5432:localhost:$((BASE + 2)) ${EXE_HOST} -l exedev
EOF
