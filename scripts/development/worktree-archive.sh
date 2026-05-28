#!/bin/bash
set -e

WS=$(echo "${WORKTREE_NAME:-local}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PROJECT=${WORKTREE_PROJECT:-}

# --- Deregister this worktree from the shared Supabase instance ---
INSTANCE_KEY="${PROJECT}-${WS}"
REF_DIR="$HOME/.worktree-refs/${INSTANCE_KEY}"
REF_FILE="$REF_DIR/$(pwd | tr '/' '_')"
rm -f "$REF_FILE"
REF_COUNT=$(ls "$REF_DIR" 2>/dev/null | wc -l | tr -d ' ')

if [ "$REF_COUNT" -gt 0 ]; then
  echo "Supabase ${INSTANCE_KEY} still used by ${REF_COUNT} other worktree(s), skipping shutdown"
else
  rmdir "$REF_DIR" 2>/dev/null || true

  # Stop workspace-specific Supabase containers
  pnpm db:stop || true

  # Remove Docker volumes for this workspace (disk cleanup)
  if [ -n "$PROJECT" ]; then
    docker volume ls -q --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" \
      | xargs -r docker volume rm 2>/dev/null || true
  fi
fi

# Remove node_modules
rm -rf node_modules
