import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AGENCY_BY_SLUG } from "~/lib/agencies-mock";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";
import { AffiliationInvite } from "./affiliation-invite";

export async function generateMetadata(
  props: PageProps<"/[locale]/admin/agencies/[slug]/affiliates/new">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("page_title") };
}

export default async function AdminAgencyAffiliateNewPage(
  props: PageProps<"/[locale]/admin/agencies/[slug]/affiliates/new">,
) {
  const { locale, slug } = await props.params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();

  const agency = AGENCY_BY_SLUG(slug);
  if (!agency) notFound();

  const pending = agency.affiliates.find((aff) => aff.state === "pending");

  return (
    <AffiliationInvite
      agencyName={agency.name}
      agencyHref={`/${locale}/admin/agencies/${agency.slug}`}
      defaultEmail={pending?.email ?? ""}
    />
  );
}

const LOCALE_ES = { page_title: "Afiliar persona" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Affiliate a person" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Afiliar uma pessoa" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
