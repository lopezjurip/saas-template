import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";
import { AgencyDirectory } from "./agency-directory";

export async function generateMetadata(props: PageProps<"/[locale]/admin/agencies">): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("page_title") };
}

export default async function AdminAgenciesPage(props: PageProps<"/[locale]/admin/agencies">) {
  const { locale } = await props.params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();

  return <AgencyDirectory base={`/${locale}/admin/agencies`} />;
}

const LOCALE_ES = { page_title: "Agencias" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Agencies" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Agências" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
