"use client";

import { useMounted } from "@packages/react-hooks/use-mounted";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  Home,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Search,
  Settings as SettingsIcon,
  Shield,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useTransition } from "react";
import { InitialsAvatar } from "~/components/shell/atoms";
import { Sheet } from "~/components/shell/mobile-sheet";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { LOCALE_LABEL, SUPPORTED_LOCALES } from "~/lib/i18n";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

export function MobileOrgSheet({
  open,
  onClose,
  locale,
  tenant,
  organizations,
  current,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
}) {
  const { t } = useRosetta(LOCALES);
  return (
    <Sheet open={open} onClose={onClose} title={t("organizations")}>
      <div className="px-2 pb-2">
        {organizations.map((organization) => (
          <Link
            key={organization["organizationId"]}
            href={ROUTE("/t/[tenant_slug]/[organization_id]", {
              locale,
              tenant_slug: tenant["tenantSlug"],
              organization_id: organization["organizationId"],
            })}
            onClick={onClose}
            className="active:bg-accent flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left"
          >
            <InitialsAvatar
              initials={INITIALS_OF(organization["organizationName"])}
              style={COLOR_HSL_FROM_STRING(organization["organizationName"])}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{organization["organizationName"]}</div>
              {organization["organizationSlug"] ? (
                <div className="text-muted-foreground truncate text-xs">{organization["organizationSlug"]}</div>
              ) : null}
            </div>
            {organization["organizationId"] === current["organizationId"] ? <Check size={16} /> : null}
          </Link>
        ))}
      </div>
      <div className="border-border border-t px-2 py-2">
        <Link
          href={ROUTE("/home", { locale })}
          onClick={onClose}
          className="active:bg-accent flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm"
        >
          <Plus size={16} className="text-muted-foreground" />
          <span>{t("switchTenant")}</span>
        </Link>
        <Link
          href={ROUTE("/t/[tenant_slug]/[organization_id]/settings", {
            locale,
            tenant_slug: tenant["tenantSlug"],
            organization_id: current["organizationId"],
          })}
          onClick={onClose}
          className="active:bg-accent flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm"
        >
          <SettingsIcon size={16} className="text-muted-foreground" />
          <span>{t("orgSettings")}</span>
        </Link>
      </div>
    </Sheet>
  );
}

export function MobileProfileSheet({
  open,
  onClose,
  locale,
  viewer,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
  viewer: ShellViewer;
}) {
  const { t } = useRosetta(LOCALES);
  const items = [
    { Icon: User, label: t("account"), href: ROUTE("/home/account/profile", { locale }) },
    { Icon: CreditCard, label: t("billing"), href: ROUTE("/home/account/profile", { locale }) },
    { Icon: KeyRound, label: t("tokens"), href: ROUTE("/home/account/security", { locale }) },
    { Icon: Bell, label: t("notifications"), href: ROUTE("/home/account/notifications", { locale }) },
  ];

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="border-border flex items-center gap-3 border-b px-4 pb-3">
        <InitialsAvatar
          initials={INITIALS_OF(viewer["profileNameFull"] || viewer["email"])}
          color="bg-fuchsia-600 text-white"
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{viewer["profileNameFull"] || viewer["email"]}</div>
          <div className="text-muted-foreground truncate text-xs">{viewer["email"]}</div>
        </div>
      </div>
      <div className="px-2 py-1.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="active:bg-accent flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm"
          >
            <item.Icon size={16} className="text-muted-foreground" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </Link>
        ))}
      </div>
      <div className="border-border border-t px-2 py-2">
        <Link
          href={ROUTE("/auth/logout", { locale })}
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm text-rose-600 active:bg-rose-50 dark:active:bg-rose-950/30"
        >
          <LogOut size={16} />
          <span>{t("signOut")}</span>
        </Link>
      </div>
    </Sheet>
  );
}

