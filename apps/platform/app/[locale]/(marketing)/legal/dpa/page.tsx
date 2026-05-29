import type { Metadata } from "next";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";
import { LegalArticle } from "../_legal/article";
import { LEGAL_DOCS, LEGAL_LOCALE } from "../_legal/docs";

export async function generateMetadata(props: PageProps<"/[locale]/legal/dpa">): Promise<Metadata> {
  const { locale } = await props.params;
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  const title = LEGAL_DOCS[LEGAL_LOCALE(safeLocale)].dpa.title;
  return {
    title,
    alternates: {
      canonical: `${base}/${safeLocale}/legal/dpa`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}/legal/dpa`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/legal/dpa`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/legal/dpa`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title,
      siteName: "Humane",
    },
  };
}

export default async function LegalDpaPage(props: PageProps<"/[locale]/legal/dpa">) {
  const { locale } = await props.params;
  return <LegalArticle locale={LEGAL_LOCALE(locale)} section="dpa" />;
}
