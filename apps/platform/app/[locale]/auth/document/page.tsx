import Link from "next/link";
import { getCountries } from "~/hooks/get-countries";
import { ROSETTA } from "~/lib/i18n";
import { DocumentFlow } from "./document-flow";

type SearchParams = Promise<{ next?: string; error?: string }>;
type Params = Promise<{ locale: string }>;

export default async function DocumentEntryPage({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: Params;
}) {
  const sp = await searchParams;
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const { data: countriesData } = await getCountries();
  const countries = countriesData?.["addresses_level0Collection"]?.["edges"]?.map((e) => e["node"]) ?? [];
  const initialError = sp["error"];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">{t("title")}</h2>
      <DocumentFlow countries={countries} locale={locale} initialError={initialError} />
      <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
        {t("back")}
      </Link>
    </div>
  );
}

const LOCALE_ES = {
  title: "Ingresa con documento",
  back: "← Cambiar método de ingreso",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Sign in with document",
  back: "← Change sign-in method",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Entrar com documento",
  back: "← Trocar método de entrada",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
