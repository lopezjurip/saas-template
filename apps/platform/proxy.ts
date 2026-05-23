import { updateSession } from "@packages/supabase/client.middleware";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";

type TenantClaim = { id: number; slug: string };
type JwtPayload = { app_metadata?: { tenants?: TenantClaim[]; onboarded?: boolean } };

function decodeJwtPayload(token: string): JwtPayload | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(segment.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

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

function extractSubdomain(hostname: string, apexHost: string): string | null {
  if (!hostname || !apexHost) return null;
  if (hostname === apexHost || hostname === `www.${apexHost}`) return null;
  if (!hostname.endsWith(`.${apexHost}`)) return null;
  const slug = hostname.slice(0, hostname.length - apexHost.length - 1);
  if (!slug || slug === "www") return null;
  return slug;
}

function isApexPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/health" ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  );
}

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}

export async function proxy(request: NextRequest) {
  const apexHost = process.env.NEXT_PUBLIC_APEX_HOST ?? "lvh.me:7003";
  const hostname = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");

  // Classify the host: apex/www, tenant subdomain, or unknown (custom apex, phase 2).
  const isApex = hostname === apexHost || hostname === `www.${apexHost}`;
  let slugFromHost: string | null = null;
  if (!isApex) {
    if (hostname.endsWith(`.${apexHost}`)) {
      slugFromHost = extractSubdomain(hostname, apexHost);
    } else {
      // Unknown host (localhost/127.0.0.1/preview URL/custom apex). Custom apexes are phase 2 —
      // for now, bounce to the configured apex so cookies/session land on the right origin.
      const apexUrl = new URL(`${pathname}${request.nextUrl.search}`, `${proto}://${apexHost}`);
      return NextResponse.redirect(apexUrl);
    }
  }

  const { response: sessionResponse, supabase } = await updateSession(request);

  // Tenant subdomain: send /auth/* and /onboarding/* back to the apex so auth lives at one origin.
  // /health stays canonical at the apex too — fall through any subdomain /health to the apex page.
  if (slugFromHost) {
    if (pathname.startsWith("/auth") || pathname.startsWith("/onboarding") || pathname === "/health") {
      const url = new URL(pathname, `${proto}://${apexHost}`);
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
        return NextResponse.redirect(new URL("/dashboard", `${proto}://${apexHost}`));
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
    const authUrl = new URL("/auth", `${proto}://${apexHost}`);
    authUrl.searchParams.set("next", next);
    return NextResponse.redirect(authUrl);
  }

  // Hook-injected claims (onboarded, tenants) only exist in the JWT, not on the DB user record.
  const claims = decodeJwtPayload(session.access_token);
  const onboarded = Boolean(claims?.app_metadata?.onboarded);
  const tenants = claims?.app_metadata?.tenants ?? [];

  // Onboarding gate.
  const isOnboardingRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
  if (!onboarded && !isOnboardingRoute) {
    const url = new URL("/onboarding", `${proto}://${apexHost}`);
    return NextResponse.redirect(url);
  }

  // Subdomain → membership check + rewrite to /[tenant_slug]{pathname}.
  if (slugFromHost) {
    const tenantId = await resolveTenantIdFromSlug(slugFromHost);
    if (!tenantId) return new NextResponse("Tenant not found", { status: 404 });
    if (!tenants.some((t) => t.id === tenantId)) {
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
