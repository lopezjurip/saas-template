import { createSupabaseServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
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
  const tenant_id = tenant["tenantId"];

  const current = orgData?.["organization"];
  if (!current || current["tenantId"] !== tenant_id) notFound();

  const profile = profileData?.["profile"];
  if (!profile) notFound();

  const { data: orgsData } = await getViewerOrganizations({ filter: { tenantId: { eq: tenant_id } } });
  const organizations = orgsData?.["organizations"]?.["edges"]?.map((edge) => edge["node"]) ?? [];

  // Org logos live in the FK-less `storage_organizations` view, so they can't ride the GraphQL
  // fragment — fetch the most recent avatar per org and attach it to the shell org objects.
  const supabase = await createSupabaseServerClient();
  const orgIds = organizations.map((organization) => organization["organizationId"]);
  const logoByOrgId = new Map<number, string>();
  if (orgIds.length > 0) {
    const { data: logoRows } = await supabase
      .from("storage_organizations")
      .select("organization_id, src, created_at")
      .in("organization_id", orgIds)
      .eq("folder", "avatar")
      .order("created_at", { ascending: false });
    for (const row of logoRows ?? []) {
      const id = row["organization_id"];
      const src = row["src"];
      if (id != null && src && !logoByOrgId.has(id)) {
        logoByOrgId.set(id, new URL(src, process.env["NEXT_PUBLIC_SUPABASE_URL"]!).toString());
      }
    }
  }
  const organizationsWithLogos = organizations.map((organization) => ({
    ...organization,
    logoSrc: logoByOrgId.get(organization["organizationId"]) ?? null,
  }));
  const currentWithLogo = { ...current, logoSrc: logoByOrgId.get(current["organizationId"]) ?? null };

  const viewer = { ...profile, email: user?.email ?? "" };

  // shadcn SidebarProvider persists expanded/collapsed in the `sidebar_state` cookie; default open.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <Shell
      locale={locale}
      tenant={tenant}
      organizations={organizationsWithLogos}
      current={currentWithLogo}
      viewer={viewer}
      defaultOpen={defaultOpen}
    >
      {children}
    </Shell>
  );
}
