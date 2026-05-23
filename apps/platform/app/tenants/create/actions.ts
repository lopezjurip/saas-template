"use server";

import { createServiceRoleClient } from "@packages/supabase/client.service";
import { authedAction } from "~/lib/safe-action";
import { createTenantSchema } from "./schemas";

export const createTenant = authedAction
  .inputSchema(createTenantSchema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const admin = createServiceRoleClient();

    // 1. Tenant
    const tenantRes = await admin
      .from("tenants")
      .insert({ tenant_name: parsedInput.tenant_name, tenant_slug: parsedInput.tenant_slug })
      .select("tenant_id, tenant_slug")
      .single();

    if (tenantRes.error || !tenantRes.data) {
      const msg = String(tenantRes.error?.message ?? "");
      if (msg.includes("duplicate") || msg.includes("unique")) {
        throw new Error("Ese identificador ya está en uso. Prueba otro.");
      }
      throw new Error("No pudimos crear la empresa. Intenta de nuevo.");
    }

    const { tenant_id: tenantId, tenant_slug: tenantSlug } = tenantRes.data;

    // 2. Default organization (mirrors the tenant).
    const orgRes = await admin
      .from("organizations")
      .insert({
        tenant_id: tenantId,
        organization_slug: parsedInput.tenant_slug,
        organization_name: parsedInput.tenant_name,
      })
      .select("organization_id")
      .single();

    if (orgRes.error || !orgRes.data) {
      await admin.from("tenants").delete().eq("tenant_id", tenantId);
      throw new Error("No pudimos crear la organización inicial. Intenta de nuevo.");
    }

    const { organization_id: organizationId } = orgRes.data;

    // 3. Membership: creator becomes owner of the default org.
    const memberRes = await admin.from("organization_members").insert({
      organization_id: organizationId,
      profile_id: user.id,
      organization_member_role: "owner",
    });

    if (memberRes.error) {
      await admin.from("tenants").delete().eq("tenant_id", tenantId);
      throw new Error("No pudimos asignarte como dueño. Intenta de nuevo.");
    }

    // Refresh the JWT so app_metadata.tenants/organizations pick up the new entries.
    await supabase.auth.refreshSession();

    return { slug: tenantSlug };
  });
