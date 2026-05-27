import { RosettaImpl } from "@packages/rosetta/rosetta";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALE_ES = {
  heading: "Política de cookies",
  updated_at: "Última actualización: 26 de mayo de 2026",
  placeholder:
    "Humane usa cookies de sesión para autenticación y para guardar tu preferencia de idioma. No usamos cookies de tracking de terceros. El texto definitivo se publicará antes del lanzamiento a producción.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    heading: "Cookie policy",
    updated_at: "Last updated: May 26, 2026",
    placeholder:
      "Humane uses session cookies for authentication and to remember your locale preference. We do not use third-party tracking cookies. The final text will be published before the production launch.",
  } satisfies typeof LOCALE_ES,
  pt: {
    heading: "Política de cookies",
    updated_at: "Última atualização: 26 de maio de 2026",
    placeholder:
      "A Humane usa cookies de sessão para autenticação e para lembrar a sua preferência de idioma. Não usamos cookies de rastreamento de terceiros. O texto definitivo será publicado antes do lançamento em produção.",
  } satisfies typeof LOCALE_ES,
};

export default async function LegalCookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
  return (
    <article className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">{t("heading")}</h1>
      <p className="text-muted-foreground text-xs">{t("updated_at")}</p>
      <p>{t("placeholder")}</p>
    </article>
  );
}
