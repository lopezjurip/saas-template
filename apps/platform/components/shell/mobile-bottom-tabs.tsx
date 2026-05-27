"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Home, MoreHorizontal, Settings, Users } from "lucide-react";
import { BUILD_NAV, PICK_ACTIVE_NAV } from "~/components/shell/sidebar";
import { useRosetta } from "~/hooks/use-rosetta";

const LOCALE_ES = {
  home: "Inicio",
  members: "Miembros",
  settings: "Ajustes",
  more: "Más",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    home: "Home",
    members: "Members",
    settings: "Settings",
    more: "More",
  } satisfies typeof LOCALE_ES,
  pt: {
    home: "Início",
    members: "Membros",
    settings: "Ajustes",
    more: "Mais",
  } satisfies typeof LOCALE_ES,
};

export function MobileBottomTabs({
  base,
  activePath,
  onNavigate,
  onMore,
}: {
  base: string;
  activePath: string;
  onNavigate: (href: string) => void;
  onMore: () => void;
}) {
  const { t } = useRosetta(LOCALES);
  const navItems = BUILD_NAV(base, { navHome: t("home"), navMembers: t("members"), navSettings: t("settings") });
  const activeId = PICK_ACTIVE_NAV(navItems, activePath, base);

  const tabs = [
    {
      id: "home",
      label: t("home"),
      Icon: Home,
      active: activeId === "home",
      onClick: () => onNavigate(base),
    },
    {
      id: "members",
      label: t("members"),
      Icon: Users,
      active: activeId === "members",
      onClick: () => onNavigate(`${base}/settings/members`),
    },
    {
      id: "settings",
      label: t("settings"),
      Icon: Settings,
      active: activeId === "settings",
      onClick: () => onNavigate(`${base}/settings`),
    },
    { id: "more", label: t("more"), Icon: MoreHorizontal, active: false, onClick: onMore },
  ];

  return (
    <div className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/85 relative shrink-0 border-t backdrop-blur md:hidden">
      <div className="flex h-14 items-stretch px-1 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={tab.onClick}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
              tab.active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <tab.Icon size={20} strokeWidth={tab.active ? 2.2 : 1.75} />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            {tab.active ? <span className="bg-foreground absolute top-1 h-0.5 w-6 rounded-full" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
