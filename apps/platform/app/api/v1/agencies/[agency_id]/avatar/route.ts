import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for an agency. Resolves the latest logo from `storage_agencies` (keyed by the
 * agency uuid) and streams its bytes; 404 when none. See the organizations route for the rationale.
 * Use `src="/api/v1/agencies/{id}/avatar"`.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/v1/agencies/[agency_id]/avatar">) {
  const { agency_id } = await ctx.params;
  if (!agency_id) return new NextResponse(null, { status: 404 });

  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("storage_agencies")
    .select("src")
    .eq("agency_id", agency_id)
    .eq("folder", "avatar")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return streamPublicAvatar(data?.["src"]);
}
