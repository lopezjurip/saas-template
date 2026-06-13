import type { Metadata } from "next";
import { getRosetta } from "~/lib/i18n.server";
import { AgencyCreate } from "./agency-create";

export async function generateMetadata(props: PageProps<"/agencies/create">): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencyCreatePage(props: PageProps<"/agencies/create">) {
  return <AgencyCreate />;
}

const LOCALE_ES = { page_title: "Crear agencia" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Create agency" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Criar agência" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
