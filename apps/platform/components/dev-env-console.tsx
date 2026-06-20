"use client";

import { useEffect } from "react";

/**
 * Logs dev env vars + service URLs to the browser console once on mount.
 * Rendered only in development from the root layout — helps tell worktree
 * instances apart when ports and URLs keep changing.
 * @example <DevEnvConsole data={DEV_ENV_SNAPSHOT()} />
 */
export function DevEnvConsole({ data }: { data: Record<string, string> }) {
  useEffect(() => {
    console.groupCollapsed("%c⚙ dev env", "font-weight:bold");
    console.table(data);
    console.groupEnd();
  }, [data]);

  return null;
}
