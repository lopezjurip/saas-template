import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganization } from "~/hooks/get-viewer-organizations";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";
import { ExternalAccess } from "./external-access";

export async function generateMetadata(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/external-access">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationExternalAccessPage(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/external-access">,
) {
  const { locale, organization_id: organization_id_param } = await props.params;
  assertLocale(locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const { data: orgData } = await getViewerOrganization(organization_id);
  const organization = orgData?.["organization"];
  if (!organization) notFound();

  return <ExternalAccess organizationName={organization["organization_name"]} />;
}

const LOCALE_ES = { page_title: "Acceso externo" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "External access" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Acesso externo" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
