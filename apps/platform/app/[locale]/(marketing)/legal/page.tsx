import type { Metadata } from "next";
import Link from "next/link";
import { APP_HOST } from "~/lib/constants";
import { DEFAULT_LOCALE, IS_SUPPORTED_LOCALE, LOCALE_TO_BCP47, ROSETTA, SUPPORTED_LOCALES } from "~/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  const base = `https://${APP_HOST}`;
  const safeLocale = IS_SUPPORTED_LOCALE(locale) ? locale : DEFAULT_LOCALE;
  return {
    title: t("heading"),
    alternates: {
      canonical: `${base}/${safeLocale}/legal`,
      languages: {
        ...Object.fromEntries(SUPPORTED_LOCALES.map((l) => [LOCALE_TO_BCP47[l], `${base}/${l}/legal`])),
        "x-default": `${base}/${DEFAULT_LOCALE}/legal`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${safeLocale}/legal`,
      locale: LOCALE_TO_BCP47[safeLocale],
      title: t("heading"),
      siteName: "Humane",
    },
  };
}

export default async function LegalIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = ROSETTA(LOCALES, locale);
  return (
    <>
      <h1>{t("heading")}</h1>
      <p>{t("intro")}</p>
      <ul>
        <li>
          <Link href={`/${locale}/legal/terms`}>{t("terms")}</Link>
        </li>
        <li>
          <Link href={`/${locale}/legal/privacy`}>{t("privacy")}</Link>
        </li>
        <li>
          <Link href={`/${locale}/legal/cookies`}>{t("cookies")}</Link>
        </li>
      </ul>
    </>
  );
}

const LOCALE_ES = {
  heading: "Documentos legales",
  intro: "Selecciona el documento que quieras revisar:",
  terms: "Términos de servicio",
  privacy: "Política de privacidad",
  cookies: "Política de cookies",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Legal documents",
  intro: "Select the document you'd like to review:",
  terms: "Terms of service",
  privacy: "Privacy policy",
  cookies: "Cookie policy",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Documentos legais",
  intro: "Selecione o documento que deseja revisar:",
  terms: "Termos de serviço",
  privacy: "Política de privacidade",
  cookies: "Política de cookies",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
