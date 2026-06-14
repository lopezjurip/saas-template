import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Shell } from "~/components/shell/shell";
import { getViewerOrganizationById, getViewerOrganizations } from "~/hooks/get-viewer-organizations";
import { getViewerProfile } from "~/hooks/get-viewer-profile";
import { getViewerTenantBySlug } from "~/hooks/get-viewer-tenants";
import { getServerLocale } from "~/lib/i18n.server";

export default async function OrganizationLayout({
  children,
  params,
}: LayoutProps<"/t/[tenant_slug]/[organization_id]">) {
  const { tenant_slug, organization_id: organization_id_param } = await params;
  const locale = await getServerLocale();
  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const [user, { data: tenantData }, { data: orgData }, { data: profileData }] = await Promise.all([
    getSupabaseServerUser(),
    getViewerTenantBySlug(tenant_slug),
    getViewerOrganizationById(organization_id),
    getViewerProfile(),
  ]);

  const tenant = tenantData?.["tenant"];
  if (!tenant) notFound();
  const tenant_id = tenant["tenant_id"];

  const current = orgData?.["organization"];
  if (!current || current["tenant_id"] !== tenant_id) notFound();

  const profile = profileData?.["profile"];
  if (!profile) notFound();

  const { data: orgsData } = await getViewerOrganizations({ filter: { tenant_id: { eq: tenant_id } } });
  const organizations = orgsData?.["organizations"]?.["edges"]?.map((edge) => edge["node"]) ?? [];

  const viewer = { ...profile, email: user?.email ?? "" };

  // shadcn SidebarProvider persists expanded/collapsed in the `sidebar_state` cookie; default open.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <Shell
      locale={locale}
      tenant={tenant}
      organizations={organizations}
      current={current}
      viewer={viewer}
      defaultOpen={defaultOpen}
    >
      {children}
    </Shell>
  );
}
