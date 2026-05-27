import { RosettaImpl } from "@packages/rosetta/rosetta";
import Link from "next/link";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALE_ES = {
  heading: "Documentos legales",
  intro: "Selecciona el documento que quieras revisar:",
  terms: "Términos de servicio",
  privacy: "Política de privacidad",
  cookies: "Política de cookies",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    heading: "Legal documents",
    intro: "Select the document you'd like to review:",
    terms: "Terms of service",
    privacy: "Privacy policy",
    cookies: "Cookie policy",
  } satisfies typeof LOCALE_ES,
  pt: {
    heading: "Documentos legais",
    intro: "Selecione o documento que deseja revisar:",
    terms: "Termos de serviço",
    privacy: "Política de privacidade",
    cookies: "Política de cookies",
  } satisfies typeof LOCALE_ES,
};

export default async function LegalIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
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
