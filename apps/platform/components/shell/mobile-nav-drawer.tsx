"use client";

import { ArrowUpRight, ChevronsUpDown, HelpCircle, Settings as SettingsIcon, X } from "lucide-react";
import Link from "next/link";
import { Avatar, COLOR_FROM_ID, INITIALS_FROM_NAME } from "~/components/shell/atoms";
import { Scrim } from "~/components/shell/mobile-sheet";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
import { BUILD_NAV, PICK_ACTIVE_NAV } from "~/components/shell/sidebar";
import { useRosetta } from "~/hooks/use-rosetta";

export function MobileNavDrawer({
  open,
  onClose,
  locale,
  tenant,
  organization,
  viewer,
  activePath,
  onOrg,
  onSettings,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
  tenant: ShellTenant;
  organization: ShellOrganization;
  viewer: ShellViewer;
  activePath: string;
  onOrg: () => void;
  onSettings: () => void;
}) {
  const { t } = useRosetta(LOCALES);
  const items = BUILD_NAV(locale, tenant["tenant_slug"], organization["organization_id"], {
    navHome: t("navHome"),
    navMembers: t("navMembers"),
    navSettings: t("navSettings"),
  });
  const activeId = PICK_ACTIVE_NAV(items, activePath);

  return (
    <>
      <Scrim show={open} onClick={onClose} />
      <aside
        aria-hidden={!open}
        className="border-border bg-muted/30 absolute inset-y-0 left-0 z-70 flex w-[78%] flex-col border-r"
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
            <Avatar
              initials={INITIALS_FROM_NAME(organization.organization_name)}
              color={COLOR_FROM_ID(organization.organization_id)}
              size="lg"
            />
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-semibold">{organization.organization_name}</div>
              <div className="text-muted-foreground truncate text-xs">
                {tenant.tenant_tier ?? tenant.tenant_name} {t("plan")}
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
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                    isActive ? "bg-accent text-accent-foreground" : "text-foreground/85 active:bg-accent/60"
                  }`}
                >
                  <item.Icon size={17} className={isActive ? "text-foreground" : "text-muted-foreground"} />
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
            <Avatar
              initials={INITIALS_FROM_NAME(viewer.profile_name_full || viewer.email)}
              color="bg-fuchsia-600 text-white"
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm/normal font-medium leading-tight">
                {viewer.profile_name_full || viewer.email}
              </div>
              <div className="text-muted-foreground truncate text-xs leading-tight">{viewer.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

const LOCALE_ES = {
  plan: "plan",
  workspace: "Espacio de trabajo",
  settings: "Configuración",
  help: "Ayuda y documentación",
  navHome: "Inicio",
  navMembers: "Miembros",
  navSettings: "Configuración",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    plan: "plan",
    workspace: "Workspace",
    settings: "Settings",
    help: "Help & docs",
    navHome: "Home",
    navMembers: "Members",
    navSettings: "Settings",
  } satisfies typeof LOCALE_ES,
  pt: {
    plan: "plano",
    workspace: "Espaço de trabalho",
    settings: "Configurações",
    help: "Ajuda e documentação",
    navHome: "Início",
    navMembers: "Membros",
    navSettings: "Configurações",
  } satisfies typeof LOCALE_ES,
};
