/** One year in seconds — the default lifetime for a persisted UI preference cookie. */
export const COOKIE_MAX_AGE_ONE_YEAR = 60 * 60 * 24 * 365;

export type CookieAttributes = {
  /** URL path the cookie is scoped to. Defaults to `/`. */
  path?: string;
  /** Lifetime in seconds. Defaults to one year; pass `null` for a session cookie. */
  maxAgeSeconds?: number | null;
  /** CSRF protection level. Defaults to `Lax`. */
  sameSite?: "Strict" | "Lax" | "None";
  /** Restrict to HTTPS. Required when `sameSite` is `None`. */
  secure?: boolean;
  /** Domain scope (e.g. `.lvh.me`). Omit to scope to the current host. */
  domain?: string;
};

/**
 * Builds a `document.cookie` / `Set-Cookie` value string from a name, value and attributes.
 * Pure — does not touch the DOM, so it's testable and reusable server-side.
 */
export function SERIALIZE_COOKIE(name: string, value: string, attributes: CookieAttributes = {}): string {
  const { path = "/", sameSite = "Lax", secure, domain } = attributes;
  // `null` => session cookie (no Max-Age); `undefined`/absent => default to one year.
  const maxAgeSeconds = attributes.maxAgeSeconds === undefined ? COOKIE_MAX_AGE_ONE_YEAR : attributes.maxAgeSeconds;
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`];
  if (maxAgeSeconds !== null) parts.push(`Max-Age=${maxAgeSeconds}`);
  if (domain) parts.push(`Domain=${domain}`);
  parts.push(`SameSite=${sameSite}`);
  if (secure || sameSite === "None") parts.push("Secure");
  return parts.join("; ");
}
