"use client";

import { useKeyboardShortcut } from "@packages/react-hooks/use-keyboard-shortcut";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Building2, Circle, Home, type LucideIcon, Search, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, COLOR_FROM_ID, INITIALS_FROM_NAME, Kbd } from "~/components/shell/atoms";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import { useRosetta } from "~/hooks/use-rosetta";

type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  Icon?: LucideIcon;
  orgInitials?: string;
  orgColor?: string;
  onSelect: () => void;
};

type PaletteGroup = {
  heading: string;
  items: PaletteItem[];
};

export function CommandPalette({
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
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIdx(0);
    const timeout = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timeout);
  }, [open]);

  const groups = useMemo<PaletteGroup[]>(() => {
    const base = `/${locale}/${tenant.tenant_slug}/${current.organization_id}`;
    const navigate: PaletteGroup = {
      heading: t("navigate"),
      items: [
        {
          id: "nav-home",
          label: t("goHome"),
          Icon: Home,
          onSelect: () => router.push(base),
        },
        {
          id: "nav-members",
          label: t("goMembers"),
          Icon: Users,
          onSelect: () => router.push(`${base}/settings/members`),
        },
        {
          id: "nav-settings",
          label: t("goSettings"),
          Icon: Settings,
          onSelect: () => router.push(`${base}/settings`),
        },
      ],
    };
    const switchOrg: PaletteGroup = {
      heading: t("switchOrg"),
      items: organizations.map((organization) => ({
        id: `org-${organization.organization_id}`,
        label: organization.organization_name,
        hint: organization.organization_id === current.organization_id ? t("current") : (tenant.tenant_tier ?? ""),
        orgInitials: INITIALS_FROM_NAME(organization.organization_name),
        orgColor: COLOR_FROM_ID(organization.organization_id),
        onSelect: () => router.push(`/${locale}/${tenant.tenant_slug}/${organization.organization_id}`),
      })),
    };
    return [navigate, switchOrg];
  }, [locale, tenant, organizations, current, router, t]);

  const filtered = useMemo<PaletteGroup[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    const out: PaletteGroup[] = [];
    for (const group of groups) {
      const items = group.items.filter((item) => `${item.label} ${item.hint ?? ""}`.toLowerCase().includes(q));
      if (items.length) out.push({ ...group, items });
    }
    return out;
  }, [groups, query]);

  const flat = useMemo(() => filtered.flatMap((group) => group.items), [filtered]);

  useEffect(() => {
    if (activeIdx >= flat.length) setActiveIdx(0);
  }, [flat.length, activeIdx]);

  useKeyboardShortcut("Escape", onClose, { enabled: open });

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIdx((value) => Math.min(flat.length - 1, value + 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIdx((value) => Math.max(0, value - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const item = flat[activeIdx];
        if (item) {
          item.onSelect();
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, activeIdx, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    if (el && el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!open) return null;

  let runningIdx = -1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-foreground/30 absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="border-border bg-card text-card-foreground shadow-foreground/10 absolute left-1/2 top-[20%] w-[640px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl"
      >
        <div className="border-border flex items-center gap-2 border-b px-3.5">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("placeholder")}
            className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
          />
          <Kbd className="hidden sm:flex">ESC</Kbd>
        </div>

        <div ref={listRef} className="max-h-[360px] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="text-muted-foreground px-3 py-8 text-center text-sm">
              {t("empty")} <span className="text-foreground font-medium">"{query}"</span>
            </div>
          ) : null}
          {filtered.map((group) => (
            <div key={group.heading} className="mb-1 last:mb-0">
              <div className="text-muted-foreground px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider">
                {group.heading}
              </div>
              {group.items.map((item) => {
                runningIdx += 1;
                const idx = runningIdx;
                const isActive = idx === activeIdx;
                const Icon = item.Icon ?? Circle;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-idx={idx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => {
                      item.onSelect();
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/60",
                    )}
                  >
                    {item.orgInitials && item.orgColor ? (
                      <Avatar initials={item.orgInitials} color={item.orgColor} size="sm" className="h-5 w-5" />
                    ) : (
                      <Icon size={15} className="text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hint ? <span className="text-muted-foreground text-xs">{item.hint}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-border bg-muted/30 text-muted-foreground flex items-center justify-between gap-3 border-t px-3 py-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Building2 size={11} />
            <span className="text-foreground/80 font-medium">{current.organization_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              {t("footerNav")}
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              {t("footerSelect")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  placeholder: "Escribe un comando o búsqueda…",
  empty: "Sin resultados para",
  navigate: "Navegar",
  switchOrg: "Cambiar de organización",
  current: "Actual",
  footerNav: "navegar",
  footerSelect: "seleccionar",
  goHome: "Ir a Inicio",
  goMembers: "Ir a Miembros",
  goSettings: "Ir a Configuración",
};

const LOCALE_EN: typeof LOCALE_ES = {
  placeholder: "Type a command or search…",
  empty: "No results for",
  navigate: "Navigate",
  switchOrg: "Switch organization",
  current: "Current",
  footerNav: "navigate",
  footerSelect: "select",
  goHome: "Go to Home",
  goMembers: "Go to Members",
  goSettings: "Go to Settings",
};

const LOCALE_PT: typeof LOCALE_ES = {
  placeholder: "Digite um comando ou busca…",
  empty: "Sem resultados para",
  navigate: "Navegar",
  switchOrg: "Trocar organização",
  current: "Atual",
  footerNav: "navegar",
  footerSelect: "selecionar",
  goHome: "Ir para Início",
  goMembers: "Ir para Membros",
  goSettings: "Ir para Configurações",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
