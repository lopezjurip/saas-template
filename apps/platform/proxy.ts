import { updateSession } from "@packages/supabase/client.middleware";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { JWT_DECODE_PAYLOAD } from "@packages/utils/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { APEX_HOSTNAME, APP_HOST } from "~/lib/constants";
import { debug } from "~/lib/debug";

const log = debug("proxy");

type TenantClaim = { id: number; slug: string };
type JwtPayload = { app_metadata?: { tenants?: TenantClaim[] } };

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

function extractSubdomain(hostname: string): string | null {
  // Strip port before matching — port varies per dev session but the domain is stable.
  const host = hostname.split(":")[0] ?? "";
  if (!host) return null;
  if (host === APEX_HOSTNAME || host === `www.${APEX_HOSTNAME}`) return null;
  if (!host.endsWith(`.${APEX_HOSTNAME}`)) return null;
  const slug = host.slice(0, host.length - APEX_HOSTNAME.length - 1);
  if (!slug || slug === "www") return null;
  return slug;
}

function isApexPublicPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/health" || pathname === "/auth" || pathname.startsWith("/auth/");
}

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");

  // Classify the host: apex/www, tenant subdomain, or unknown (custom apex, phase 2).
  // Strip port for matching so the proxy works on any dev port, not just the configured default.
  const hostnameBase = hostname.split(":")[0] ?? "";
  const isApex = hostnameBase === APEX_HOSTNAME || hostnameBase === `www.${APEX_HOSTNAME}`;
  let slugFromHost: string | null = null;
  if (!isApex) {
    if (hostnameBase.endsWith(`.${APEX_HOSTNAME}`)) {
      slugFromHost = extractSubdomain(hostname);
    } else {
      // Unknown host (localhost/127.0.0.1/preview URL/custom apex). Custom apexes are phase 2 —
      // for now, bounce to the configured apex so cookies/session land on the right origin.
      const apexUrl = new URL(`${pathname}${request.nextUrl.search}`, `${proto}://${APP_HOST}`);
      return NextResponse.redirect(apexUrl);
    }
  }

  const { response: sessionResponse, supabase } = await updateSession(request);

  // Tenant subdomain: send /auth/* and /onboarding/* back to the apex so auth lives at one origin.
  // /health stays canonical at the apex too — fall through any subdomain /health to the apex page.
  if (slugFromHost) {
    if (pathname.startsWith("/auth") || pathname.startsWith("/onboarding") || pathname === "/health") {
      const url = new URL(pathname, `${proto}://${APP_HOST}`);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url);
    }
  }

  // Apex public routes — no auth required, but logged-in users shouldn't see the auth entry pages
  // (the form's server action gets bound to the wrong route after a client transition from /dashboard
  // and posts to the previous URL, producing "unexpected response from server").
  if (isApex && isApexPublicPath(pathname)) {
    const isAuthEntryPath = pathname === "/auth" || pathname.startsWith("/auth/email");
    if (isAuthEntryPath) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", `${proto}://${APP_HOST}`));
      }
    }
    return sessionResponse;
  }

  // Auth gate.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    const next = `${proto}://${hostname}${pathname}${request.nextUrl.search}`;
    const authUrl = new URL("/auth", `${proto}://${APP_HOST}`);
    authUrl.searchParams.set("next", next);
    return NextResponse.redirect(authUrl);
  }

  // Hook-injected claims (tenants) only exist in the JWT, not on the DB user record.
  // The `onboarded` claim is no longer used as a gate here — onboarding completion is
  // surfaced to users via page-level UX (e.g. a banner / nudge) rather than a hard redirect,
  // so users can land on /dashboard or any other route mid-onboarding without being bounced.
  const claims = JWT_DECODE_PAYLOAD(session.access_token) as JwtPayload | null;
  const tenants = claims?.["app_metadata"]?.["tenants"] ?? [];

  // Subdomain → membership check + rewrite to /[tenant_slug]{pathname}.
  if (slugFromHost) {
    const tenant_id = await resolveTenantIdFromSlug(slugFromHost);
    if (!tenant_id) {
      log.warn("unknown or disabled tenant subdomain", { slug: slugFromHost, hostname });
      return new NextResponse("Tenant not found", { status: 404 });
    }
    if (!tenants.some((t) => t["id"] === tenant_id)) {
      log.warn("user lacks membership for tenant subdomain", {
        slug: slugFromHost,
        tenant_id,
        user_tenant_ids: tenants.map((t) => t["id"]),
      });
      return new NextResponse("No tienes acceso a esta empresa.", { status: 403 });
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${slugFromHost}${pathname}`;
    const rewritten = NextResponse.rewrite(url, { request });
    return copyCookies(sessionResponse, rewritten);
  }

  // Apex protected paths (/dashboard, /tenants/create, /[tenant_slug]/...) — page-level membership
  // for tenant routes is handled by app/[tenant_slug]/page.tsx (notFound() if slug isn't in JWT).
  return sessionResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
