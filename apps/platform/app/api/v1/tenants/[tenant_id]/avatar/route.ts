import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";

/**
 * Stable avatar URL for a tenant (company). Resolves the latest logo from `storage_tenants` and
 * streams its bytes; 404 when none. See the organizations route for the rationale.
 * Use `src="/api/v1/tenants/{id}/avatar"`.
 */
export const GET = createZodRoute()
  .params(z.object({ tenant_id: z.coerce.number().int().positive() }))
  .handler(async (_request, context) => {
    const supabase = createSupabaseServiceRoleClient();
    const { data } = await supabase
      .from("storage_tenants")
      .select("src")
      .eq("tenant_id", context.params.tenant_id)
      .eq("folder", "avatar")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return streamPublicAvatar(data?.["src"]);
  });
