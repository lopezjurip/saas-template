import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
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

  // Enabled agencies + grant state + active-affiliate counts for this org, from a
  // security-definer RPC self-gated on `organization_manage` — no service-role client.
  const { data: rows } = await supabase.rpc("viewer_organization_external_agencies", { organization_id });

  const all = rows ?? [];

  // Agencies with access to THIS org: org-scoped grants here + any global (platform) grant.
  const withAccess: ExternalAccessAgency[] = all
    .filter((a) => a["granted_here"] || a["is_global"])
    .map((a) => ({
      agency_id: a["agency_id"],
      agency_name: a["agency_name"],
      agency_slug: a["agency_slug"],
      active_affiliates: a["active_affiliates"],
      is_global: a["is_global"],
    }));

  // Agencies available to grant: not already granted here and not global.
  const available: ExternalAccessAgency[] = all
    .filter((a) => !a["granted_here"] && !a["is_global"])
    .map((a) => ({
      agency_id: a["agency_id"],
      agency_name: a["agency_name"],
      agency_slug: a["agency_slug"],
      active_affiliates: a["active_affiliates"],
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
