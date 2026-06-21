"use client";

import { useKeyboardShortcut } from "@packages/react-hooks/use-keyboard-shortcut";
import { SidebarInset, SidebarProvider } from "@packages/ui-common/shadcn/components/ui/sidebar";
import { TooltipProvider } from "@packages/ui-common/shadcn/components/ui/tooltip";
import { useIsMobile } from "@packages/ui-common/shadcn/hooks/use-mobile";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { AppSidebar } from "~/components/shell/app-sidebar";
import { CommandPalette } from "~/components/shell/command-palette";
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

type MobileSheet = null | "search" | "org" | "profile" | "settings";

export function Shell({
  tenant,
  organizations,
  current,
  viewer,
  defaultOpen,
  children,
}: {
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
  viewer: ShellViewer;
  /** Initial expanded/collapsed state, read from the `sidebar_state` cookie in the layout. */
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);

  useKeyboardShortcut("k", () => setPaletteOpen((value) => !value), { mod: true });

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={defaultOpen} className="h-svh overflow-hidden">
        {/* Desktop only. Rendering conditionally on !isMobile keeps the primitive's mobile <Sheet>
          (portaled to body when isMobile) from ever mounting — we use the custom drawer instead. */}
        {isMobile ? null : (
          <AppSidebar
            tenant={tenant}
            organizations={organizations}
            current={current}
            viewer={viewer}
            activePath={pathname}
            onOpenPalette={() => setPaletteOpen(true)}
          />
        )}

        <SidebarInset className="min-w-0 overflow-hidden pl-safe pr-safe">
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
        </SidebarInset>

        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          tenant={tenant}
          organizations={organizations}
          current={current}
        />

        <MobileNavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
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
          tenant={tenant}
          organizations={organizations}
          current={current}
        />
        <MobileOrgSheet
          open={mobileSheet === "org"}
          onClose={() => setMobileSheet(null)}
          tenant={tenant}
          organizations={organizations}
          current={current}
        />
        <MobileProfileSheet open={mobileSheet === "profile"} onClose={() => setMobileSheet(null)} viewer={viewer} />
        <MobileSettingsSheet open={mobileSheet === "settings"} onClose={() => setMobileSheet(null)} />
      </SidebarProvider>
    </TooltipProvider>
  );
}
