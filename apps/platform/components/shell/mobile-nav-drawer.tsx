"use client";

import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowUpRight, ChevronsUpDown, HelpCircle, Settings as SettingsIcon, X } from "lucide-react";
import Link from "next/link";

import { InitialsAvatar } from "~/components/shell/atoms";
import { Scrim } from "~/components/shell/mobile-sheet";
import { BUILD_NAV_TREE, IS_NAV_GROUP, type NavLeaf, PICK_ACTIVE_LEAF_ID } from "~/components/shell/nav-tree";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
import { useRosetta } from "~/lib/i18n.client";

export function MobileNavDrawer({
  open,
  onClose,
  tenant,
  organization,
  viewer,
  activePath,
  onOrg,
  onSettings,
}: {
  open: boolean;
  onClose: () => void;
  tenant: ShellTenant;
  organization: ShellOrganization;
  viewer: ShellViewer;
  activePath: string;
  onOrg: () => void;
  onSettings: () => void;
}) {
  const { t } = useRosetta(LOCALES);
  const items = BUILD_NAV_TREE(tenant["tenantSlug"], organization["organizationId"], {
    navHome: t("navHome"),
    navOrganization: t("navOrganization"),
    navCompany: t("navCompany"),
    navGeneral: t("navGeneral"),
    navMembers: t("navMembers"),
    navExternalAccess: t("navExternalAccess"),
    navDomains: t("navDomains"),
  });
  const activeId = PICK_ACTIVE_LEAF_ID(items, activePath);

  return (
    <>
      <Scrim show={open} onClick={onClose} />
      <aside
        aria-hidden={!open}
        className="border-border bg-background absolute inset-y-0 left-0 z-70 flex w-[78%] flex-col border-r"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="border-border flex items-center gap-2 border-b px-3 pb-3 pt-12">
          <button
            type="button"
            onClick={onOrg}
            className="active:bg-accent -m-1 flex flex-1 items-center gap-2 rounded-md p-1"
          >
            <InitialsAvatar
              initials={INITIALS_OF(organization["organizationName"])}
              style={COLOR_HSL_FROM_STRING(organization["organizationName"])}
              size="lg"
            />
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-semibold">{organization["organizationName"]}</div>
              <div className="text-muted-foreground truncate text-xs">
                {tenant["tenantTier"] ?? tenant["tenantName"]} {t("plan")}
              </div>
            </div>
            <ChevronsUpDown size={14} className="text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground active:bg-accent flex h-8 w-8 items-center justify-center rounded-md"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <div className="mb-3">
            <div className="text-muted-foreground px-2 pb-1 pt-1 text-tiny font-medium uppercase tracking-wider">
              {t("workspace")}
            </div>
            {items.map((item) =>
              IS_NAV_GROUP(item) ? (
                <div key={item.id} className="mt-2">
                  <div className="text-muted-foreground flex items-center gap-2 px-2.5 pb-0.5 pt-1 text-tiny font-medium uppercase tracking-wider">
                    <item.Icon size={13} />
                    <span>{item.label}</span>
                  </div>
                  {item.children.map((leaf) => (
                    <DrawerNavLink key={leaf.id} leaf={leaf} active={activeId === leaf.id} onClose={onClose} />
                  ))}
                </div>
              ) : (
                <DrawerNavLink key={item.id} leaf={item} active={activeId === item.id} onClose={onClose} />
              ),
            )}
          </div>
        </nav>

        <div className="border-border border-t px-2 py-2">
          <button
            type="button"
            onClick={onSettings}
            className="text-foreground/85 active:bg-accent/60 flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm"
          >
            <SettingsIcon size={17} className="text-muted-foreground" />
            <span className="flex-1">{t("settings")}</span>
          </button>
          <button
            type="button"
            className="text-foreground/85 active:bg-accent/60 flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm"
          >
            <HelpCircle size={17} className="text-muted-foreground" />
            <span className="flex-1">{t("help")}</span>
            <ArrowUpRight size={13} className="text-muted-foreground" />
          </button>
          <div className="border-border mt-2 flex items-center gap-2 rounded-md border-t px-2 pt-3">
            <InitialsAvatar
              initials={INITIALS_OF(viewer["profileNameFull"] || viewer["email"])}
              color="bg-fuchsia-600 text-white"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm/normal font-medium leading-tight">
                {viewer["profileNameFull"] || viewer["email"]}
              </div>
              <div className="text-muted-foreground truncate text-xs leading-tight">{viewer["email"]}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/** Local — a single nav leaf row in the mobile drawer. Used only by MobileNavDrawer. */
function DrawerNavLink({ leaf, active, onClose }: { leaf: NavLeaf; active: boolean; onClose: () => void }) {
  return (
    <Link
      href={leaf.href}
      onClick={onClose}
      className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
        active ? "bg-accent text-accent-foreground" : "text-foreground/85 active:bg-accent/60"
      }`}
    >
      <leaf.Icon size={17} className={active ? "text-foreground" : "text-muted-foreground"} />
      <span className="flex-1">{leaf.label}</span>
      {leaf.badge ? (
        <span className="bg-foreground/85 text-background rounded px-1.5 py-0.5 font-mono text-tiny font-medium">
          {leaf.badge}
        </span>
      ) : null}
    </Link>
  );
}

const LOCALE_ES = {
  plan: "plan",
  workspace: "Espacio de trabajo",
  settings: "Configuración",
  help: "Ayuda y documentación",
  navHome: "Inicio",
  navSettings: "Configuración",
  navOrganization: "Organización",
  navCompany: "Empresa",
  navGeneral: "General",
  navMembers: "Miembros",
  navExternalAccess: "Acceso externo",
  navDomains: "Dominios",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    plan: "plan",
    workspace: "Workspace",
    settings: "Settings",
    help: "Help & docs",
    navHome: "Home",
    navSettings: "Settings",
    navOrganization: "Organization",
    navCompany: "Company",
    navGeneral: "General",
    navMembers: "Members",
    navExternalAccess: "External access",
    navDomains: "Domains",
  } satisfies typeof LOCALE_ES,
  pt: {
    plan: "plano",
    workspace: "Espaço de trabalho",
    settings: "Configurações",
    help: "Ajuda e documentação",
    navHome: "Início",
    navSettings: "Configurações",
    navOrganization: "Organização",
    navCompany: "Empresa",
    navGeneral: "General",
    navMembers: "Membros",
    navExternalAccess: "Acesso externo",
    navDomains: "Domínios",
  } satisfies typeof LOCALE_ES,
};
