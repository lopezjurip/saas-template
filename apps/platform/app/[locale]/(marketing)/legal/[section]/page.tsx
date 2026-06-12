import { promises as fs } from "node:fs";
import path from "node:path";
import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { getRosetta } from "~/hooks/get-rosetta";
import { APP_URL } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, SUPPORTED_LOCALES } from "~/lib/i18n";
import { ROUTE } from "~/lib/route";

type LegalLocale = "es" | "en" | "pt";
type LegalSection = "terms" | "privacy" | "cookies" | "dpa" | "security";

const SECTIONS: LegalSection[] = ["terms", "privacy", "cookies", "dpa", "security"];

const SECTION_LABELS: Record<LegalLocale, Record<LegalSection, string>> = {
  es: { terms: "Términos del servicio", privacy: "Privacidad", cookies: "Cookies", dpa: "DPA", security: "Seguridad" },
  en: { terms: "Terms of Service", privacy: "Privacy", cookies: "Cookies", dpa: "DPA", security: "Security" },
  pt: { terms: "Termos de Serviço", privacy: "Privacidade", cookies: "Cookies", dpa: "DPA", security: "Segurança" },
};

function toLegalLocale(locale: string): LegalLocale {
  if (locale.startsWith("en")) return "en";
  if (locale.startsWith("pt")) return "pt";
  return "es";
}

async function loadMarkdown(locale: LegalLocale, section: LegalSection): Promise<string | null> {
  try {
    return await fs.readFile(path.join(process.cwd(), "content/legal", locale, `${section}.md`), "utf-8");
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata(props: PageProps<"/[locale]/legal/[section]">): Promise<Metadata> {
  const { locale, section } = await props.params;
  if (!SECTIONS.includes(section as LegalSection)) notFound();
  const legalLocale = toLegalLocale(locale);
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  const title = SECTION_LABELS[legalLocale][section as LegalSection];
  return {
    title,
    alternates: {
      canonical: URL_NEW("/[locale]/legal/[section]", APP_URL, { replace: { locale: safeLocale, section } }).href,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, URL_NEW("/[locale]/legal/[section]", APP_URL, { replace: { locale: l, section } }).href])),
        "x-default": URL_NEW("/[locale]/legal/[section]", APP_URL, { replace: { locale: DEFAULT_LOCALE, section } }).href,
      },
    },
    openGraph: {
      type: "website",
      url: URL_NEW("/[locale]/legal/[section]", APP_URL, { replace: { locale: safeLocale, section } }).href,
      locale: safeLocale,
      title,
      siteName: "SaaS Template",
    },
  };
}

export default async function LegalSectionPage(props: PageProps<"/[locale]/legal/[section]">) {
  const { locale, section } = await props.params;
  if (!SECTIONS.includes(section as LegalSection)) notFound();
  const { t } = await getRosetta(LOCALES, locale);
  const legalLocale = toLegalLocale(locale);
  const content = await loadMarkdown(legalLocale, section as LegalSection);

  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: URL_NEW("/[locale]/legal/[section]", APP_URL, { replace: { locale, section } }).href,
    inLanguage: locale,
  };

  return (
    <>
      <JsonLd data={webPageSchema} />
      <article className="flex flex-col gap-6">
        <nav aria-label="Breadcrumb">
          <ol className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
            <li>
              <Link href={ROUTE("/[locale]/legal", { locale })} className="hover:text-foreground no-underline">
                /legal
              </Link>
            </li>
            <li className="opacity-50" aria-hidden="true">
              /
            </li>
            <li className="text-foreground" aria-current="page">
              {section}
            </li>
          </ol>
        </nav>

        {content ? (
          <div className="prose prose-neutral dark:prose-invert max-w-[68ch]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t("coming_soon")}</p>
        )}
      </article>
    </>
  );
}

const LOCALE_ES = { coming_soon: "Próximamente." };
const LOCALE_EN: typeof LOCALE_ES = { coming_soon: "Coming soon." };
const LOCALE_PT: typeof LOCALE_ES = { coming_soon: "Em breve." };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
