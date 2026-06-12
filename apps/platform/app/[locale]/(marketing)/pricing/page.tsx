import type { Metadata } from "next";
import { JsonLd } from "~/components/json-ld";
import { APP_HOST, APP_URL } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, ROSETTA, SUPPORTED_LOCALES } from "~/lib/i18n";
import { PricingClient } from "./pricing-client";

export async function generateMetadata(props: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${base}/${safeLocale}/pricing`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, `${base}/${l}/pricing`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/pricing`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/pricing`,
      locale: safeLocale,
      title: t("title"),
      siteName: "SaaS Template",
    },
  };
}

export default async function PricingPage(props: PageProps<"/[locale]/pricing">) {
  const { locale } = await props.params;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `${APP_URL.origin}/${locale}/pricing`,
    inLanguage: locale,
  };

  return (
    <>
      <JsonLd data={webPageSchema} />
      <PricingClient />
    </>
  );
}

const LOCALE_ES = {
  title: "Precios simples para cada etapa de tu equipo",
  subtitle: "Lorem ipsum dolor sit amet. Empieza gratis y crece cuando lo necesites.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Simple pricing for every stage of your team",
    subtitle: "Lorem ipsum dolor sit amet. Start free and grow when you need it.",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Preços simples para cada etapa do seu time",
    subtitle: "Lorem ipsum dolor sit amet. Comece grátis e cresça quando precisar.",
  } satisfies typeof LOCALE_ES,
};
