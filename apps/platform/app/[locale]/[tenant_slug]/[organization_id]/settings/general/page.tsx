import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganization } from "~/hooks/get-viewer-organizations";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";
import { GeneralSettings } from "./general-settings";

export async function generateMetadata(
  props: PageProps<"/[locale]/[tenant_slug]/[organization_id]/settings/general">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("page_title") };
}

export default async function OrganizationGeneralSettingsPage(
  props: PageProps<"/[locale]/[tenant_slug]/[organization_id]/settings/general">,
) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await props.params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const { data: orgData } = await getViewerOrganization(organization_id);
  const organization = orgData?.["viewer_organization_by_id"];
  if (!organization) notFound();

  return <GeneralSettings organizationName={organization["organization_name"]} slug={tenant_slug} />;
}

const LOCALE_ES = { page_title: "Organización" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Organization" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Organização" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
