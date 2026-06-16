"use client";

/*
 * FREE-RESIZE REFERENCE (intentionally not implemented).
 * This shell uses shadcn's built-in icon-collapse (expanded ↔ icon rail), persisted in the
 * `sidebar_state` cookie by SidebarProvider. The previous shell had a drag-to-resize sidebar with
 * a continuous width. To re-add that on top of this primitive:
 *   1. Wrap <Sidebar> width in a cookie-backed value: `useStateCookie("humane_sidebar_w", initial)`
 *      (see git history of the deleted components/shell/sidebar.tsx — SIDEBAR_MIN/MAX/DEFAULT_WIDTH).
 *   2. Render a `role="slider"` drag handle on the sidebar's right edge; on mousemove write the
 *      clamped `clientX` into the width cookie (mirrors live via useStateCookie).
 *   3. Drive the `--sidebar-width` CSS var on SidebarProvider from that cookie, and treat
 *      `width < threshold` as the collapsed state instead of (or in addition to) the icon toggle.
 * Kept out deliberately: icon-collapse covers the 90% case with far less surface area.
 */

import { useDeviceInfo } from "@packages/react-hooks/use-device-info";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@packages/ui-common/shadcn/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@packages/ui-common/shadcn/components/ui/sidebar";
import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Kbd } from "~/components/shell/atoms";
import { ConversationsBell } from "~/components/shell/conversations-bell";
import {
  BUILD_NAV_TREE,
  GROUP_CONTAINS_ACTIVE,
  IS_NAV_GROUP,
  LEAF_IS_ACTIVE,
  type NavGroup,
  type NavLeaf,
} from "~/components/shell/nav-tree";
import { OrgSwitcher, type ShellOrganization, type ShellTenant } from "~/components/shell/org-switcher";
import { ProfileMenu, type ShellViewer } from "~/components/shell/profile-menu";
import { SettingsMenu } from "~/components/shell/settings-menu";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";

/**
 * The tenant desktop sidebar, composed from the shadcn primitive (which stays virgin in
 * `@packages/ui-common`). Renders the unified nav tree, a search trigger that opens the command
 * palette, and the org/profile/settings/bell footer. Icon-collapsible; mobile is handled by the
 * shell's custom top bar + drawer (this component is rendered desktop-only).
 *
 * @example <AppSidebar locale={locale} tenant={tenant} ... activePath={pathname} onOpenPalette={open} />
 */
export function AppSidebar({
  locale,
  tenant,
  organizations,
  current,
  viewer,
  activePath,
  onOpenPalette,
}: {
  locale: string;
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
  viewer: ShellViewer;
  activePath: string;
  onOpenPalette: () => void;
}) {
  const { t } = useRosetta(LOCALES);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const device = useDeviceInfo();

  const items = BUILD_NAV_TREE(tenant["tenantSlug"], current["organizationId"], {
    navHome: t("navHome"),
    navSettings: t("navSettings"),
    navGeneral: t("navGeneral"),
    navMembers: t("navMembers"),
    navBilling: t("navBilling"),
    navExternalAccess: t("navExternalAccess"),
  });

  const settingsHref = ROUTE("/t/[tenant_slug]/[organization_id]/settings", {
    tenant_slug: tenant["tenantSlug"],
    organization_id: current["organizationId"],
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher
          locale={locale}
          tenant={tenant}
          organizations={organizations}
          current={current}
          compact={collapsed}
        />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenPalette}
              tooltip={t("search")}
              className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground border group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent"
            >
              <Search />
              <span>{t("search")}</span>
              <Kbd className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden">{device?.modKey ?? " "}K</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) =>
              IS_NAV_GROUP(item) ? (
                <NavGroupItem key={item.id} group={item} activePath={activePath} />
              ) : (
                <NavLeafItem key={item.id} leaf={item} activePath={activePath} />
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ConversationsBell
          scope={{
            kind: "organization",
            tenant_slug: tenant["tenantSlug"],
            organization_id: current["organizationId"],
          }}
          compact={collapsed}
          placement="up"
        />
        <SettingsMenu locale={locale} settingsHref={settingsHref} compact={collapsed} />
        <ProfileMenu locale={locale} viewer={viewer} compact={collapsed} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** Local — a flat nav leaf rendered as a sidebar menu button. Used only by AppSidebar. */
function NavLeafItem({ leaf, activePath }: { leaf: NavLeaf; activePath: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={LEAF_IS_ACTIVE(activePath, leaf)} tooltip={leaf.label}>
        <Link href={leaf.href}>
          <leaf.Icon />
          <span>{leaf.label}</span>
        </Link>
      </SidebarMenuButton>
      {leaf.badge ? <SidebarMenuBadge>{leaf.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  );
}

/** Local — a collapsible group with a SidebarMenuSub of leaves. Used only by AppSidebar. */
function NavGroupItem({ group, activePath }: { group: NavGroup; activePath: string }) {
  return (
    <Collapsible asChild defaultOpen={GROUP_CONTAINS_ACTIVE(activePath, group)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={group.label}>
            <group.Icon />
            <span>{group.label}</span>
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.children.map((leaf) => (
              <SidebarMenuSubItem key={leaf.id}>
                <SidebarMenuSubButton asChild isActive={LEAF_IS_ACTIVE(activePath, leaf)}>
                  <Link href={leaf.href}>
                    <leaf.Icon />
                    <span>{leaf.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

const LOCALE_ES = {
  navHome: "Inicio",
  navSettings: "Configuración",
  navGeneral: "General",
  navMembers: "Miembros",
  navBilling: "Facturación",
  navExternalAccess: "Acceso externo",
  search: "Buscar…",
};

const LOCALE_EN: typeof LOCALE_ES = {
  navHome: "Home",
  navSettings: "Settings",
  navGeneral: "General",
  navMembers: "Members",
  navBilling: "Billing",
  navExternalAccess: "External access",
  search: "Search…",
};

const LOCALE_PT: typeof LOCALE_ES = {
  navHome: "Início",
  navSettings: "Configurações",
  navGeneral: "General",
  navMembers: "Membros",
  navBilling: "Cobrança",
  navExternalAccess: "Acesso externo",
  search: "Buscar…",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
