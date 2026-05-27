#!/bin/bash
set -e

WS=$(echo "${CONDUCTOR_WORKSPACE_NAME:-local}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')

# Stop workspace-specific Supabase containers
pnpm db:stop || true

# Remove Docker volumes for this workspace (disk cleanup)
docker volume ls -q --filter "label=com.supabase.cli.project=resolvecom-${WS}" \
  | xargs -r docker volume rm 2>/dev/null || true

# Remove node_modules
rm -rf node_modules
