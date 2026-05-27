import { RosettaImpl } from "@packages/rosetta/rosetta";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALE_ES = {
  heading: "Precios",
  placeholder: "Próximamente. Los planes y precios se publicarán antes del lanzamiento a producción.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    heading: "Pricing",
    placeholder: "Coming soon. Plans and prices will be published before the production launch.",
  } satisfies typeof LOCALE_ES,
  pt: {
    heading: "Preços",
    placeholder: "Em breve. Os planos e preços serão publicados antes do lançamento em produção.",
  } satisfies typeof LOCALE_ES,
};

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">{t("heading")}</h1>
      <p className="text-muted-foreground">{t("placeholder")}</p>
    </main>
  );
}