export function MobileSettingsSheet({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: string }) {
  const { t } = useRosetta(LOCALES);
  const { theme, setTheme } = useTheme();
  const [pending, startTransition] = useTransition();
  const mounted = useMounted();
  const [_, setLocale] = useLocaleCookie();

  const themes = [
    { value: "light", label: t("themeLight"), Icon: Sun },
    { value: "dark", label: t("themeDark"), Icon: Moon },
    { value: "system", label: t("themeSystem"), Icon: Monitor },
  ];

  return (
    <Sheet open={open} onClose={onClose} title={t("settingsTitle")}>
      <div className="px-4 pb-2" aria-busy={pending}>
        <div className="text-muted-foreground pb-1.5 pt-2 text-tiny font-medium uppercase tracking-wider">
          {t("appearance")}
        </div>
        <div className="border-border bg-background grid grid-cols-3 gap-1.5 rounded-md border p-1">
          {themes.map((opt) => {
            const isActive = mounted && theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-1 rounded px-2 py-2 text-xs transition-colors ${
                  isActive ? "bg-accent text-foreground" : "text-muted-foreground active:bg-accent/60"
                }`}
              >
                <opt.Icon size={15} />
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="text-muted-foreground pb-1.5 pt-4 text-tiny font-medium uppercase tracking-wider">
          {t("language")}
        </div>
        <div className="border-border bg-background overflow-hidden rounded-md border">
          {SUPPORTED_LOCALES.map((value, i) => {
            const isActive = value === locale;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setLocale(value)}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
                  i > 0 ? "border-border border-t" : ""
                } ${isActive ? "bg-accent/50" : "active:bg-accent"}`}
              >
                <Globe size={14} className="text-muted-foreground" />
                <span className="flex-1">{LOCALE_LABEL[value]}</span>
                {isActive ? <Check size={14} /> : null}
              </button>
            );
          })}
        </div>

        <div className="text-muted-foreground pb-1.5 pt-4 text-tiny font-medium uppercase tracking-wider">
          {t("more")}
        </div>
        <div className="border-border bg-background overflow-hidden rounded-md border">
          <button
            type="button"
            className="active:bg-accent flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm"
          >
            <Bell size={14} className="text-muted-foreground" />
            <span className="flex-1">{t("notif")}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
          <button
            type="button"
            className="border-border active:bg-accent flex w-full items-center gap-2 border-t px-3 py-2.5 text-left text-sm"
          >
            <Shield size={14} className="text-muted-foreground" />
            <span className="flex-1">{t("privacy")}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
          <button
            type="button"
            className="border-border active:bg-accent flex w-full items-center gap-2 border-t px-3 py-2.5 text-left text-sm"
          >
            <HelpCircle size={14} className="text-muted-foreground" />
            <span className="flex-1">{t("help")}</span>
            <ArrowLeft size={13} className="text-muted-foreground -rotate-45" />
          </button>
        </div>
      </div>
    </Sheet>
  );
}

type SearchItem = {
  id: string;
  label: string;
  href?: Route;
  onTap?: () => void;
  hint?: string;
  Icon?: React.ComponentType<{ size?: number; className?: string }>;
  orgInitials?: string;
  orgColor?: Record<string, string>;
};

type SearchGroup = {
  heading: string;
  items: SearchItem[];
};

