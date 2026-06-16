"use server";
import "server-only";

import { z } from "zod";
import { debug } from "~/lib/debug";
import { authedAction } from "~/lib/safe-action.server";

const log = debug("app:t:[tenant_slug]:[organization_id]:onboarding:actions");

/**
 * Records a non-derivable onboarding step's status (e.g. billing) on the tenant. The RPC is
 * SECURITY DEFINER and enforces `tenant_manage`; it raises on a non-holder.
 *
 * @example actionSetTenantOnboardingStep({ tenant_id: 1, step: "billing", status: "skipped" })
 */
export const actionSetTenantOnboardingStep = authedAction
  .inputSchema(
    z.object({
      tenant_id: z.number().int().positive(),
      step: z.string().min(1).max(64),
      status: z.enum(["pending", "done", "skipped"]),
    }),
  )
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { error } = await supabase.rpc("viewer_tenant_onboarding_set", {
      tenant_id: parsedInput.tenant_id,
      step: parsedInput.step,
      status: parsedInput.status,
    });
    if (error) {
      log.error("[actionSetTenantOnboardingStep] rpc failed: %o", { tenant_id: parsedInput.tenant_id, error });
      throw new Error(error.message);
    }
    return { tenant_id: parsedInput.tenant_id };
  });

/**
 * Dismisses the tenant onboarding nudge by stamping `tenant_onboarded_at`. Gated by `tenant_manage`.
 *
 * @example actionDismissTenantOnboarding({ tenant_id: 1 })
 */
export const actionDismissTenantOnboarding = authedAction
  .inputSchema(z.object({ tenant_id: z.number().int().positive() }))
  .action(async ({ parsedInput, ctx: { supabase } }) => {
    const { error } = await supabase.rpc("viewer_tenant_onboarding_finish", {
      tenant_id: parsedInput.tenant_id,
    });
    if (error) {
      log.error("[actionDismissTenantOnboarding] rpc failed: %o", { tenant_id: parsedInput.tenant_id, error });
      throw new Error(error.message);
    }
    return { tenant_id: parsedInput.tenant_id };
  });
