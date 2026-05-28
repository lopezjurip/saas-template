import { CardContent, CardDescription, CardHeader } from "@packages/ui-common/shadcn/components/ui/card";
import type { Metadata } from "next";
import { ROSETTA } from "~/lib/i18n";
import { CreateTenantForm } from "./create-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("heading") };
}

export default async function CreateTenantPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return (
    <>
      <CardHeader className="items-center text-center">
        <CardDescription>{t("heading")}</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateTenantForm />
      </CardContent>
    </>
  );
}

const LOCALE_ES = {
  heading: "Crear empresa",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Create company",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Criar empresa",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
