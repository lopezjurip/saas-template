import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";
import { AgencyCreate } from "./agency-create";

export async function generateMetadata(props: PageProps<"/[locale]/agencies/create">): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("page_title") };
}

export default async function AgencyCreatePage(props: PageProps<"/[locale]/agencies/create">) {
  const { locale } = await props.params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();

  return <AgencyCreate />;
}

const LOCALE_ES = { page_title: "Crear agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Create agency" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Criar agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
