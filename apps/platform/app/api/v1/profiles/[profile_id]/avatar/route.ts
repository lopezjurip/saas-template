import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for a profile. Resolves the latest avatar from `storage_profiles` (keyed by the
 * profile uuid) and streams its bytes; 404 when none. See the organizations route for the rationale.
 * Use `src="/api/v1/profiles/{id}/avatar"`.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/v1/profiles/[profile_id]/avatar">) {
  const { profile_id } = await ctx.params;
  if (!profile_id) return new NextResponse(null, { status: 404 });

  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("storage_profiles")
    .select("src")
    .eq("profile_id", profile_id)
    .eq("folder", "avatar")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return streamPublicAvatar(data?.["src"]);
}
