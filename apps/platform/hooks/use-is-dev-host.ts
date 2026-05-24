"use client";

import { APP_HOST } from "~/lib/constants";
import { isDevHost } from "~/lib/dev-host";

/**
 * True when the app is being served from a recognized local-dev hostname.
 *
 * Reads `NEXT_PUBLIC_APEX_HOST` (inlined at build time), so the result is stable
 * across server and client renders — no hydration mismatch. Use this to gate
 * dev-only UI (e.g. links to the local inbucket mailbox).
 *
 * For server-component callers, import `isDevHost` from `~/lib/dev-host` directly.
 */
export function useIsDevHost(): boolean {
  return isDevHost(APP_HOST);
}
