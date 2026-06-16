import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for a tenant (company). Resolves the latest logo from `storage_tenants` and
 * streams its bytes; 404 when none. See the organizations route for the rationale.
 * Use `src="/api/v1/tenants/{id}/avatar"`.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/v1/tenants/[tenant_id]/avatar">) {
  const { tenant_id } = await ctx.params;
  const id = Number(tenant_id);
  if (!Number.isInteger(id) || id <= 0) return new NextResponse(null, { status: 404 });

  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("storage_tenants")
    .select("src")
    .eq("tenant_id", id)
    .eq("folder", "avatar")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return streamPublicAvatar(data?.["src"]);
}
