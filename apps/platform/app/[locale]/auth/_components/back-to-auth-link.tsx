import { RosettaImpl } from "@packages/rosetta/rosetta";
import Link from "next/link";
import { LOCALE_TO_BCP47 } from "~/lib/i18n";

const LOCALES = {
  es: { back: "← Cambiar método de ingreso" },
  en: { back: "← Change sign-in method" },
  pt: { back: "← Trocar método de entrada" },
};

export function BackToAuthLink({ locale }: { locale: string }) {
  const { t } = RosettaImpl.fromDictionary(LOCALES, LOCALE_TO_BCP47[locale as keyof typeof LOCALE_TO_BCP47] ?? "es-CL");
  return (
    <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
      {t("back")}
    </Link>
  );
}
