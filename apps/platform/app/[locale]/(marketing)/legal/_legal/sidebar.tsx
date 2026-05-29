"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEGAL_COPY, LEGAL_NAV, type LegalLocale, type LegalSection } from "./docs";

function ACTIVE_SECTION(pathname: string): LegalSection | null {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const found = (["terms", "privacy", "cookies", "dpa", "security"] as const).find((s) => s === last);
  return found ?? null;
}

export function LegalSidebar({ locale }: { locale: LegalLocale }) {
  const pathname = usePathname();
  const active = ACTIVE_SECTION(pathname);
  const items = LEGAL_NAV[locale];
  const copy = LEGAL_COPY[locale];

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="bg-muted/40 text-muted-foreground border-b px-3 py-2.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
          {copy.sidebarTitle}
        </div>
        <nav className="flex flex-col p-1.5" aria-label={copy.sidebarTitle}>
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}${item.path}`}
              data-active={item.id === active ? "true" : "false"}
              aria-current={item.id === active ? "page" : undefined}
              className={cn(
                "text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 items-center justify-between gap-2 rounded-md px-2.5 text-left text-[13px] no-underline",
                "data-[active=true]:bg-accent data-[active=true]:text-foreground data-[active=true]:font-medium",
              )}
            >
              <span>{item.label}</span>
              <span className="font-mono text-[10.5px] opacity-60">{item.path.replace("/legal/", "")}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
