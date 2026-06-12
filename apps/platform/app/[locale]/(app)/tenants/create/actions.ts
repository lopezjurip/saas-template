"use server";
import "server-only";

import { createServiceRoleClient } from "@packages/supabase/client.service";
import { debug } from "~/lib/debug";
import { captureTenantCreated } from "~/lib/posthog/events.server";
import { authedAction } from "~/lib/safe-action.server";
import { createTenantSchema } from "./schemas";

const log = debug("app:[locale]:tenants:create:actions");

export const actionCreateTenant = authedAction
  .inputSchema(createTenantSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const admin = createServiceRoleClient();

    const { data, error } = await admin.rpc("tenant_create", {
      tenant_slug: parsedInput.tenant_slug,
      tenant_name: parsedInput.tenant_name,
      profile_id: user.id,
    });

    if (error || !data) {
      const msg = String(error?.message ?? "");
      log.error("[actionCreateTenant] rpc create_tenant failed", {
        profile_id: user.id,
        slug: parsedInput.tenant_slug,
        error,
      });
      if (msg.includes("duplicate") || msg.includes("unique")) {
        throw new Error("Ese identificador ya está en uso. Prueba otro.");
      }
      if (msg.includes("check") && msg.includes("tenant_slug")) {
        throw new Error("Ese identificador está reservado.");
      }
      throw new Error("No pudimos crear la empresa. Intenta de nuevo.");
    }

    const tenant_id: number = data["tenant_id"];
    const tenant_slug: string = data["tenant_slug"];
    const organization_id: number = data["organization_id"];

    log.info("[actionCreateTenant] tenant created", {
      profile_id: user.id,
      tenant_id,
      organization_id,
      slug: tenant_slug,
    });

    void captureTenantCreated(user.id, { tenant_id, tenant_slug, organization_id });

    return { slug: tenant_slug };
  });
