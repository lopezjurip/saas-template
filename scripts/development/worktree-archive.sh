#!/bin/bash
set -e

WS=$(echo "${WORKTREE_NAME:-local}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PROJECT=$(printf '%s' "${WORKTREE_PROJECT:-}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PROJECT_PREFIX=$(printf '%s' "${PROJECT}" | cut -c1-20 | sed 's/-$//')
WS_HASH=$(printf '%s' "${PROJECT}:${WS}" | shasum -a 256 | cut -c1-12)

if [ -z "$PROJECT_PREFIX" ]; then
  PROJECT_PREFIX="workspace"
fi

# --- Deregister this worktree from the shared Supabase instance ---
INSTANCE_KEY="${PROJECT_PREFIX}-${WS_HASH}"
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
