import { updateSession } from "@packages/supabase/client.middleware";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { URL_NEW } from "@packages/utils/url";
import { type NextRequest, NextResponse, userAgent } from "next/server";
import { APEX_HOSTNAME, APP_HOST } from "~/lib/constants";
import { debug } from "~/lib/debug";
import { EXTRACT_LOCALE_FROM_PATH, LOCALE_COOKIE, type SupportedLocale } from "~/lib/i18n";
import { RESOLVE_LOCALE_FROM_REQUEST } from "~/lib/i18n.server";

const log = debug("proxy");

async function resolveTenantIdFromSlug(slug: string): Promise<number | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("tenants")
    .select("tenant_id, tenant_disabled_at")
    .eq("tenant_slug", slug)
    .maybeSingle();
  if (!data || data.tenant_disabled_at) return null;
  return data.tenant_id;
}

const PUBLIC_PATH_REGEX = /^(\/|(\/(?:auth|legal|faq|pricing|opengraph-image|twitter-image|icon)(?:\/|$)))/;

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

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");

  const { isBot, device } = userAgent(request);
  log.debug("[proxy] request", { hostname, pathname, isBot, deviceType: device.type ?? "desktop" });

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
    const detected = RESOLVE_LOCALE_FROM_REQUEST(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${detected}/${pathname.slice(sentinelMatch[0].length)}`;
    return setLocaleCookieOnResponse(NextResponse.redirect(url), detected);
  }

  /** Detect locale from URL first segment; if missing, resolve from cookie/header and redirect. */
  const { locale: localeFromPath, pathAfterLocale } = EXTRACT_LOCALE_FROM_PATH(pathname);
  if (!localeFromPath) {
    const detected = RESOLVE_LOCALE_FROM_REQUEST(request);
    const url = request.nextUrl.clone();
    const trailingPath = pathname === "/" ? "" : pathname;
    url.pathname = `/${detected}${trailingPath}`;
    return setLocaleCookieOnResponse(NextResponse.redirect(url), detected);
  }
  const locale = localeFromPath;

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
    return setLocaleCookieOnResponse(sessionResponse, locale);
  }

  /** Auth gate. */
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    const next = `${proto}://${hostname}${pathname}${request.nextUrl.search}`;
    const authUrl = URL_NEW(`/${locale}/auth`, `${proto}://${APP_HOST}`);
    authUrl.searchParams.set("next", next);
    return setLocaleCookieOnResponse(NextResponse.redirect(authUrl), locale);
  }

  /**
   * Tenant path gate: /{locale}/t/{slug}/... — verify tenant exists and the caller can access it.
   * This is the access-control boundary: a logged-in non-member hitting /t/{slug} is blocked here.
   * Membership lives in the DB only (never in the JWT): the session-scoped client sees the tenant
   * row iff RLS allows it (viewer_tenant_ids / viewer_agency_tenant_ids resolve it server-side).
   */
  if (pathAfterLocale.startsWith("/t/")) {
    const segments = pathAfterLocale.split("/"); // ["", "t", "{slug}", ...]
    const tenantSlug = segments[2];
    if (!tenantSlug) {
      return new NextResponse("Tenant not found", { status: 404 });
    }
    const tenant_id = await resolveTenantIdFromSlug(tenantSlug);
    if (!tenant_id) {
      log.warn("unknown or disabled tenant", { slug: tenantSlug });
      return new NextResponse("Tenant not found", { status: 404 });
    }
    const { data: accessibleTenant } = await supabase
      .from("tenants")
      .select("tenant_id")
      .eq("tenant_id", tenant_id)
      .maybeSingle();
    if (!accessibleTenant) {
      log.warn("user lacks access for tenant", { slug: tenantSlug, tenant_id });
      return new NextResponse("No tienes acceso a esta empresa.", { status: 403 });
    }
  }

  /** Protected paths — session verified above, tenant gate applied for /t/ routes. */
  return setLocaleCookieOnResponse(sessionResponse, locale);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap|llms.txt|manifest.webmanifest).*)",
  ],
};
