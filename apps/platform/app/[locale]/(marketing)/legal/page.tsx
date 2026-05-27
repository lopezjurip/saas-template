import { RosettaImpl } from "@packages/rosetta/rosetta";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALE_ES = {
  intro: "Selecciona el documento que quieras revisar:",
  terms: "Términos de servicio",
  terms_desc: "Reglas de uso de la plataforma y obligaciones del usuario y de Humane.",
  privacy: "Política de privacidad",
  privacy_desc: "Cómo recolectamos, procesamos y almacenamos datos personales.",
  cookies: "Política de cookies",
  cookies_desc: "Qué cookies y tecnologías similares usamos y cómo las controlas.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    intro: "Select the document you'd like to review:",
    terms: "Terms of service",
    terms_desc: "Rules for using the platform and the obligations of the user and Humane.",
    privacy: "Privacy policy",
    privacy_desc: "How we collect, process, and store personal data.",
    cookies: "Cookie policy",
    cookies_desc: "Which cookies and similar technologies we use and how you control them.",
  } satisfies typeof LOCALE_ES,
  pt: {
    intro: "Selecione o documento que deseja revisar:",
    terms: "Termos de serviço",
    terms_desc: "Regras de uso da plataforma e obrigações do usuário e da Humane.",
    privacy: "Política de privacidade",
    privacy_desc: "Como coletamos, processamos e armazenamos dados pessoais.",
    cookies: "Política de cookies",
    cookies_desc: "Quais cookies e tecnologias similares usamos e como você os controla.",
  } satisfies typeof LOCALE_ES,
};

export default async function LegalIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
  const items = [
    { href: `/${locale}/legal/terms`, label: t("terms"), desc: t("terms_desc") },
    { href: `/${locale}/legal/privacy`, label: t("privacy"), desc: t("privacy_desc") },
    { href: `/${locale}/legal/cookies`, label: t("cookies"), desc: t("cookies_desc") },
  ];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">{t("intro")}</p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Button key={item.href} asChild variant="outline" className="h-auto justify-between p-4 text-left">
            <Link href={item.href}>
              <span className="flex flex-col gap-1">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground text-xs font-normal">{item.desc}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
