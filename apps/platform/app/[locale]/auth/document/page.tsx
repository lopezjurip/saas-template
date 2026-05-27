import { RosettaImpl } from "@packages/rosetta/rosetta";
import Link from "next/link";
import { getCountries } from "~/hooks/get-countries";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";
import { DocumentFlow } from "./document-flow";

const LOCALE_ES = {
  title: "Ingresa con documento",
  back: "← Cambiar método de ingreso",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Sign in with document",
    back: "← Change sign-in method",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Entrar com documento",
    back: "← Trocar método de entrada",
  } satisfies typeof LOCALE_ES,
};

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
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
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
