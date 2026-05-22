import { updateSession } from "@packages/supabase/client.middleware";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";

type TenantClaim = { id: number; slug: string };

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

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const parts = hostname.split(".");

  // bare localhost (e.g. "localhost:7002") has no subdomain — skip auth, let the app render a landing page.
  if (parts.length === 1) {
    return NextResponse.next();
  }

  // Extract slug from {slug}.humane.cl or {slug}.localhost:7002
  const slug = parts[0] ?? "";
  if (!slug) return NextResponse.next();

  const tenantId = await resolveTenantIdFromSlug(slug);
  if (!tenantId) {
    return new NextResponse("Tenant not found", { status: 404 });
  }

  const { response, supabase } = await updateSession(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:7000";
    return NextResponse.redirect(`${platformUrl}/auth?next=${encodeURIComponent(request.url)}`);
  }

  const tenants = (user.app_metadata?.tenants ?? []) as TenantClaim[];
  const isMember = tenants.some((t) => t.id === tenantId);

  if (!isMember) {
    return new NextResponse("No tienes acceso a esta empresa.", { status: 403 });
  }

  response.headers.set("x-tenant-slug", slug);
  response.headers.set("x-tenant-id", String(tenantId));
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
