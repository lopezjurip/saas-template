import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for an organization. Resolves the latest uploaded logo from the FK-less
 * `storage_organizations` view and streams its bytes; 404 when none (so a shadcn `AvatarFallback`
 * shows initials). Avatars live in a public bucket, so no auth is needed. Lets callers use
 * `src="/api/v1/organizations/{id}/avatar"`. Param validation via next-zod-route → 400 on a
 * malformed id.
 */
export const GET = createZodRoute()
  .params(z.object({ organization_id: z.coerce.number().int().positive() }))
  .handler(async (_request, context) => {
    const supabase = createSupabaseServiceRoleClient();
    const { data } = await supabase
      .from("storage_organizations")
      .select("src")
      .eq("organization_id", context.params.organization_id)
      .eq("folder", "avatar")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return streamPublicAvatar(data?.["src"]);
  });
