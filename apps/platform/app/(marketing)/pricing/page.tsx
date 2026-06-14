import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";
import { PricingClient } from "./pricing-client";

export async function generateMetadata(props: PageProps<"/pricing">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      type: "website",
      url: URL_NEW("/pricing", APP_URL).href,
      locale: locale,
      title: t("title"),
      siteName: "SaaS Template",
    },
  };
}

export default async function PricingPage(props: PageProps<"/pricing">) {
  const { locale } = await getRosetta(LOCALES);

  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: URL_NEW("/pricing", APP_URL).href,
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
