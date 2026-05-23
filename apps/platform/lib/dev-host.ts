// Matches dev-only hostnames: localhost, *.localhost, *.test, 127.0.0.1, lvh.me, *.lvh.me.
// Trailing port (or end-of-string) is allowed via the `(:|$)` group.
const DEV_HOST_RE = /(^localhost(:|$)|\.localhost(:|$)|\.test(:|$)|127\.0\.0\.1|(^|\.)lvh\.me(:|$))/;

/**
 * True when the given host string looks like a local-dev hostname.
 *
 * Plain function (no React) so it can be called from both server components
 * (e.g. `tenants/create/page.tsx`, `dashboard/page.tsx`) and the client-side
 * `useIsDevHost` hook. Pass `process.env.NEXT_PUBLIC_APEX_HOST` (or any other
 * host string) to gate dev-only UI or to pick a protocol when constructing
 * tenant subdomain URLs.
 */
export function isDevHost(host: string | null | undefined): boolean {
  return DEV_HOST_RE.test(host ?? "");
}
