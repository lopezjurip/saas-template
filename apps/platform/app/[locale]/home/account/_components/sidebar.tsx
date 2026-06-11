"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTE } from "~/lib/route";
import { ACCOUNT_SECTION_PATH, ACCOUNT_SECTIONS, type AccountSectionId } from "./sections";

function ACTIVE_SECTION(pathname: string): AccountSectionId {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "profile";
  return (ACCOUNT_SECTIONS.find((s) => s.id === last)?.id ?? "profile") as AccountSectionId;
}

export function AccountSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const active = ACTIVE_SECTION(pathname);

  const groups: { name: string; items: typeof ACCOUNT_SECTIONS }[] = [];
  let lastGroup: string | null = null;
  for (const s of ACCOUNT_SECTIONS) {
    if (s.group !== lastGroup) {
      groups.push({ name: s.group, items: [] });
      lastGroup = s.group;
    }
    (groups[groups.length - 1]!.items as unknown as (typeof ACCOUNT_SECTIONS)[number][]).push(s);
  }

  return (
    <nav className="bg-muted/22 flex h-full flex-col gap-px border-r px-2.5 py-3.5">
      {groups.map((g) => (
        <div key={g.name}>
          <div className="text-muted-foreground px-2.5 pt-3 pb-1.5 text-tiny font-semibold tracking-[0.08em] uppercase first:pt-1">
            {g.name}
          </div>
          {g.items.map((s) => (
            <Link
              key={s.id}
              href={ROUTE(ACCOUNT_SECTION_PATH(s.id), { locale })}
              data-active={s.id === active ? "true" : "false"}
              className={cn(
                "text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2.5 rounded-md border border-transparent px-2.5 py-[7px] text-left text-sm/normal font-medium no-underline",
                "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:border-border data-[active=true]:shadow-sm",
                s.danger && "text-destructive",
              )}
            >
              <span className="inline-flex size-[18px] items-center justify-center text-current">
                <s.Icon size={15} />
              </span>
              <span>{s.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function AccountMobileNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const active = ACTIVE_SECTION(pathname);
  return (
    <div className="flex gap-1 overflow-x-auto border-b px-3 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
      {ACCOUNT_SECTIONS.map((s) => (
        <Link
          key={s.id}
          href={ROUTE(ACCOUNT_SECTION_PATH(s.id), { locale })}
          data-active={s.id === active ? "true" : "false"}
          className={cn(
            "text-muted-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap no-underline",
            "data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:border-foreground",
            s.danger && "text-destructive",
          )}
        >
          <s.Icon size={13} /> {s.label}
        </Link>
      ))}
    </div>
  );
}
