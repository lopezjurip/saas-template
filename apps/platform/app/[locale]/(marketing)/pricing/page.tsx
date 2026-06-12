import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, ROSETTA, SUPPORTED_LOCALES } from "~/lib/i18n";
import { PricingClient } from "./pricing-client";

export async function generateMetadata(props: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: URL_NEW("/[locale]/pricing", APP_URL, { replace: { locale: safeLocale } }).href,
      languages: {
        ...Object.fromEntries(
          SUPPORTED_LOCALES.map((l) => [l, URL_NEW("/[locale]/pricing", APP_URL, { replace: { locale: l } }).href]),
        ),
        "x-default": URL_NEW("/[locale]/pricing", APP_URL, { replace: { locale: DEFAULT_LOCALE } }).href,
      },
    },
    openGraph: {
      type: "website",
      url: URL_NEW("/[locale]/pricing", APP_URL, { replace: { locale: safeLocale } }).href,
      locale: safeLocale,
      title: t("title"),
      siteName: "SaaS Template",
    },
  };
}

export default async function PricingPage(props: PageProps<"/[locale]/pricing">) {
  const { locale } = await props.params;

  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: URL_NEW("/[locale]/pricing", APP_URL, { replace: { locale } }).href,
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
