import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { IS_ACTIVE_MEMBERSHIP } from "~/lib/agencies";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ExternalAccess, type ExternalAccessAgency } from "./external-access";

export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/external-access">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationExternalAccessPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/external-access">,
) {
  const { organization_id: organization_id_param } = await props.params;
  const locale = await getServerLocale();
  const { t } = await getRosetta(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  const supabase = await createSupabaseServerClient();
  const { data: canManage } = await supabase.rpc("viewer_has_permission", {
    organization_id,
    permission_id: "organization_manage",
  });

  if (!canManage) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <Alert variant="destructive">
          <AlertDescription>{t("no_permission_alert")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  /**
   * Grants + agencies are service_role-only in RLS; use the admin client now that the
   * org-manage gate passed.
   */
  const admin = createSupabaseServiceRoleClient();

  const [agenciesRes, grantsRes, membershipsRes] = await Promise.all([
    admin
      .from("agencies")
      .select("agency_id, agency_name, agency_slug, agency_disabled_at")
      .is("agency_disabled_at", null)
      .order("agency_name", { ascending: true }),
    admin.from("agencies_organizations_grants").select("agency_id, organization_id, permission_id"),
    admin
      .from("agency_memberships")
      .select("agency_id, agency_membership_accepted_at, agency_membership_revoked_at, agency_membership_rejected_at"),
  ]);

  const activeByAgency = new Map<number, number>();
  for (const m of membershipsRes.data ?? []) {
    if (IS_ACTIVE_MEMBERSHIP(m)) activeByAgency.set(m.agency_id, (activeByAgency.get(m.agency_id) ?? 0) + 1);
  }

  const grantedHere = new Set<number>();
  const globalAgencies = new Set<number>();
  for (const g of grantsRes.data ?? []) {
    if (g.organization_id === null) {
      if (g.permission_id === "*") globalAgencies.add(g.agency_id);
    } else if (g.organization_id === organization_id) {
      grantedHere.add(g.agency_id);
    }
  }

  const all = agenciesRes.data ?? [];

  // Agencies with access to THIS org: org-scoped grants here + any global (platform) grant.
  const withAccess: ExternalAccessAgency[] = all
    .filter((a) => grantedHere.has(a.agency_id) || globalAgencies.has(a.agency_id))
    .map((a) => ({
      agency_id: a.agency_id,
      agency_name: a.agency_name,
      agency_slug: a.agency_slug,
      active_affiliates: activeByAgency.get(a.agency_id) ?? 0,
      is_global: globalAgencies.has(a.agency_id),
    }));

  // Agencies available to grant: not already granted here and not global.
  const available: ExternalAccessAgency[] = all
    .filter((a) => !grantedHere.has(a.agency_id) && !globalAgencies.has(a.agency_id))
    .map((a) => ({
      agency_id: a.agency_id,
      agency_name: a.agency_name,
      agency_slug: a.agency_slug,
      active_affiliates: activeByAgency.get(a.agency_id) ?? 0,
      is_global: false,
    }));

  return (
    <ExternalAccess
      organizationId={organization_id}
      organizationName={organization["organizationName"]}
      withAccess={withAccess}
      available={available}
    />
  );
}

const LOCALE_ES = {
  page_title: "Acceso externo",
  no_permission_alert: "No tienes permiso para administrar el acceso externo de esta organización.",
};
const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "External access",
  no_permission_alert: "You don't have permission to manage external access for this organization.",
};
const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Acesso externo",
  no_permission_alert: "Você não tem permissão para administrar o acesso externo desta organização.",
};
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
