#!/bin/bash
set -e

if [ -z "$WORKTREE_NAME" ] || [ -z "$WORKTREE_PORT" ] || [ -z "$WORKTREE_ROOT_PATH" ] || [ -z "$WORKTREE_PROJECT" ]; then
  echo "Required: WORKTREE_NAME, WORKTREE_PORT, WORKTREE_ROOT_PATH, WORKTREE_PROJECT"
  echo "Example (Conductor): WORKTREE_NAME=\$CONDUCTOR_WORKSPACE_NAME WORKTREE_PORT=\$CONDUCTOR_PORT WORKTREE_ROOT_PATH=\$CONDUCTOR_ROOT_PATH WORKTREE_PROJECT=myproject bash scripts/development/worktree-setup.sh"
  exit 1
fi

copy_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
  else
    echo "Warning: $src not found, skipping."
  fi
}

# --- Write per-worktree Supabase env (ports + project_id) ---
# Each worktree gets WORKTREE_PORT..WORKTREE_PORT+9 (10 ports):
#   +0  Next.js app (used by run script)
#   +1  Supabase API / Kong
#   +2  Supabase DB (postgres)
#   +3  Supabase shadow DB (db diff)
#   +4  Supabase Studio
#   +5  Supabase Inbucket (email testing)
#   +6  Supabase Analytics
#   +7  react-email preview
#   +8  react-pdf preview
#   +9  spare
export BASE=${WORKTREE_PORT}
export WS=$(echo "${WORKTREE_NAME}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
export PROJECT=$(echo "${WORKTREE_PROJECT}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
export PROJECT_PREFIX=$(printf '%s' "${PROJECT}" | cut -c1-20 | sed 's/-$//')
export WS_HASH=$(printf '%s' "${PROJECT}:${WS}" | shasum -a 256 | cut -c1-12)

if [ -z "$PROJECT_PREFIX" ]; then
  export PROJECT_PREFIX="workspace"
fi

export INSTANCE_KEY="${PROJECT_PREFIX}-${WS_HASH}"

# config.toml reads ports/project_id via env() — write them here, gitignored.
cat > packages/supabase/.env.supabase <<EOF
SUPABASE_PROJECT_ID=${INSTANCE_KEY}
SUPABASE_API_PORT=$((BASE+1))
SUPABASE_DB_PORT=$((BASE+2))
SUPABASE_SHADOW_PORT=$((BASE+3))
SUPABASE_STUDIO_PORT=$((BASE+4))
SUPABASE_INBUCKET_PORT=$((BASE+5))
SUPABASE_ANALYTICS_PORT=$((BASE+6))
SUPABASE_AUTH_SITE_URL=https://lvh.me:${WORKTREE_PORT}
SUPABASE_AUTH_WEBAUTHN_RP_ORIGINS=https://lvh.me:${WORKTREE_PORT}
SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}
EOF
echo "Supabase env written: project=${INSTANCE_KEY}"
echo "  API:$((BASE+1))  DB:$((BASE+2))  shadow:$((BASE+3))  Studio:$((BASE+4))  Inbucket:$((BASE+5))  Analytics:$((BASE+6))"

# --- Copy gitignored files from root workspace ---
copy_if_exists "$WORKTREE_ROOT_PATH/.env.local" ./.env.local
copy_if_exists "$WORKTREE_ROOT_PATH/apps/platform/.env.local" ./apps/platform/.env.local

mkdir -p apps/platform/certificates
ROOT_CERT="$WORKTREE_ROOT_PATH/apps/platform/certificates/lvh.me-cert.pem"
ROOT_KEY="$WORKTREE_ROOT_PATH/apps/platform/certificates/lvh.me-key.pem"
if [ -f "$ROOT_CERT" ] && [ -f "$ROOT_KEY" ]; then
  cp "$ROOT_CERT" ./apps/platform/certificates/lvh.me-cert.pem
  cp "$ROOT_KEY" ./apps/platform/certificates/lvh.me-key.pem
else
  bash scripts/development/https-setup.sh
fi

mkdir -p .claude
copy_if_exists "$WORKTREE_ROOT_PATH/.claude/settings.local.json" ./.claude/settings.local.json

pnpm install

# --- Register this worktree as a user of the shared Supabase instance ---
# Multiple worktrees can share the same instance (same WORKTREE_NAME + WORKTREE_PROJECT).
# Archive skips shutdown while any registered worktree remains.
REF_DIR="$HOME/.worktree-refs/${INSTANCE_KEY}"
REF_FILE="$REF_DIR/$(pwd | tr '/' '_')"
mkdir -p "$REF_DIR"
touch "$REF_FILE"

# --- Start Supabase only if not already running ---
RUNNING=$(docker ps -q --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RUNNING" -gt 0 ]; then
  echo "Supabase ${INSTANCE_KEY} already running, skipping db:start"
else
  # Fresh project_id per workspace => fresh volume => `supabase start` applies
  # migrations + seed.sql on init. No need for an extra `db:reset` afterwards.
  PORT=$WORKTREE_PORT pnpm db:start
fi

# Generate .env.development.local with the workspace-specific Supabase URLs
# Source .env.supabase so env-setup.ts can read SUPABASE_STUDIO_PORT.
set -a; source packages/supabase/.env.supabase; set +a
PORT=$WORKTREE_PORT pnpm run -w db:env:development
