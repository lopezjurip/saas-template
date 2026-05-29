import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";
import { LegalArticle } from "../_legal/article";
import { LEGAL_LOCALE, LEGAL_NAV, type LegalSection } from "../_legal/docs";

const SECTIONS: LegalSection[] = ["terms", "privacy", "cookies", "dpa", "security"];

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata(props: PageProps<"/[locale]/legal/[section]">): Promise<Metadata> {
  const { locale, section } = await props.params;
  if (!SECTIONS.includes(section as LegalSection)) notFound();
  const legalLocale = LEGAL_LOCALE(locale);
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  const base = `https://${APP_HOST}`;
  const nav = LEGAL_NAV[legalLocale].find((n) => n.id === section);
  const title = nav?.["label"] ?? section;
  return {
    title,
    alternates: {
      canonical: `${base}/${safeLocale}/legal/${section}`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}/legal/${section}`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/legal/${section}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/legal/${section}`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title,
      siteName: "Humane",
    },
  };
}

export default async function LegalSectionPage(props: PageProps<"/[locale]/legal/[section]">) {
  const { locale, section } = await props.params;
  if (!SECTIONS.includes(section as LegalSection)) notFound();
  return <LegalArticle locale={LEGAL_LOCALE(locale)} section={section as LegalSection} />;
}
