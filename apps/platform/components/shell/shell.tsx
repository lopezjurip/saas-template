"use client";

import { useKeyboardShortcut } from "@packages/react-hooks/use-keyboard-shortcut";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { CommandPalette } from "~/components/shell/command-palette";
import { MobileBottomTabs } from "~/components/shell/mobile-bottom-tabs";
import { MobileNavDrawer } from "~/components/shell/mobile-nav-drawer";
import {
  MobileOrgSheet,
  MobileProfileSheet,
  MobileSearchSheet,
  MobileSettingsSheet,
} from "~/components/shell/mobile-sheets";
import { MobileTopBar } from "~/components/shell/mobile-top-bar";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
import { Sidebar } from "~/components/shell/sidebar";

type MobileSheet = null | "search" | "org" | "profile" | "settings";

export function Shell({
  locale,
  tenant,
  organizations,
  current,
  viewer,
  initialSidebarWidth,
  children,
}: {
  locale: string;
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
  viewer: ShellViewer;
  initialSidebarWidth?: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);

  useKeyboardShortcut("k", () => setPaletteOpen((value) => !value), { mod: true });

  const base = `/${locale}/${tenant.tenant_slug}/${current.organization_id}`;

  return (
    <div className="bg-background text-foreground relative flex h-svh w-screen overflow-hidden">
      <Sidebar
        locale={locale}
        tenant={tenant}
        organizations={organizations}
        current={current}
        viewer={viewer}
        activePath={pathname}
        onOpenPalette={() => setPaletteOpen(true)}
        initialWidth={initialSidebarWidth}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="md:hidden">
          <MobileTopBar
            tenant={tenant}
            organization={current}
            viewer={viewer}
            title=""
            onMenu={() => setDrawerOpen(true)}
            onSearch={() => setMobileSheet("search")}
            onOrg={() => setMobileSheet("org")}
            onProfile={() => setMobileSheet("profile")}
          />
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        <MobileBottomTabs
          base={base}
          activePath={pathname}
          onNavigate={(href) => router.push(href)}
          onMore={() => setDrawerOpen(true)}
        />
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        locale={locale}
        tenant={tenant}
        organizations={organizations}
        current={current}
      />

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        locale={locale}
        tenant={tenant}
        organization={current}
        viewer={viewer}
        activePath={pathname}
        onOrg={() => {
          setDrawerOpen(false);
          setMobileSheet("org");
        }}
        onSettings={() => {
          setDrawerOpen(false);
          setMobileSheet("settings");
        }}
      />

      <MobileSearchSheet
        open={mobileSheet === "search"}
        onClose={() => setMobileSheet(null)}
        locale={locale}
        tenant={tenant}
        organizations={organizations}
        current={current}
      />
      <MobileOrgSheet
        open={mobileSheet === "org"}
        onClose={() => setMobileSheet(null)}
        locale={locale}
        tenant={tenant}
        organizations={organizations}
        current={current}
      />
      <MobileProfileSheet
        open={mobileSheet === "profile"}
        onClose={() => setMobileSheet(null)}
        locale={locale}
        viewer={viewer}
      />
      <MobileSettingsSheet open={mobileSheet === "settings"} onClose={() => setMobileSheet(null)} locale={locale} />
    </div>
  );
}
