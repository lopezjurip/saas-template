import { updateSession } from "@packages/supabase/client.middleware";
import { URL_NEW } from "@packages/utils/url";
import { type NextRequest, NextResponse, userAgent } from "next/server";
import { APEX_HOSTNAME, APP_HOST, PROXY_LOG_ENABLED } from "~/lib/constants";
import { debug } from "~/lib/debug";
import { LOCALE_COOKIE, LOCALE_SUPPORTED_RESOLVE, type SupportedLocale } from "~/lib/i18n";
import { LOCALE_FROM_REQUEST } from "~/lib/i18n.server";

const PH_TOKEN = process.env["NEXT_PUBLIC_POSTHOG_KEY"] ?? "";
const PH_HOST = process.env["NEXT_PUBLIC_POSTHOG_HOST"] ?? "https://us.i.posthog.com";
const PH_COOKIE_KEY = `ph_${PH_TOKEN}_posthog`;
const PH_BOOTSTRAP_COOKIE = "ph_bootstrap";

const log = debug("proxy");

// /.well-known/* is public — includes /oauth-protected-resource (RFC 9728 PRM discovery for MCP clients).
// Matching the whole /.well-known prefix intentionally: all well-known paths are conventionally public.
// /oauth/consent stays PROTECTED — the page itself handles the auth redirect.
const PUBLIC_PATH_REGEX =
  /^(\/|(\/(?:auth|legal|faq|pricing|mcp|opengraph-image|twitter-image|icon|\.well-known)(?:\/|$)))/;
// NOTE: /api/* routes (including /api/internal/conversations/*) are
// already excluded from the proxy middleware by the `matcher` config above — they never
// reach this regex. The auth gate for the drain route is the shared-secret header.
const GLOBAL_METADATA_ASSET_PATHS = new Set(["/apple-icon", "/icon", "/opengraph-image", "/twitter-image"]);

/**
 * Name required by Next.js.
 * Proxy incoming requests to the appropriate tenant based on path and host, and handle locale detection and session updates.
 * This runs before all other middleware and routes, so it's the ideal place to centralize logic that should apply to all requests.
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");

  const { isBot, device } = userAgent(request);
  if (PROXY_LOG_ENABLED) {
    log.debug("[proxy] request", { hostname, pathname, isBot, deviceType: device.type ?? "desktop" });
  }

  /**
   * Host classification: apex, Vercel preview (treat as apex), or unknown (bounce to apex).
   * All tenant routing is path-based (/t/{slug}/...) — no subdomain extraction needed.
   */
  const hostnameBase = hostname.split(":")[0] ?? "";
  const isApex = hostnameBase === APEX_HOSTNAME || hostnameBase === `www.${APEX_HOSTNAME}`;
  const vercelEnv = process.env["VERCEL_ENV"];
  const isVercelNonProd = vercelEnv === "preview" || vercelEnv === "development";
  if (!isApex && !isVercelNonProd) {
    /** Unknown host (localhost/127.0.0.1/custom domain — phase 2). Bounce to apex so session and cookies land on the right origin. */
    const apexUrl = URL_NEW(`${pathname}${request.nextUrl.search}`, `${proto}://${APP_HOST}`);
    return NextResponse.redirect(apexUrl);
  }

  /**
   * Locale resolution — cookie-if-absent. Locale lives in the NEXT_LOCALE cookie, never the URL.
   * Keep an existing valid cookie untouched (so an explicit user toggle survives reloads); only
   * when it is missing/invalid do we detect from Accept-Language and persist it.
   */
  const cookieLocale = LOCALE_SUPPORTED_RESOLVE(request.cookies.get(LOCALE_COOKIE)?.value);
  const locale = cookieLocale ?? LOCALE_FROM_REQUEST(request);
  if (!cookieLocale) {
    /**
     * Mirror onto the incoming request BEFORE updateSession snapshots it, so same-render server
     * components (notably <html lang> in the root layout) read the freshly-detected locale.
     */
    request.cookies.set(LOCALE_COOKIE, locale);
  }
  /** Persist on the response only when it was absent — re-deriving every request would clobber the toggle. */
  function withLocale(response: NextResponse): NextResponse {
    return cookieLocale ? response : setLocaleCookieOnResponse(response, locale);
  }

  if (isGlobalMetadataAssetPath(pathname)) {
    const { response } = await updateSession(request);
    return withLocale(response);
  }

  /** /health — no auth. */
  if (pathname === "/health") {
    const { response } = await updateSession(request);
    return withLocale(response);
  }

  const { response: sessionResponse, user: sessionUser } = await updateSession(request);

  /** Bots get public content without session overhead. */
  if (isBot && isPublicPath(pathname)) {
    return withLocale(NextResponse.next());
  }

  /**
   * Public routes — no auth required, but logged-in users shouldn't see auth entry pages.
   * (The form's server action gets bound to the wrong route after a client transition from /home
   * and posts to the previous URL, producing "unexpected response from server".)
   */
  if (isPublicPath(pathname)) {
    const isAuthEntryPath =
      pathname === "/auth" ||
      pathname.startsWith("/auth/email") ||
      pathname.startsWith("/auth/phone") ||
      pathname.startsWith("/auth/document");
    if (isAuthEntryPath && sessionUser) {
      return withLocale(NextResponse.redirect(URL_NEW("/home", `${proto}://${APP_HOST}`)));
    }
    // Bootstrap PostHog flags for marketing routes only (landing, pricing, etc.).
    const isMarketingPath =
      pathname === "/" ||
      pathname.startsWith("/faq") ||
      pathname.startsWith("/pricing") ||
      pathname.startsWith("/mcp") ||
      pathname.startsWith("/legal");
    if (isMarketingPath) {
      await setPostHogBootstrap(request, sessionResponse);
    }
    return withLocale(sessionResponse);
  }

  /** Protected paths — auth and tenant gates handled by layout. */
  return withLocale(sessionResponse);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap|llms.txt|manifest.webmanifest|sw.js).*)",
  ],
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_REGEX.test(pathname);
}

