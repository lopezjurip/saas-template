import type { Metadata } from "next";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";
import { AgencyDirectory } from "./agency-directory";

export async function generateMetadata(props: PageProps<"/[locale]/admin/agencies">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AdminAgenciesPage(props: PageProps<"/[locale]/admin/agencies">) {
  const { locale } = await props.params;
  assertLocale(locale);

  return <AgencyDirectory base={`/${locale}/admin/agencies`} />;
}

const LOCALE_ES = { page_title: "Agencias" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agencies" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Agências" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
