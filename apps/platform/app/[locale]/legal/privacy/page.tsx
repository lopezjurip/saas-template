import { RosettaImpl } from "@packages/rosetta/rosetta";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALE_ES = {
  heading: "Política de privacidad",
  updated_at: "Última actualización: 26 de mayo de 2026",
  placeholder:
    "Humane procesa datos personales bajo el marco de la Ley 21.719 (Chile). Esta política describirá qué datos recolectamos, con qué finalidad, los derechos del titular y los procedimientos para ejercerlos. El texto definitivo se publicará antes del lanzamiento a producción.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    heading: "Privacy policy",
    updated_at: "Last updated: May 26, 2026",
    placeholder:
      "Humane processes personal data under the framework of Law 21.719 (Chile). This policy will describe what data we collect, for what purpose, the rights of the data subject, and the procedures to exercise them. The final text will be published before the production launch.",
  } satisfies typeof LOCALE_ES,
  pt: {
    heading: "Política de privacidade",
    updated_at: "Última atualização: 26 de maio de 2026",
    placeholder:
      "A Humane processa dados pessoais sob o marco da Lei 21.719 (Chile). Esta política descreverá quais dados coletamos, com qual finalidade, os direitos do titular e os procedimentos para exercê-los. O texto definitivo será publicado antes do lançamento em produção.",
  } satisfies typeof LOCALE_ES,
};

export default async function LegalPrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
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
