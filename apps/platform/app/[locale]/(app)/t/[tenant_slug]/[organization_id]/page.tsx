import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { assertLocale, getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { DashboardOverview } from "./dashboard-overview";

export async function generateMetadata(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationHomePage(props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]">) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await props.params;
  assertLocale(locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  return (
    <DashboardOverview
      organizationName={organization["organization_name"]}
      membersHref={ROUTE("/[locale]/t/[tenant_slug]/[organization_id]/settings/members", {
        locale,
        tenant_slug,
        organization_id,
      })}
    />
  );
}

const LOCALE_ES = { page_title: "Resumen" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Overview" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Resumo" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
