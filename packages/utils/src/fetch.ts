import { URL_NEW } from "./url";

/**
 * Creates a fetch wrapper pre-configured with a base URL and default RequestInit.
 * The factory signature mirrors `fetch(input, init)` but restricted to `string | URL`
 * (no `Request` object) so the body stays simple.
 * Per-call headers are merged on top of defaults (call-level wins).
 * @example
 * const api = createFetch("https://api.example.com", {
 *   headers: { Authorization: "Bearer token" },
 * });
 * const res = await api("/users", { method: "POST", body: JSON.stringify({}) });
 */
export function createFetch(input: string | URL, init?: RequestInit) {
  const base = String(input);
  return function fetchInner(callInput: string | URL, callInit?: RequestInit): Promise<Response> {
    return fetch(URL_NEW(callInput, base), {
      ...init,
      ...callInit,
      headers: {
        ...init?.headers,
        ...callInit?.headers,
      },
    });
  };
}
