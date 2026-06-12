import { promises as fs } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { JsonLd } from "~/components/json-ld";
import { getRosetta } from "~/hooks/get-rosetta";
import { APP_HOST, APP_URL } from "~/lib/constants";
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
  const base = `https://${APP_HOST}`;
  const title = SECTION_LABELS[legalLocale][section as LegalSection];
  return {
    title,
    alternates: {
      canonical: `${base}/${safeLocale}/legal/${section}`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, `${base}/${l}/legal/${section}`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/legal/${section}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/legal/${section}`,
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

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `${APP_URL.origin}/${locale}/legal/${section}`,
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
