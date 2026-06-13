"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";

/** "Volver" link back to the /auth entry, used on every step-2 page. */
export function AuthBackLink({ children }: { children?: React.ReactNode }) {
  const { t } = useRosetta(LOCALES);
  return (
    <Link
      href={ROUTE("/auth")}
      className="-ml-1.5 inline-flex items-center gap-1.5 self-start rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <ArrowLeft size={14} /> {children ?? t("default_label")}
    </Link>
  );
}

const LOCALE_ES = {
  default_label: "Usar otra cuenta",
};

const LOCALE_EN: typeof LOCALE_ES = {
  default_label: "Use another account",
};

const LOCALE_PT: typeof LOCALE_ES = {
  default_label: "Usar outra conta",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
