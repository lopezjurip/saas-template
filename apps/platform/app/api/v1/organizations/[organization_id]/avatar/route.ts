import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { type NextRequest, NextResponse } from "next/server";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for an organization. Resolves the latest uploaded logo from the FK-less
 * `storage_organizations` view and streams its bytes; 404 when none (so a shadcn `AvatarFallback`
 * shows initials). Avatars live in a public bucket, so no auth is needed. Lets callers use
 * `src="/api/v1/organizations/{id}/avatar"`.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/v1/organizations/[organization_id]/avatar">) {
  const { organization_id } = await ctx.params;
  const id = Number(organization_id);
  if (!Number.isInteger(id) || id <= 0) return new NextResponse(null, { status: 404 });

  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("storage_organizations")
    .select("src")
    .eq("organization_id", id)
    .eq("folder", "avatar")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return streamPublicAvatar(data?.["src"]);
}
