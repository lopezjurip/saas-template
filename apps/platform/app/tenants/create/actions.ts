"use server";

import { createServerClient } from "@packages/supabase/client.server";
import { createServiceRoleClient } from "@packages/supabase/client.service";
import { redirect } from "next/navigation";
import { createTenantSchema, type CreateTenantValues } from "./schemas";

type ActionResult = { error: string } | { ok: true; slug: string };

export async function createTenant(values: CreateTenantValues): Promise<ActionResult> {
  const parsed = createTenantSchema.safeParse(values);
  if (!parsed.success) return { error: "Formulario inválido" };

  const supabase = await createServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) redirect("/auth");

  const admin = createServiceRoleClient();

  // 1. Tenant
  // biome-ignore lint/suspicious/noExplicitAny: TS6 + supabase-js inference loses Insert type
  const tenantRes = await (admin.from("tenants") as any)
    .insert({ tenant_name: parsed.data.tenant_name, tenant_slug: parsed.data.tenant_slug })
    .select("tenant_id, tenant_slug")
    .single();

  if (tenantRes.error || !tenantRes.data) {
    const msg = String(tenantRes.error?.message ?? "");
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { error: "Ese identificador ya está en uso. Prueba otro." };
    }
    return { error: "No pudimos crear la empresa. Intenta de nuevo." };
  }

  const tenantId = tenantRes.data.tenant_id as number;
  const tenantSlug = tenantRes.data.tenant_slug as string;

  // 2. Default organization (mirrors the tenant).
  // biome-ignore lint/suspicious/noExplicitAny: same
  const orgRes = await (admin.from("organizations") as any)
    .insert({
      tenant_id: tenantId,
      organization_slug: parsed.data.tenant_slug,
      organization_name: parsed.data.tenant_name,
    })
    .select("organization_id")
    .single();

  if (orgRes.error || !orgRes.data) {
    // biome-ignore lint/suspicious/noExplicitAny: same
    await (admin.from("tenants") as any).delete().eq("tenant_id", tenantId);
    return { error: "No pudimos crear la organización inicial. Intenta de nuevo." };
  }

  const organizationId = orgRes.data.organization_id as number;

  // 3. Membership: creator becomes owner of the default org.
  // biome-ignore lint/suspicious/noExplicitAny: same
  const memberRes = await (admin.from("organization_members") as any).insert({
    organization_id: organizationId,
    profile_id: user.id,
    organization_member_role: "owner",
  });

  if (memberRes.error) {
    // biome-ignore lint/suspicious/noExplicitAny: same
    await (admin.from("tenants") as any).delete().eq("tenant_id", tenantId);
    return { error: "No pudimos asignarte como dueño. Intenta de nuevo." };
  }

  // Refresh the JWT so app_metadata.tenants/organizations pick up the new entries.
  await supabase.auth.refreshSession();

  return { ok: true, slug: tenantSlug };
}
