"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` after the component has mounted on the client.
 * Use to gate browser-only reads (theme, `window`, `document`) that would
 * otherwise mismatch between server and client during hydration.
 * @example
 * const mounted = useMounted();
 * const dark = mounted && resolvedTheme === "dark";
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
