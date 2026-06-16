"use server";
import "server-only";

import { z } from "zod";
import { debug } from "~/lib/debug";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("app:t:[tenant_slug]:[organization_id]:settings:tenant:general:actions");

/**
 * Renames a tenant. The write goes through the viewer-scoped server client, so the
 * `tenants` UPDATE RLS policy (gated on `tenant_manage`) is the authority — a `.select()`
 * after the update detects an RLS-filtered no-op and surfaces it as `no_permission`.
 *
 * @example actionUpdateTenantName({ tenant_id: 1, tenant_name: "Acme Inc." })
 */
export const actionUpdateTenantName = authedAction
  .inputSchema(
    z.object({
      tenant_id: z.number().int().positive(),
      tenant_name: z.string().trim().min(1).max(256),
    }),
  )
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from("tenants")
      .update({ tenant_name: parsedInput.tenant_name })
      .eq("tenant_id", parsedInput.tenant_id)
      .select("tenant_id")
      .maybeSingle();

    if (error) {
      log.error("[actionUpdateTenantName] update failed: %o", { tenant_id: parsedInput.tenant_id, error });
      throw new Error("update_failed");
    }
    if (!data) {
      throw new Error("no_permission");
    }
    return { tenant_id: parsedInput.tenant_id };
  });
