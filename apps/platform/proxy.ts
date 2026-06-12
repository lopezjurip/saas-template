import { updateSession } from "@packages/supabase/client.middleware";
import { URL_NEW } from "@packages/utils/url";
import { type NextRequest, NextResponse, userAgent } from "next/server";
import { APEX_HOSTNAME, APP_HOST, PROXY_LOG_ENABLED } from "~/lib/constants";
import { debug } from "~/lib/debug";
import { LOCALE_COOKIE, LOCALE_FROM_PATH, type SupportedLocale } from "~/lib/i18n";
import { LOCALE_FROM_REQUEST } from "~/lib/i18n.server";

const PH_TOKEN = process.env["NEXT_PUBLIC_POSTHOG_KEY"] ?? "";
const PH_HOST = process.env["NEXT_PUBLIC_POSTHOG_HOST"] ?? "https://us.i.posthog.com";
const PH_COOKIE_KEY = `ph_${PH_TOKEN}_posthog`;
const PH_BOOTSTRAP_COOKIE = "ph_bootstrap";

const log = debug("proxy");

const PUBLIC_PATH_REGEX = /^(\/|(\/(?:auth|legal|faq|pricing|opengraph-image|twitter-image|icon)(?:\/|$)))/;
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

  if (isGlobalMetadataAssetPath(pathname)) {
    const { response } = await updateSession(request);
    return response;
  }

  /** /health — no auth, no locale. */
  if (pathname === "/health") {
    const { response } = await updateSession(request);
    return response;
  }

  /**
   * Locale sentinel: /[locale]/path → /${locale}/path
   * Handles both raw brackets and percent-encoded form (%5Blocale%5D) browsers send after redirects.
   */
  const sentinelMatch = /^\/(?:\[locale\]|%5[Bb]locale%5[Dd]|_)\//i.exec(pathname);
  if (sentinelMatch) {
    const detected = LOCALE_FROM_REQUEST(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${detected}/${pathname.slice(sentinelMatch[0].length)}`;
    return setLocaleCookieOnResponse(NextResponse.redirect(url), detected);
  }

  /** Detect locale from URL first segment; if missing, resolve from cookie/header and redirect. */
  const { locale: localeFromPath, canonicalLocale, localeCandidate, pathAfterLocale } = LOCALE_FROM_PATH(pathname);
  if (!localeFromPath) {
    if (localeCandidate) {
      if (canonicalLocale) {
        const url = request.nextUrl.clone();
        const trailingPath = pathAfterLocale === "/" ? "" : pathAfterLocale;
        url.pathname = `/${canonicalLocale}${trailingPath}`;
        return setLocaleCookieOnResponse(NextResponse.redirect(url, 308), canonicalLocale);
      }

      const { response } = await updateSession(request);
      return response;
    }

    const detected = LOCALE_FROM_REQUEST(request);
    const url = request.nextUrl.clone();
    const trailingPath = pathname === "/" ? "" : pathname;
    url.pathname = `/${detected}${trailingPath}`;
    return setLocaleCookieOnResponse(NextResponse.redirect(url), detected);
  }
  const locale = localeFromPath;

  if (isGlobalMetadataAssetPath(pathAfterLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = pathAfterLocale;
    return setLocaleCookieOnResponse(NextResponse.rewrite(url), locale);
  }

  /**
   * Mutate the incoming request's cookie BEFORE updateSession creates its NextResponse.next({request}).
   * Downstream server components (root layout, server actions) read cookies via next/headers `cookies()`,
   * which reflects the request snapshot — so if we only set on the response, server-rendered output
   * (notably <html lang>) reads the previous request's cookie and falls out of sync with the URL.
   */
  request.cookies.set(LOCALE_COOKIE, locale);

  const { response: sessionResponse, supabase } = await updateSession(request);

  /** Bots get public content without session overhead. */
  if (isBot && isLocalizedPublicPath(pathAfterLocale)) {
    return setLocaleCookieOnResponse(NextResponse.next(), locale);
  }

  /**
   * Public routes — no auth required, but logged-in users shouldn't see auth entry pages.
   * (The form's server action gets bound to the wrong route after a client transition from /home
   * and posts to the previous URL, producing "unexpected response from server".)
   */
  if (isLocalizedPublicPath(pathAfterLocale)) {
    const isAuthEntryPath =
      pathAfterLocale === "/auth" ||
      pathAfterLocale.startsWith("/auth/email") ||
      pathAfterLocale.startsWith("/auth/phone") ||
      pathAfterLocale.startsWith("/auth/document");
    if (isAuthEntryPath) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        return setLocaleCookieOnResponse(
          NextResponse.redirect(URL_NEW(`/${locale}/home`, `${proto}://${APP_HOST}`)),
          locale,
        );
      }
    }
    // Bootstrap PostHog flags for marketing routes only (landing, pricing, etc.).
    const isMarketingPath =
      pathAfterLocale === "/" ||
      pathAfterLocale.startsWith("/faq") ||
      pathAfterLocale.startsWith("/pricing") ||
      pathAfterLocale.startsWith("/legal");
    if (isMarketingPath) {
      await setPostHogBootstrap(request, sessionResponse);
    }
    return setLocaleCookieOnResponse(sessionResponse, locale);
  }

  /** Protected paths — auth and tenant gates handled by layout. */
  return setLocaleCookieOnResponse(sessionResponse, locale);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap|llms.txt|manifest.webmanifest|sw.js).*)",
  ],
};

function isLocalizedPublicPath(pathAfterLocale: string): boolean {
  return PUBLIC_PATH_REGEX.test(pathAfterLocale);
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
