"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE } from "~/lib/route";

/** "Volver" link back to the /auth entry, used on every step-2 page. */
export function AuthBackLink({ children = "Usar otra cuenta" }: { children?: React.ReactNode }) {
  const locale = useLocaleParam();
  return (
    <Link
      href={ROUTE("/[locale]/auth", { locale })}
      className="-ml-1.5 inline-flex items-center gap-1.5 self-start rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <ArrowLeft size={14} /> {children}
    </Link>
  );
}
