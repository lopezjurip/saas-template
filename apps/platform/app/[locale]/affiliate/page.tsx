import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AGENCIES } from "~/lib/agencies-mock";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";
import { AffiliateDashboard } from "./affiliate-dashboard";

export async function generateMetadata(props: PageProps<"/[locale]/affiliate">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AffiliatePage(props: PageProps<"/[locale]/affiliate">) {
  const { locale } = await props.params;
  assertLocale(locale);

  // Mock viewer: signed in as an affiliate of the first agency.
  const agency = AGENCIES[0];
  if (!agency) notFound();

  return <AffiliateDashboard agency={agency} />;
}

const LOCALE_ES = { page_title: "Portal de afiliado" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Affiliate portal" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Portal de afiliado" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
