import type { Metadata } from "next";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";
import { LegalArticle } from "../_legal/article";
import { LEGAL_DOCS, LEGAL_LOCALE } from "../_legal/docs";

export async function generateMetadata(props: PageProps<"/[locale]/legal/terms">): Promise<Metadata> {
  const { locale } = await props.params;
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  const title = LEGAL_DOCS[LEGAL_LOCALE(safeLocale)].terms.title;
  return {
    title,
    alternates: {
      canonical: `${base}/${safeLocale}/legal/terms`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}/legal/terms`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/legal/terms`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/legal/terms`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title,
      siteName: "Humane",
    },
  };
}

export default async function LegalTermsPage(props: PageProps<"/[locale]/legal/terms">) {
  const { locale } = await props.params;
  return <LegalArticle locale={LEGAL_LOCALE(locale)} section="terms" />;
}
