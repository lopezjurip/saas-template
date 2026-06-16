import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for a profile. Resolves the latest avatar from `storage_profiles` (keyed by the
 * profile uuid) and streams its bytes; 404 when none. See the organizations route for the rationale.
 * Use `src="/api/v1/profiles/{id}/avatar"`.
 */
export const GET = createZodRoute()
  // z.guid() (not z.uuid()) — loose, version-agnostic, matching the DB's internal.is_uuid.
  .params(z.object({ profile_id: z.guid() }))
  .handler(async (_request, context) => {
    const supabase = createSupabaseServiceRoleClient();
    const { data } = await supabase
      .from("storage_profiles")
      .select("src")
      .eq("profile_id", context.params.profile_id)
      .eq("folder", "avatar")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return streamPublicAvatar(data?.["src"]);
  });
