import type { Metadata } from "next";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";
import { AgencyCreate } from "./agency-create";

export async function generateMetadata(props: PageProps<"/[locale]/agencies/create">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencyCreatePage(props: PageProps<"/[locale]/agencies/create">) {
  const { locale } = await props.params;
  assertLocale(locale);

  return <AgencyCreate locale={locale} />;
}

const LOCALE_ES = { page_title: "Crear agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Create agency" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Criar agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
