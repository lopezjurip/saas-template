import { SERIALIZE_COOKIE } from "./cookie";

/**
 * Minimal Cookie Store shape — the `get`/`set` overloads we depend on, mirroring the native
 * {@link https://developer.mozilla.org/docs/Web/API/CookieStore Cookie Store API} so the native
 * `globalThis.cookieStore` and our polyfill are interchangeable behind {@link CookieStoreLike}.
 */
export type CookieStoreLike = {
  get(name: string): Promise<CookieListItem | null>;
  get(options?: CookieStoreGetOptions): Promise<CookieListItem | null>;
  set(name: string, value: string): Promise<void>;
  set(options: CookieInit): Promise<void>;
};

export const COOKIE_STORE_SITE_ATTR = { strict: "Strict", lax: "Lax", none: "None" } as const;

/**
 * `document.cookie`-backed polyfill for runtimes missing the native Cookie Store API (Safari, older browsers).
 * Mirrors the native async overloads so callers behave identically whether the native API is present or not.
 */
export const cookieStorePolyfill: CookieStoreLike = {
  get(nameOrOptions?: string | CookieStoreGetOptions): Promise<CookieListItem | null> {
    const name = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions?.name;
    if (!name) return Promise.resolve(null);
    const prefix = `${name}=`;
    const hit = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
    if (hit === undefined) return Promise.resolve(null);
    return Promise.resolve({ name, value: decodeURIComponent(hit.slice(prefix.length)) });
  },
  set(nameOrInit: string | CookieInit, value?: string): Promise<void> {
    const init: CookieInit = typeof nameOrInit === "string" ? { name: nameOrInit, value: value ?? "" } : nameOrInit;
    // `null` => session cookie (no Max-Age); a missing `expires` is likewise session-scoped, matching
    // native `set(name, value)` which does not persist beyond the session.
    const maxAgeSeconds = init.expires == null ? null : Math.max(0, Math.round((init.expires - Date.now()) / 1000));
    // biome-ignore lint/suspicious/noDocumentCookie: this IS the Cookie Store polyfill — document.cookie is its backing store.
    document.cookie = SERIALIZE_COOKIE(init.name, init.value, {
      path: init.path,
      domain: init.domain ?? undefined,
      maxAgeSeconds,
      sameSite: init.sameSite ? COOKIE_STORE_SITE_ATTR[init.sameSite] : undefined,
    });
    return Promise.resolve();
  },
};
