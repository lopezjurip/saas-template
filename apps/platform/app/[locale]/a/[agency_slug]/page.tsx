import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AGENCY_BY_SLUG } from "~/lib/agencies-mock";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";
import { AgencyConsole } from "./agency-console";

export async function generateMetadata(props: PageProps<"/[locale]/a/[agency_slug]">): Promise<Metadata> {
  const { locale, agency_slug } = await props.params;
  const agency = AGENCY_BY_SLUG(agency_slug);
  return { title: agency ? agency["name"] : ROSETTA(LOCALES, locale).t("page_title") };
}

export default async function AgencyConsolePage(props: PageProps<"/[locale]/a/[agency_slug]">) {
  const { locale, agency_slug } = await props.params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();

  const agency = AGENCY_BY_SLUG(agency_slug);
  if (!agency) notFound();

  return <AgencyConsole agency={agency} />;
}

const LOCALE_ES = { page_title: "Consola de agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agency console" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Console da agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
