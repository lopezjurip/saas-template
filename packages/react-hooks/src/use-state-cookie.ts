import { useCallback, useRef, useState } from "react";
import { useCookieStore } from "./use-cookie-store";

export type UseStateCookieOptions<T> = {
  /** Cookie lifetime in milliseconds from each write. Omit for a session cookie. */
  maxAgeMs?: number;
  /** Cookie path scope. Defaults to `"/"` so the value is sent on every route. */
  path?: string;
  sameSite?: "strict" | "lax" | "none";
  /** Maps the value onto the cookie string. Defaults to `String(value)`. Pass a stable reference. */
  serialize?: (value: T) => string;
};

/**
 * `useState`, but every update is mirrored into a cookie via {@link useCookieStore} (native Cookie
 * Store API with a `document.cookie` polyfill).
 *
 * **Contract:** the caller MUST provide `initialValue` already read from the cookie server-side and
 * plumbed in as a prop. This hook NEVER reads the cookie itself — doing so on the client would either
 * flash the default before mount or trigger a hydration mismatch. The server read is the single
 * source of truth for the initial render; the hook only *writes* on update.
 *
 * Not `react-use`'s `useCookie`: that reads `document.cookie` on mount (SSR flash) and is backed by
 * `js-cookie`, whereas this stays on the `cookieStore` API we standardize on and is hydration-safe.
 */
export function useStateCookie<T>(
  name: string,
  initialValue: T,
  { maxAgeMs, path = "/", sameSite, serialize }: UseStateCookieOptions<T> = {},
): [T, (next: T | ((prev: T) => T)) => void] {
  const cookieStore = useCookieStore();
  const [value, setValue] = useState<T>(initialValue);

  // Reach the latest value from the stable setter without making it a dependency (and without
  // writing the cookie inside the setState updater, which StrictMode double-invokes).
  const valueRef = useRef(value);
  valueRef.current = value;

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;
      setValue(resolved);
      void cookieStore.set({
        name,
        value: serialize ? serialize(resolved) : String(resolved),
        path,
        expires: maxAgeMs == null ? undefined : Date.now() + maxAgeMs,
        sameSite,
      });
    },
    [cookieStore, name, path, maxAgeMs, sameSite, serialize],
  );

  return [value, set];
}
