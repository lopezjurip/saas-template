import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { getRosetta } from "~/hooks/get-rosetta";
import { APP_URL } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, SUPPORTED_LOCALES } from "~/lib/i18n";

export async function generateMetadata(props: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  return {
    title: t("heading"),
    alternates: {
      canonical: URL_NEW(`/${safeLocale}/faq`, APP_URL).href,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, URL_NEW(`/${l}/faq`, APP_URL).href])),
        "x-default": URL_NEW(`/${DEFAULT_LOCALE}/faq`, APP_URL).href,
      },
    },
    openGraph: {
      type: "website",
      url: URL_NEW(`/${safeLocale}/faq`, APP_URL).href,
      locale: safeLocale,
      title: t("heading"),
      siteName: "SaaS Template",
    },
  };
}

export default async function FaqPage(props: PageProps<"/[locale]/faq">) {
  const { t, locale } = await getRosetta(LOCALES);

  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: URL_NEW(`/${locale}/faq`, APP_URL).href,
    inLanguage: locale,
  };

  return (
    <>
      <JsonLd data={webPageSchema} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-muted-foreground">{t("placeholder")}</p>
      </main>
    </>
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
