import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRosetta } from "~/hooks/get-rosetta";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { assertLocale } from "~/lib/i18n.server";
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

  const base = `/${locale}/t/${tenant_slug}/${organization_id}`;

  return (
    <DashboardOverview organizationName={organization["organization_name"]} membersHref={`${base}/settings/members`} />
  );
}

const LOCALE_ES = { page_title: "Resumen" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Overview" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Resumo" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
