import { URL_NEW } from "@packages/utils/url";

/** Stable apex hostname (no port). Used for apex matching in the proxy and for any place that just needs to know "is this our domain". */
export const APEX_HOSTNAME = process.env["NEXT_PUBLIC_APEX_HOSTNAME"] || "lvh.me";

export const NODE_ENV = process.env["NODE_ENV"] || "development";

/**
 * Port this Next.js instance is bound to. In Conductor, parallel platform instances
 * each get a distinct PORT from the shell, and `pnpm dev` reads it via `--port ${PORT:-7003}`.
 * Next.js mirrors the bound port back into process.env.PORT at runtime; the dev fallback
 * keeps a bare `pnpm dev` (no shell PORT) working. In production PORT is typically empty
 * because the load balancer handles 80/443.
 */
export const APP_PORT = process.env["PORT"] || (NODE_ENV === "development" ? "7003" : "");

/**
 * Convenience: hostname (+ ":port" when applicable). Use for building absolute redirect
 * URLs server-side. On the client, prefer window.location.host — process.env.PORT is not
 * inlined into client bundles, so APP_HOST in browser-only paths will be missing the port.
 */
export const APP_HOST = APP_PORT ? `${APEX_HOSTNAME}:${APP_PORT}` : APEX_HOSTNAME;

const APP_URL_DEVELOPMENT = URL_NEW(`http://${APP_HOST}`);
const APP_URL_PRODUCTION = URL_NEW(`https://${APP_HOST}`);
/** Full origin URL. Use for absolute URLs server-side (redirects, emails, OG tags). */
export const APP_URL: URL = /*#__PURE__*/ NODE_ENV === "development" ? APP_URL_DEVELOPMENT : APP_URL_PRODUCTION;

export const DEBUG = process.env["DEBUG"];

/**
 * When false (default), account existence and method availability (exists, has_passkey,
 * has_password) are NOT included in redirect URLs after step-1 auth. Pages show generic
 * "Ingresar" text and only offer magic link / OTP. Set AUTH_EXPOSE_ACCOUNT_EXISTENCE=true
 * to restore the explicit "Crear cuenta" / "Ingresar" split and passkey/password buttons.
 * Trade-off: false = privacy (no enumeration via URL), true = better UX for power users.
 */
export const AUTH_EXPOSE_ACCOUNT_EXISTENCE = true; // process.env["AUTH_EXPOSE_ACCOUNT_EXISTENCE"] === "true";
