import { ROSETTA } from "~/lib/i18n";

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">{t("heading")}</h1>
      <p className="text-muted-foreground">{t("placeholder")}</p>
    </main>
  );
}

const LOCALE_ES = {
  heading: "Precios",
  placeholder: "Próximamente. Los planes y precios se publicarán antes del lanzamiento a producción.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Pricing",
  placeholder: "Coming soon. Plans and prices will be published before the production launch.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Preços",
  placeholder: "Em breve. Os planos e preços serão publicados antes do lançamento em produção.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
