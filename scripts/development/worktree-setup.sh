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

# --- Patch supabase/config.toml with workspace-specific ports and project_id ---
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

python3 - <<PYEOF
import re, os, sys

base = int(os.environ['BASE'])
instance_key = os.environ['INSTANCE_KEY']
path = 'packages/supabase/supabase/config.toml'

with open(path) as f:
    lines = f.readlines()

section = None
result = []
for line in lines:
    m = re.match(r'^\[([a-z_.]+)\]\s*$', line)
    if m:
        section = m.group(1)

    if re.match(r'^project_id\s*=', line):
        line = f'project_id = "{instance_key}"\n'
    elif section == 'api'       and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+1}\n'
    elif section == 'db'        and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+2}\n'
    elif section == 'db'        and re.match(r'^shadow_port\s*=', line): line = f'shadow_port = {base+3}\n'
    elif section == 'studio'    and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+4}\n'
    elif section == 'inbucket'  and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+5}\n'
    elif section == 'analytics' and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+6}\n'
    result.append(line)

with open(path, 'w') as f:
    f.writelines(result)

print(f"Supabase config patched: project={instance_key}")
print(f"  API:{base+1}  DB:{base+2}  shadow:{base+3}  Studio:{base+4}  Inbucket:{base+5}  Analytics:{base+6}")
PYEOF

# Hide the patched config.toml from git status in this worktree (changes are intentional per-workspace)
git update-index --skip-worktree packages/supabase/supabase/config.toml

# --- Copy gitignored files from root workspace ---
copy_if_exists "$WORKTREE_ROOT_PATH/.env.local" ./.env.local
copy_if_exists "$WORKTREE_ROOT_PATH/apps/platform/.env.local" ./apps/platform/.env.local

mkdir -p apps/platform/certs
ROOT_CERT="$WORKTREE_ROOT_PATH/apps/platform/certs/lvh.me-cert.pem"
ROOT_KEY="$WORKTREE_ROOT_PATH/apps/platform/certs/lvh.me-key.pem"
if [ -f "$ROOT_CERT" ] && [ -f "$ROOT_KEY" ]; then
  cp "$ROOT_CERT" ./apps/platform/certs/lvh.me-cert.pem
  cp "$ROOT_KEY" ./apps/platform/certs/lvh.me-key.pem
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
PORT=$WORKTREE_PORT pnpm run -w db:env:development