export function MobileSearchSheet({
  open,
  onClose,
  locale,
  tenant,
  organizations,
  current,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
}) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    const timeout = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timeout);
  }, [open]);

  const groups: SearchGroup[] = [
    {
      heading: t("navigate"),
      items: [
        {
          id: "go-home",
          label: t("navHome"),
          Icon: Home,
          href: ROUTE("/t/[tenant_slug]/[organization_id]", {
            locale,
            tenant_slug: tenant["tenantSlug"],
            organization_id: current["organizationId"],
          }),
        },
        {
          id: "go-members",
          label: t("navMembers"),
          Icon: Users,
          href: ROUTE("/t/[tenant_slug]/[organization_id]/settings/members", {
            locale,
            tenant_slug: tenant["tenantSlug"],
            organization_id: current["organizationId"],
          }),
        },
        {
          id: "go-settings",
          label: t("navSettings"),
          Icon: SettingsIcon,
          href: ROUTE("/t/[tenant_slug]/[organization_id]/settings", {
            locale,
            tenant_slug: tenant["tenantSlug"],
            organization_id: current["organizationId"],
          }),
        },
      ],
    },
    {
      heading: t("switchOrg"),
      items: organizations.map((organization) => ({
        id: `org-${organization["organizationId"]}`,
        label: organization["organizationName"],
        hint:
          organization["organizationId"] === current["organizationId"] ? t("current") : (tenant["tenantTier"] ?? ""),
        orgInitials: INITIALS_OF(organization["organizationName"]),
        orgColor: COLOR_HSL_FROM_STRING(organization["organizationName"]),
        href: ROUTE("/t/[tenant_slug]/[organization_id]", {
          locale,
          tenant_slug: tenant["tenantSlug"],
          organization_id: organization["organizationId"],
        }),
      })),
    },
  ];

  const query = q.trim().toLowerCase();
  const filtered: SearchGroup[] = !query
    ? groups
    : groups.flatMap((group) => {
        const items = group.items.filter((item) => `${item.label} ${item.hint ?? ""}`.toLowerCase().includes(query));
        return items.length ? [{ ...group, items }] : [];
      });

  function goTo(item: SearchItem) {
    onClose();
    if (item.onTap) item.onTap();
    else if (item.href) router.push(ROUTE_HREF(item.href));
  }

  return (
    <Sheet open={open} onClose={onClose} fullScreen>
      <div className="border-border flex items-center gap-2 border-b px-3 pb-2">
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground active:bg-accent flex h-8 w-8 items-center justify-center rounded-md"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-md border px-2.5">
          <Search size={14} className="text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="text-foreground placeholder:text-muted-foreground h-9 flex-1 bg-transparent text-sm outline-none"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} className="text-muted-foreground">
              <X size={13} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-1.5 py-1.5">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground px-3 py-10 text-center text-sm">
            {t("empty")} <span className="text-foreground font-medium">"{q}"</span>
          </div>
        ) : null}
        {filtered.map((group) => (
          <div key={group.heading} className="mb-2">
            <div className="text-muted-foreground px-2 pb-1 pt-2 text-tiny font-medium uppercase tracking-wider">
              {group.heading}
            </div>
            {group.items.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(item)}
                  className="active:bg-accent flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm"
                >
                  {item.orgInitials && item.orgColor ? (
                    <InitialsAvatar initials={item.orgInitials} style={item.orgColor} size="sm" className="h-6 w-6" />
                  ) : Icon ? (
                    <Icon size={16} className="text-muted-foreground" />
                  ) : (
                    <Search size={16} className="text-muted-foreground" />
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint ? <span className="text-muted-foreground text-xs">{item.hint}</span> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Sheet>
  );
}

/**
 * Spanish locale strings for mobile sheet components.
 */
const LOCALE_ES = {
  organizations: "Organizaciones",
  switchTenant: "Cambiar de empresa",
  orgSettings: "Configuración de la organización",
  account: "Cuenta",
  billing: "Facturación",
  tokens: "Tokens de API",
  notifications: "Notificaciones",
  signOut: "Cerrar sesión",
  settingsTitle: "Configuración",
  appearance: "Apariencia",
  themeLight: "Claro",
  themeDark: "Oscuro",
  themeSystem: "Sistema",
  language: "Idioma",
  more: "Más",
  notif: "Notificaciones",
  privacy: "Privacidad y seguridad",
  help: "Ayuda y documentación",
  searchPlaceholder: "Buscar proyectos, personas, comandos…",
  empty: "Sin resultados para",
  navigate: "Navegar",
  switchOrg: "Cambiar de organización",
  current: "Actual",
  navHome: "Inicio",
  navMembers: "Miembros",
  navSettings: "Configuración",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    organizations: "Organizations",
    switchTenant: "Switch company",
    orgSettings: "Organization settings",
    account: "Account",
    billing: "Billing",
    tokens: "API tokens",
    notifications: "Notifications",
    signOut: "Sign out",
    settingsTitle: "Settings",
    appearance: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    language: "Language",
    more: "More",
    notif: "Notifications",
    privacy: "Privacy & security",
    help: "Help & docs",
    searchPlaceholder: "Search projects, people, commands…",
    empty: "No results for",
    navigate: "Navigate",
    switchOrg: "Switch organization",
    current: "Current",
    navHome: "Home",
    navMembers: "Members",
    navSettings: "Settings",
  } satisfies typeof LOCALE_ES,
  pt: {
    organizations: "Organizações",
    switchTenant: "Trocar de empresa",
    orgSettings: "Configurações da organização",
    account: "Conta",
    billing: "Faturamento",
    tokens: "Tokens de API",
    notifications: "Notificações",
    signOut: "Sair",
    settingsTitle: "Configurações",
    appearance: "Aparência",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeSystem: "Sistema",
    language: "Idioma",
    more: "Mais",
    notif: "Notificações",
    privacy: "Privacidade e segurança",
    help: "Ajuda e documentação",
    searchPlaceholder: "Buscar projetos, pessoas, comandos…",
    empty: "Sem resultados para",
    navigate: "Navegar",
    switchOrg: "Trocar organização",
    current: "Atual",
    navHome: "Início",
    navMembers: "Membros",
    navSettings: "Configurações",
  } satisfies typeof LOCALE_ES,
};
