import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { Markdown } from "~/components/markdown";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, SUPPORTED_LOCALES } from "~/lib/i18n";

const TITLES: Record<string, string> = {
  es: "Términos de servicio",
  en: "Terms of service",
  pt: "Termos de serviço",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  const title = TITLES[safeLocale] ?? TITLES[DEFAULT_LOCALE];
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

export default async function LegalTermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = join(process.cwd(), "content", "legal");
  let content: string;
  try {
    content = await readFile(join(base, locale, "terms.md"), "utf-8");
  } catch {
    content = await readFile(join(base, "es", "terms.md"), "utf-8");
  }
  return <Markdown>{content}</Markdown>;
}
