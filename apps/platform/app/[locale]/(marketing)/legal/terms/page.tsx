import { RosettaImpl } from "@packages/rosetta/rosetta";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALE_ES = {
  heading: "Términos de servicio",
  updated_at: "Última actualización: 26 de mayo de 2026",
  placeholder:
    "Este documento describe las reglas de uso de la plataforma Humane, las obligaciones recíprocas entre Humane y sus clientes (empresas y trabajadores), y los límites de responsabilidad. El texto definitivo se publicará antes del lanzamiento a producción.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    heading: "Terms of service",
    updated_at: "Last updated: May 26, 2026",
    placeholder:
      "This document describes the rules for using the Humane platform, the mutual obligations between Humane and its customers (companies and workers), and liability limits. The final text will be published before the production launch.",
  } satisfies typeof LOCALE_ES,
  pt: {
    heading: "Termos de serviço",
    updated_at: "Última atualização: 26 de maio de 2026",
    placeholder:
      "Este documento descreve as regras de uso da plataforma Humane, as obrigações recíprocas entre a Humane e seus clientes (empresas e trabalhadores), e os limites de responsabilidade. O texto definitivo será publicado antes do lançamento em produção.",
  } satisfies typeof LOCALE_ES,
};

export default async function LegalTermsPage({ params }: { params: Promise<{ locale: string }> }) {
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
