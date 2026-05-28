import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { Markdown } from "~/components/markdown";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";

const TITLES: Record<string, string> = {
  es: "Política de privacidad",
  en: "Privacy policy",
  pt: "Política de privacidade",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  const title = TITLES[safeLocale] ?? TITLES[DEFAULT_LOCALE];
  return {
    title,
    alternates: {
      canonical: `${base}/${safeLocale}/legal/privacy`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}/legal/privacy`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/legal/privacy`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/legal/privacy`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title,
      siteName: "Humane",
    },
  };
}

export default async function LegalPrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = join(process.cwd(), "content", "legal");
  let content: string;
  try {
    content = await readFile(join(base, locale, "privacy.md"), "utf-8");
  } catch {
    content = await readFile(join(base, "es", "privacy.md"), "utf-8");
  }
  return <Markdown>{content}</Markdown>;
}
