import { type CookieStoreLike, cookieStorePolyfill } from "@packages/utils/cookie-store.polyfill";
import { useMemo } from "react";

/**
 * Browser cookie reader/writer backed by the native Cookie Store API, falling back to a
 * `document.cookie` polyfill where it's missing (Safari, older browsers). Returns a stable handle
 * exposing the native `get`/`set` overloads — `set(name, value)` for a quick write or
 * `set(options)` to control path/expiry — so callers behave identically across both backends.
 */
export function useCookieStore(): CookieStoreLike {
  return useMemo(() => {
    if ("cookieStore" in globalThis) {
      return globalThis.cookieStore;
    } else {
      return cookieStorePolyfill;
    }
  }, []);
}
