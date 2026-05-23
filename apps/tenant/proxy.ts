import { updateSession } from "@packages/supabase/client.middleware";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";

type TenantClaim = { id: number; slug: string };

type JwtPayload = { app_metadata?: { tenants?: TenantClaim[] } };

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

function extractTenantSlug(hostname: string, tenantHost: string): string | null {
  if (!hostname) return null;
  if (hostname === tenantHost || hostname === `www.${tenantHost}`) return null;
  const suffix = `.${tenantHost}`;
  if (!hostname.endsWith(suffix)) return null;
  const slug = hostname.slice(0, hostname.length - suffix.length);
  return slug || null;
}

export async function proxy(request: NextRequest) {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://platform.lvh.me:7003";
  const tenantHost = process.env.NEXT_PUBLIC_TENANT_HOST ?? "lvh.me:7002";
  const hostname = request.headers.get("host") ?? "";

  const slug = extractTenantSlug(hostname, tenantHost);

  // No tenant subdomain (bare tenant host or a hostname outside the expected base) — send the user to platform auth.
  if (!slug) {
    return NextResponse.redirect(`${platformUrl}/auth`);
  }

  const tenantId = await resolveTenantIdFromSlug(slug);
  if (!tenantId) {
    return new NextResponse("Tenant not found", { status: 404 });
  }

  // updateSession already calls getUser() to validate + refresh the JWT.
  // Hook-injected claims live in the JWT itself, not on the user record — decode them directly.
  const { response: sessionResponse, supabase } = await updateSession(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
    const next = `${proto}://${hostname}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(`${platformUrl}/auth?next=${encodeURIComponent(next)}`);
  }

  const claims = decodeJwtPayload(session.access_token);
  const tenants = (claims?.app_metadata?.tenants ?? []) as TenantClaim[];
  const isMember = tenants.some((t) => t.id === tenantId);

  if (!isMember) {
    return new NextResponse("No tienes acceso a esta empresa.", { status: 403 });
  }

  // Rewrite to the [tenant_slug] route segment so pages read the slug from params.
  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${url.pathname}`;
  const rewritten = NextResponse.rewrite(url, { request });
  for (const cookie of sessionResponse.cookies.getAll()) {
    rewritten.cookies.set(cookie);
  }
  return rewritten;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
