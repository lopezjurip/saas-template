import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for an agency. Resolves the latest logo from `storage_agencies` (keyed by the
 * agency id) and streams its bytes; 404 when none. See the organizations route for the rationale.
 * Use `src="/api/v1/agencies/{id}/avatar"`.
 */
export const GET = createZodRoute()
  .params(z.object({ agency_id: z.coerce.number().int().positive() }))
  .handler(async (_request, context) => {
    const supabase = createSupabaseServiceRoleClient();
    const { data } = await supabase
      .from("storage_agencies")
      .select("src")
      .eq("agency_id", context.params.agency_id)
      .eq("folder", "avatar")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return streamPublicAvatar(data?.["src"]);
  });
