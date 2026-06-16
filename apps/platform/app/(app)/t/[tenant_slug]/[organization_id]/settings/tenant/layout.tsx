import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { notFound } from "next/navigation";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";

/**
 * Server-side gate for the company (tenant) settings group. Membership is already asserted by the
 * parent tenant layout; here we additionally require `tenant_manage` on the tenant. Hidden nav is
 * not access control — this layout is. Non-holders get a 404.
 */
export default async function TenantSettingsLayout(
  props: LayoutProps<"/t/[tenant_slug]/[organization_id]/settings/tenant">,
) {
  const { tenant_slug } = await props.params;
  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenant_slug);

  const supabase = await createSupabaseServerClient();
  const { data: canManage } = await supabase.rpc("viewer_has_tenant_permission", {
    tenant_id: tenant["tenantId"],
    permission_id: "tenant_manage",
  });
  if (!canManage) notFound();

  return props.children;
}