function setLocaleCookieOnResponse(response: NextResponse, locale: SupportedLocale): NextResponse {
  const cookieDomain = process.env["NEXT_PUBLIC_COOKIE_DOMAIN"];
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    domain: cookieDomain || undefined,
  });
  return response;
}

function isGlobalMetadataAssetPath(pathname: string): boolean {
  return GLOBAL_METADATA_ASSET_PATHS.has(pathname);
}

/**
 * Bootstraps PostHog feature flags for anonymous/marketing routes to prevent UI flicker.
 * Reads or generates a distinct_id, fetches flags from PostHog, and sets a cookie.
 * Non-blocking — on any error the response proceeds without the bootstrap cookie.
 */
async function setPostHogBootstrap(request: NextRequest, response: NextResponse): Promise<void> {
  if (!PH_TOKEN) return;

  const bootstrapCookie = request.cookies.get(PH_BOOTSTRAP_COOKIE);
  const phCookie = request.cookies.get(PH_COOKIE_KEY);

  let distinctId: string;
  if (bootstrapCookie?.value) {
    try {
      distinctId = (JSON.parse(bootstrapCookie.value) as { distinctId?: string })["distinctId"] ?? "";
    } catch {
      distinctId = "";
    }
  } else if (phCookie?.value) {
    try {
      distinctId = (JSON.parse(phCookie.value) as { distinct_id?: string })["distinct_id"] ?? "";
    } catch {
      distinctId = "";
    }
  } else {
    distinctId = "";
  }
  if (!distinctId) distinctId = crypto.randomUUID();

  const res = await fetch(`${PH_HOST}/flags?v=2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: PH_TOKEN, distinct_id: distinctId }),
    signal: AbortSignal.timeout(800),
  });
  if (!res.ok) return;

  const payload = (await res.json()) as { featureFlags?: Record<string, string | boolean> };
  const bootstrapValue = JSON.stringify({ distinctId, featureFlags: payload["featureFlags"] ?? {} });

  const cookieDomain = process.env["NEXT_PUBLIC_COOKIE_DOMAIN"];
  response.cookies.set(PH_BOOTSTRAP_COOKIE, bootstrapValue, {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
    httpOnly: false,
    domain: cookieDomain || undefined,
  });
}
