"use client";

import { useDeviceInfo } from "@packages/react-hooks/use-device-info";
import { useStateCookie } from "@packages/react-hooks/use-state-cookie";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Home, type LucideIcon, Search, Settings, Users } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useRef, useState } from "react";
import { Kbd, Tip } from "~/components/shell/atoms";
import { OrgSwitcher, type ShellOrganization, type ShellTenant } from "~/components/shell/org-switcher";
import { ProfileMenu, type ShellViewer } from "~/components/shell/profile-menu";
import { SettingsMenu } from "~/components/shell/settings-menu";
import { useRosetta } from "~/hooks/use-rosetta";
import { type AppRoute, ROUTE, ROUTE_HREF } from "~/lib/route";

const SIDEBAR_COMPACT_THRESHOLD = 140;
const SIDEBAR_COMPACT_WIDTH = 60;
const SIDEBAR_MIN_WIDTH = 50;
const SIDEBAR_MAX_WIDTH = 480;
const SIDEBAR_DEFAULT_WIDTH = 260;
const SIDEBAR_WIDTH_COOKIE = "humane_sidebar_w";
const SIDEBAR_WIDTH_COOKIE_MAX_AGE_MS = 60 * 60 * 24 * 365 * 1000;

export type ShellNavItem = {
  id: string;
  label: string;
  href: AppRoute;
  path: string;
  Icon: LucideIcon;
  badge?: number;
};

export type ShellNavLabels = {
  navHome: string;
  navMembers: string;
  navSettings: string;
};

export function BUILD_NAV(
  locale: string,
  tenant_slug: string,
  organization_id: number,
  labels: ShellNavLabels,
): ShellNavItem[] {
  const home = ROUTE("/[locale]/t/[tenant_slug]/[organization_id]", { locale, tenant_slug, organization_id });
  const members = ROUTE("/[locale]/t/[tenant_slug]/[organization_id]/settings/members", {
    locale,
    tenant_slug,
    organization_id,
  });
  const settings = ROUTE("/[locale]/t/[tenant_slug]/[organization_id]/settings", {
    locale,
    tenant_slug,
    organization_id,
  });
  return [
    { id: "home", label: labels.navHome, href: home, path: ROUTE_HREF(home), Icon: Home },
    { id: "members", label: labels.navMembers, href: members, path: ROUTE_HREF(members), Icon: Users },
    { id: "settings", label: labels.navSettings, href: settings, path: ROUTE_HREF(settings), Icon: Settings },
  ];
}

export function PICK_ACTIVE_NAV(items: ShellNavItem[], path: string): string | null {
  let bestId: string | null = null;
  let bestLength = -1;
  for (const item of items) {
    if (item.id === "home") {
      if (path === item.path || path === `${item.path}/`) {
        if (item.path.length > bestLength) {
          bestId = item.id;
          bestLength = item.path.length;
        }
      }
      continue;
    }
    if (path === item.path || path.startsWith(`${item.path}/`)) {
      if (item.path.length > bestLength) {
        bestId = item.id;
        bestLength = item.path.length;
      }
    }
  }
  return bestId;
}

