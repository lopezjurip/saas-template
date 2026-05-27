#!/bin/bash
set -e

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
# Each Conductor workspace gets CONDUCTOR_PORT..CONDUCTOR_PORT+9 (10 ports):
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
BASE=${CONDUCTOR_PORT:-7000}
WS=$(echo "${CONDUCTOR_WORKSPACE_NAME:-local}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')

python3 - <<PYEOF
import re, os, sys

base = int(os.environ['BASE'])
ws = os.environ['WS']
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
        line = f'project_id = "resolvecom-{ws}"\n'
    elif section == 'api'       and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+1}\n'
    elif section == 'db'        and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+2}\n'
    elif section == 'db'        and re.match(r'^shadow_port\s*=', line): line = f'shadow_port = {base+3}\n'
    elif section == 'studio'    and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+4}\n'
    elif section == 'inbucket'  and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+5}\n'
    elif section == 'analytics' and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+6}\n'
    result.append(line)

with open(path, 'w') as f:
    f.writelines(result)

print(f"Supabase config patched: project=resolvecom-{ws}")
print(f"  API:{base+1}  DB:{base+2}  shadow:{base+3}  Studio:{base+4}  Inbucket:{base+5}  Analytics:{base+6}")
PYEOF

# Hide the patched config.toml from git status in this worktree (changes are intentional per-workspace)
git update-index --skip-worktree packages/supabase/supabase/config.toml

# --- Copy gitignored files from root workspace ---
copy_if_exists "$CONDUCTOR_ROOT_PATH/.env.local" ./.env.local
copy_if_exists "$CONDUCTOR_ROOT_PATH/apps/platform/.env.local" ./apps/platform/.env.local

mkdir -p apps/platform/certs
ROOT_CERT="$CONDUCTOR_ROOT_PATH/apps/platform/certs/lvh.me-cert.pem"
ROOT_KEY="$CONDUCTOR_ROOT_PATH/apps/platform/certs/lvh.me-key.pem"
if [ -f "$ROOT_CERT" ] && [ -f "$ROOT_KEY" ]; then
  cp "$ROOT_CERT" ./apps/platform/certs/lvh.me-cert.pem
  cp "$ROOT_KEY" ./apps/platform/certs/lvh.me-key.pem
else
  bash scripts/development/https-setup.sh
fi

mkdir -p .claude
copy_if_exists "$CONDUCTOR_ROOT_PATH/.claude/settings.local.json" ./.claude/settings.local.json

pnpm install

# --- Start workspace-specific Supabase instance ---
# PORT is used by db:start to build SUPABASE_AUTH_SITE_URL=https://lvh.me:$PORT
PORT=$CONDUCTOR_PORT pnpm db:start

# Reset DB to apply schema + seed (clean slate per workspace)
PORT=$CONDUCTOR_PORT pnpm db:reset

# Generate .env.development.local with the workspace-specific Supabase URLs
PORT=$CONDUCTOR_PORT pnpm run -w db:env:development
