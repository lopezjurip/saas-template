"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_SECTIONS, type AccountSectionId } from "./sections";

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
    <nav className="acc-sidebar">
      {groups.map((g) => (
        <div key={g.name}>
          <div className="acc-group-label">{g.name}</div>
          {g.items.map((s) => (
            <Link
              key={s.id}
              href={`/${locale}/home/account/${s.id}`}
              className={`acc-nav-item${s.danger ? " danger" : ""}`}
              data-active={s.id === active ? "true" : "false"}
            >
              <span className="acc-nav-icon">
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
    <div className="acc-mobile-nav">
      {ACCOUNT_SECTIONS.map((s) => (
        <Link
          key={s.id}
          href={`/${locale}/home/account/${s.id}`}
          className={`acc-mobile-tab${s.danger ? " danger" : ""}`}
          data-active={s.id === active ? "true" : "false"}
        >
          <s.Icon size={13} /> {s.label}
        </Link>
      ))}
    </div>
  );
}
