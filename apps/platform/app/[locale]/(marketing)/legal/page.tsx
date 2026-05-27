import Link from "next/link";
import { ROSETTA } from "~/lib/i18n";

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
