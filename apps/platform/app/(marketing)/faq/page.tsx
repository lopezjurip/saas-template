import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";

export async function generateMetadata(props: PageProps<"/faq">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return {
    title: t("heading"),
    openGraph: {
      type: "website",
      url: URL_NEW("/faq", APP_URL).href,
      locale: locale,
      title: t("heading"),
      siteName: "SaaS Template",
    },
  };
}

export default async function FaqPage(props: PageProps<"/faq">) {
  const { t, locale } = await getRosetta(LOCALES);

  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: URL_NEW("/faq", APP_URL).href,
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
