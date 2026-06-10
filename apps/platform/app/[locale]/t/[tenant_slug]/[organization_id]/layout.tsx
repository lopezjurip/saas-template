import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Shell } from "~/components/shell/shell";
import { SIDEBAR_DEFAULT_WIDTH, SIDEBAR_WIDTH_COOKIE } from "~/components/shell/sidebar";
import { getViewerOrganization, getViewerOrganizations } from "~/hooks/get-viewer-organizations";
import { getViewerProfile } from "~/hooks/get-viewer-profile";
import { getViewerTenantBySlug } from "~/hooks/get-viewer-tenants";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; tenant_slug: string; organization_id: string }>;
}) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await params;
  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const [user, { data: tenantData }, { data: orgData }, { data: profileData }] = await Promise.all([
    getSupabaseServerUser(),
    getViewerTenantBySlug(tenant_slug),
    getViewerOrganization(organization_id),
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

  const cookieStore = await cookies();
  const widthCookie = cookieStore.get(SIDEBAR_WIDTH_COOKIE)?.value;
  const parsedWidth = widthCookie ? Number.parseInt(widthCookie, 10) : Number.NaN;
  const initialSidebarWidth = Number.isFinite(parsedWidth) ? parsedWidth : SIDEBAR_DEFAULT_WIDTH;

  return (
    <Shell
      locale={locale}
      tenant={tenant}
      organizations={organizations}
      current={current}
      viewer={viewer}
      initialSidebarWidth={initialSidebarWidth}
    >
      {children}
    </Shell>
  );
}
