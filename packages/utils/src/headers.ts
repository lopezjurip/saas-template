import { URL_NEW } from "./url";

/**
 * Builds the request origin URL from proxy headers.
 * Reads `x-forwarded-proto` (set by Vercel/reverse proxy) and `host`.
 * Works with both `Request.headers` (Headers) and Next.js `headers()` (ReadonlyHeaders).
 *
 * @example HOST_FROM_HEADERS(req.headers).origin // "https://lvh.me:7003"
 * @example HOST_FROM_HEADERS(await headers()).origin // "https://example.com"
 */
export function HOST_FROM_HEADERS(hdrs: { get(name: string): string | null }): URL {
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const host = hdrs.get("host") ?? "localhost";
  return URL_NEW(`${proto}://${host}`);
}
