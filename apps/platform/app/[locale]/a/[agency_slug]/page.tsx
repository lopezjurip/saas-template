import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AGENCY_BY_SLUG } from "~/lib/agencies-mock";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";
import { AgencyConsole } from "./agency-console";

export async function generateMetadata(props: PageProps<"/[locale]/a/[agency_slug]">): Promise<Metadata> {
  const { locale, agency_slug } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const agency = AGENCY_BY_SLUG(agency_slug);
  return { title: agency ? agency["name"] : t("page_title") };
}

export default async function AgencyConsolePage(props: PageProps<"/[locale]/a/[agency_slug]">) {
  const { locale, agency_slug } = await props.params;
  assertLocale(locale);

  const agency = AGENCY_BY_SLUG(agency_slug);
  if (!agency) notFound();

  return <AgencyConsole agency={agency} />;
}

const LOCALE_ES = { page_title: "Consola de agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agency console" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Console da agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