export function Sidebar({
  locale,
  tenant,
  organizations,
  current,
  viewer,
  activePath,
  onOpenPalette,
  initialWidth,
}: {
  locale: string;
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
  viewer: ShellViewer;
  activePath: string;
  onOpenPalette: () => void;
  initialWidth?: number;
}) {
  const { t } = useRosetta(LOCALES);
  const { modKey } = useDeviceInfo();
  /**
   * Width is read back server-side in layout.tsx with no re-set, so persist it for a year.
   */
  const [width, setWidth] = useStateCookie(SIDEBAR_WIDTH_COOKIE, initialWidth ?? SIDEBAR_DEFAULT_WIDTH, {
    maxAgeMs: SIDEBAR_WIDTH_COOKIE_MAX_AGE_MS,
  });
  const [resizing, setResizing] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);

  const collapsed = width < SIDEBAR_COMPACT_THRESHOLD;
  const visualWidth = collapsed ? SIDEBAR_COMPACT_WIDTH : width;

  const items = BUILD_NAV(locale, tenant["tenant_slug"], current["organization_id"], {
    navHome: t("navHome"),
    navMembers: t("navMembers"),
    navSettings: t("navSettings"),
  });
  const activeId = PICK_ACTIVE_NAV(items, activePath);

  function startResize(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    const left = asideRef.current?.getBoundingClientRect().left ?? 0;
    setResizing(true);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    /**
     * setWidth mirrors each update into the cookie, so no separate persist step on mouseup.
     */
    function onMove(move: globalThis.MouseEvent) {
      const next = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, move.clientX - left));
      setWidth(next);
    }
    function onUp() {
      setResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <aside
      ref={asideRef}
      style={{ width: visualWidth }}
      className="border-border bg-muted/30 relative hidden h-full shrink-0 flex-col border-r md:flex"
    >
      <div className={collapsed ? "flex justify-center pt-2" : "px-2 pt-2"}>
        <OrgSwitcher
          locale={locale}
          tenant={tenant}
          organizations={organizations}
          current={current}
          compact={collapsed}
        />
      </div>

      <div className={collapsed ? "flex justify-center pt-2" : "px-2 pt-2"}>
        {collapsed ? (
          <Tip label={`${t("search")} ${modKey}K`}>
            <button
              type="button"
              onClick={onOpenPalette}
              className="border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
            >
              <Search size={15} />
            </button>
          </Tip>
        ) : (
          /**
           * Expanded search bar with keyboard shortcut hint.
           */
          <button
            type="button"
            onClick={onOpenPalette}
            className="border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground flex h-9 w-full items-center gap-2 rounded-md border px-2.5 text-left text-sm transition-colors"
          >
            <Search size={14} />
            <span className="flex-1">{t("search")}</span>
            <Kbd>{modKey}K</Kbd>
          </button>
        )}
      </div>

      <nav className="mt-3 flex-1 overflow-y-auto px-2">
        <div className="mb-3">
          {collapsed ? null : (
            <div className="text-muted-foreground px-2 pb-1 pt-1 text-xs font-medium uppercase tracking-wider">
              {t("workspace")}
            </div>
          )}
          {items.map((item) => {
            const isActive = activeId === item.id;
            /**
             * Collapsed view renders icon-only nav item with tooltip.
             */
            if (collapsed) {
              return (
                <Tip key={item.id} label={item.badge ? `${item.label} (${item.badge})` : item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative mx-auto flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <item.Icon size={16} />
                    {item.badge ? (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
                    ) : null}
                  </Link>
                </Tip>
              );
            }
            /**
             * Expanded view renders full label nav item with optional badge.
             */
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <item.Icon size={15} className={isActive ? "text-foreground" : "text-muted-foreground"} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="bg-foreground/85 text-background rounded px-1.5 py-0.5 font-mono text-tiny font-medium">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={cn("border-border border-t", collapsed ? "flex flex-col items-center gap-1 py-2" : "px-2 py-2")}>
        <SettingsMenu
          locale={locale}
          settingsHref={ROUTE("/[locale]/t/[tenant_slug]/[organization_id]/settings", {
            locale,
            tenant_slug: tenant["tenant_slug"],
            organization_id: current["organization_id"],
          })}
          compact={collapsed}
        />
      </div>

      <div className={cn("border-border border-t", collapsed ? "flex justify-center py-2" : "px-2 py-2")}>
        <ProfileMenu locale={locale} viewer={viewer} compact={collapsed} />
      </div>

      <div
        onMouseDown={startResize}
        role="slider"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        aria-valuemin={SIDEBAR_MIN_WIDTH}
        aria-valuemax={SIDEBAR_MAX_WIDTH}
        aria-valuenow={visualWidth}
        tabIndex={-1}
        className={cn(
          "absolute right-0 top-0 z-30 h-full w-1.5 cursor-ew-resize transition-colors",
          resizing ? "bg-foreground/20" : "hover:bg-foreground/10 bg-transparent",
        )}
      />
    </aside>
  );
}

export { SIDEBAR_DEFAULT_WIDTH, SIDEBAR_WIDTH_COOKIE };

/**
 * Spanish locale strings for Sidebar navigation.
 */
const LOCALE_ES = {
  workspace: "Espacio de trabajo",
  navHome: "Inicio",
  navMembers: "Miembros",
  navSettings: "Configuración",
  search: "Buscar…",
};

/**
 * English locale strings for Sidebar navigation.
 */
const LOCALE_EN: typeof LOCALE_ES = {
  workspace: "Workspace",
  navHome: "Home",
  navMembers: "Members",
  navSettings: "Settings",
  search: "Search…",
};

/**
 * Portuguese locale strings for Sidebar navigation.
 */
const LOCALE_PT: typeof LOCALE_ES = {
  workspace: "Espaço de trabalho",
  navHome: "Início",
  navMembers: "Membros",
  navSettings: "Configurações",
  search: "Buscar…",
};

/**
 * Locale map for Sidebar translations.
 */
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
