import { BackToAuthLink } from "~/app/[locale]/auth/_components/back-to-auth-link";
import { getCountries } from "~/hooks/get-countries";
import { ROSETTA } from "~/lib/i18n";
import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ email?: string; country?: string; kind?: string; value?: string }>;
type Params = Promise<{ locale: string }>;

export default async function EmailSignupPage({
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
  const prefilDocCountry = sp["country"] ?? "";
  const prefilDocKind = sp["kind"] === "passport" ? "passport" : sp["kind"] === "nin" ? "nin" : "";
  const prefilDocValue = sp["value"] ?? "";
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">{t("heading")}</h2>
      <SignupForm
        defaultEmail={sp["email"] ?? ""}
        defaultCountry={prefilDocCountry}
        defaultDocKind={prefilDocKind as "" | "nin" | "passport"}
        defaultDocValue={prefilDocValue}
        countries={countries}
      />
      <BackToAuthLink locale={locale} />
    </div>
  );
}

const LOCALE_ES = {
  heading: "Crear cuenta",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Create account",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Criar conta",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
