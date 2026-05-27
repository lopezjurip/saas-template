import Link from "next/link";
import { ROSETTA } from "~/lib/i18n";

const LOCALES = {
  es: { back: "← Cambiar método de ingreso" },
  en: { back: "← Change sign-in method" },
  pt: { back: "← Trocar método de entrada" },
};

export function BackToAuthLink({ locale }: { locale: string }) {
  const { t } = ROSETTA(LOCALES, locale);
  return (
    <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
      {t("back")}
    </Link>
  );
}
