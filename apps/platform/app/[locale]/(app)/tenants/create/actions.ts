"use server";

import { createServiceRoleClient } from "@packages/supabase/client.service";
import { debug } from "~/lib/debug";
import { authedAction } from "~/lib/safe-action.server";
import { createTenantSchema } from "./schemas";

const log = debug("tenants:create");

export const createTenant = authedAction
  .inputSchema(createTenantSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const admin = createServiceRoleClient();

    // Step 1: Create tenant.
    const tenantRes = await admin
      .from("tenants")
      .insert({ tenant_name: parsedInput.tenant_name, tenant_slug: parsedInput.tenant_slug })
      .select("tenant_id, tenant_slug")
      .single();

    if (tenantRes.error || !tenantRes.data) {
      const msg = String(tenantRes.error?.message ?? "");
      log.error("tenant insert failed", {
        profile_id: user.id,
        slug: parsedInput.tenant_slug,
        error: tenantRes.error,
      });
      if (msg.includes("duplicate") || msg.includes("unique")) {
        throw new Error("Ese identificador ya está en uso. Prueba otro.");
      }
      if (msg.includes("check") && msg.includes("tenant_slug")) {
        throw new Error("Ese identificador está reservado.");
      }
      throw new Error("No pudimos crear la empresa. Intenta de nuevo.");
    }

    const { tenant_id, tenant_slug } = tenantRes.data;

    // Step 2: Create default organization.
    const orgRes = await admin
      .from("organizations")
      .insert({
        tenant_id,
        organization_slug: parsedInput.tenant_slug,
        organization_name: parsedInput.tenant_name,
      })
      .select("organization_id")
      .single();

    if (orgRes.error || !orgRes.data) {
      log.error("organization insert failed; rolling back tenant", {
        profile_id: user.id,
        tenant_id,
        slug: parsedInput.tenant_slug,
        error: orgRes.error,
      });
      const rollback = await admin.from("tenants").delete().eq("tenant_id", tenant_id);
      if (rollback.error) {
        log.error("tenant rollback failed — orphan tenant row", {
          tenant_id,
          error: rollback.error,
        });
      }
      throw new Error("No pudimos crear la organización inicial. Intenta de nuevo.");
    }

    const { organization_id } = orgRes.data;

    // Step 3: Add creator as organization member. profile_id + accepted_at move together.
    const memberRes = await admin
      .from("organization_memberships")
      .insert({
        organization_id,
        profile_id: user.id,
        organization_membership_accepted_at: new Date().toISOString(),
      })
      .select("organization_membership_id")
      .single();

    if (memberRes.error) {
      log.error("organization_membership insert failed; rolling back tenant + org", {
        profile_id: user.id,
        tenant_id,
        organization_id,
        error: memberRes.error,
      });
      const rollback = await admin.from("tenants").delete().eq("tenant_id", tenant_id);
      if (rollback.error) {
        log.error("tenant rollback failed — orphan tenant + org rows", {
          tenant_id,
          organization_id,
          error: rollback.error,
        });
      }
      throw new Error("No pudimos asignarte como dueño. Intenta de nuevo.");
    }

    // Step 4: Grant wildcard permission so creator can do everything.
    const grantRes = await admin.from("organization_membership_permissions").insert({
      organization_membership_id: memberRes.data["organization_membership_id"],
      permission_id: "*",
    });

    if (grantRes.error) {
      log.error("permission grant failed; rolling back tenant + org + organization_membership", {
        profile_id: user.id,
        tenant_id,
        organization_id,
        error: grantRes.error,
      });
      const rollback = await admin.from("tenants").delete().eq("tenant_id", tenant_id);
      if (rollback.error) {
        log.error("tenant rollback failed — orphan rows left", {
          tenant_id,
          organization_id,
          error: rollback.error,
        });
      }
      throw new Error("No pudimos asignarte permisos. Intenta de nuevo.");
    }

    // Refresh the JWT so app_metadata.tenants/organizations pick up the new entries.
    const refresh = await supabase.auth.refreshSession();
    if (refresh.error) {
      log.warn("session refresh failed; new tenant claims may not be visible until next login", {
        profile_id: user.id,
        tenant_id,
        error: refresh.error,
      });
    }

    log.info("tenant created", {
      profile_id: user.id,
      tenant_id,
      organization_id,
      slug: tenant_slug,
    });

    return { slug: tenant_slug };
  });
