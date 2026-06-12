import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRosetta } from "~/hooks/get-rosetta";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { assertLocale } from "~/lib/i18n.server";
import { GeneralSettings } from "./general-settings";

export async function generateMetadata(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/general">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationGeneralSettingsPage(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/general">,
) {
  const { locale, tenant_slug, organization_id: organization_id_param } = await props.params;
  assertLocale(locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  return <GeneralSettings organizationName={organization["organization_name"]} slug={tenant_slug} />;
}

const LOCALE_ES = { page_title: "Organización" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Organization" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Organização" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
