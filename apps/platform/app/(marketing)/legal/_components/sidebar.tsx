"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTE } from "~/lib/route";

type LegalLocale = "es" | "en" | "pt";
type LegalSection = "terms" | "privacy" | "cookies" | "dpa" | "security";

const LEGAL_NAV: Record<LegalLocale, { id: LegalSection; label: string; slug: string }[]> = {
  es: [
    { id: "terms", label: "Términos del servicio", slug: "terms" },
    { id: "privacy", label: "Privacidad", slug: "privacy" },
    { id: "cookies", label: "Cookies", slug: "cookies" },
    { id: "dpa", label: "DPA", slug: "dpa" },
    { id: "security", label: "Seguridad", slug: "security" },
  ],
  en: [
    { id: "terms", label: "Terms of Service", slug: "terms" },
    { id: "privacy", label: "Privacy", slug: "privacy" },
    { id: "cookies", label: "Cookies", slug: "cookies" },
    { id: "dpa", label: "DPA", slug: "dpa" },
    { id: "security", label: "Security", slug: "security" },
  ],
  pt: [
    { id: "terms", label: "Termos de Serviço", slug: "terms" },
    { id: "privacy", label: "Privacidade", slug: "privacy" },
    { id: "cookies", label: "Cookies", slug: "cookies" },
    { id: "dpa", label: "DPA", slug: "dpa" },
    { id: "security", label: "Segurança", slug: "security" },
  ],
};

const SIDEBAR_TITLE: Record<LegalLocale, string> = {
  es: "Documentos",
  en: "Documents",
  pt: "Documentos",
};

function toLegalLocale(locale: string): LegalLocale {
  if (locale.startsWith("en")) return "en";
  if (locale.startsWith("pt")) return "pt";
  return "es";
}

export function LegalSidebar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const appLocale = segments[0] ?? "es";
  const last = segments.at(-1);
  const legalLocale = toLegalLocale(appLocale);
  const active = (["terms", "privacy", "cookies", "dpa", "security"] as const).find((s) => s === last) ?? null;
  const items = LEGAL_NAV[legalLocale];
  const sidebarTitle = SIDEBAR_TITLE[legalLocale];

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="bg-muted/40 text-muted-foreground border-b px-3 py-2.5 text-tiny font-semibold tracking-[0.08em] uppercase">
          {sidebarTitle}
        </div>
        <nav className="flex flex-col p-1.5" aria-label={sidebarTitle}>
          {items.map((item) => (
            <Link
              key={item["id"]}
              href={ROUTE("/legal/[section]", { section: item["slug"] })}
              data-active={item["id"] === active ? "true" : "false"}
              aria-current={item["id"] === active ? "page" : undefined}
              className={cn(
                "text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 items-center justify-between gap-2 rounded-md px-2.5 text-left text-sm/normal no-underline",
                "data-[active=true]:bg-accent data-[active=true]:text-foreground data-[active=true]:font-medium",
              )}
            >
              <span>{item["label"]}</span>
              <span className="font-mono text-tiny opacity-60">{item["slug"]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
