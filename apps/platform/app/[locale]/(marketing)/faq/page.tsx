import type { Metadata } from "next";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, ROSETTA, SUPPORTED_LOCALES } from "~/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  return {
    title: t("heading"),
    alternates: {
      canonical: `${base}/${safeLocale}/faq`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}/faq`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/faq`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/faq`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title: t("heading"),
      siteName: "SaaS Template",
    },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
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
  heading: "Preguntas frecuentes",
  placeholder: "Próximamente. Las preguntas frecuentes se publicarán antes del lanzamiento a producción.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Frequently asked questions",
  placeholder: "Coming soon. FAQs will be published before the production launch.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Perguntas frequentes",
  placeholder: "Em breve. As perguntas frequentes serão publicadas antes do lançamento em produção.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
