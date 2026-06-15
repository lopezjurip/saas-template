const NEXT_PUBLIC_APEX_HOSTNAME = process.env["NEXT_PUBLIC_APEX_HOSTNAME"];

/**
 * Extracts the tenant slug from a `Host` header, if the host is a subdomain
 * of the apex. Returns `null` when the request is on the apex itself (global context).
 *
 * Host parsing: `{slug}.{apex}` → slug, `{apex}` → null.
 * Port is stripped before comparison.
 *
 * @example
 * tenantSlugFromHost("acme.lvh.me:7003", "lvh.me"); // "acme"
 * tenantSlugFromHost("lvh.me:7003",       "lvh.me"); // null
 */
export function tenantSlugFromHost(host: string | null | undefined, apex?: string | null): string | null {
  const apexHostname = apex ?? NEXT_PUBLIC_APEX_HOSTNAME;
  if (!host || !apexHostname) return null;

  const hostname = host.split(":")[0] ?? host;

  if (hostname === apexHostname) return null;

  const suffix = `.${apexHostname}`;
  if (hostname.endsWith(suffix)) {
    const slug = hostname.slice(0, hostname.length - suffix.length);
    if (slug) return slug;
  }

  return null;
}
