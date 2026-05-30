// Stable apex hostname (no port). Used for subdomain/apex matching in the proxy and
// for any place that just needs to know "is this our domain".
export const APEX_HOSTNAME = process.env["NEXT_PUBLIC_APEX_HOSTNAME"] ?? "lvh.me";

export const NODE_ENV = process.env["NODE_ENV"] ?? "development";

// Port this Next.js instance is bound to. In Conductor, parallel platform instances
// each get a distinct PORT from the shell, and `pnpm dev` reads it via `--port ${PORT:-7003}`.
// Next.js mirrors the bound port back into process.env.PORT at runtime; the dev fallback
// keeps a bare `pnpm dev` (no shell PORT) working. In production PORT is typically empty
// because the load balancer handles 80/443.
export const APP_PORT = process.env["PORT"] ?? (NODE_ENV === "development" ? "7003" : "");

// Convenience: hostname (+ ":port" when applicable). Use for building absolute redirect
// URLs server-side. On the client, prefer window.location.host — process.env.PORT is not
// inlined into client bundles, so APP_HOST in browser-only paths will be missing the port.
export const APP_HOST = APP_PORT ? `${APEX_HOSTNAME}:${APP_PORT}` : APEX_HOSTNAME;

export const DEBUG = process.env["DEBUG"];

// When false, tenant routing is path-only (/{locale}/{slug}/...) — no {slug}.apex subdomain.
// Set NEXT_PUBLIC_SUBDOMAIN_MODE=false when wildcard DNS for *.apex is unavailable
// (e.g. mounting the apex itself on a subdomain of an experiments domain).
// Also set NEXT_PUBLIC_COOKIE_DOMAIN to the apex host (not the parent domain) so session
// cookies stay scoped to a single origin instead of crossing subdomains.
export const SUBDOMAIN_MODE = process.env["NEXT_PUBLIC_SUBDOMAIN_MODE"] !== "false";

// When false (default), account existence and method availability (exists, has_passkey,
// has_password) are NOT included in redirect URLs after step-1 auth. Pages show generic
// "Ingresar" text and only offer magic link / OTP. Set AUTH_EXPOSE_ACCOUNT_EXISTENCE=true
// to restore the explicit "Crear cuenta" / "Ingresar" split and passkey/password buttons.
// Trade-off: false = privacy (no enumeration via URL), true = better UX for power users.
export const AUTH_EXPOSE_ACCOUNT_EXISTENCE = process.env["AUTH_EXPOSE_ACCOUNT_EXISTENCE"] === "true";
