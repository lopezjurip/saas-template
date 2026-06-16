"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui-common/shadcn/components/ui/dropdown-menu";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  Check,
  ChevronsUpDown,
  House,
  Inbox,
  type LucideIcon,
  Network,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EntityAvatar } from "~/components/entity-avatar";
import { LocaleToggle } from "~/components/locale-toggle";
import { ConversationsBell } from "~/components/shell/conversations-bell";
import { ThemeToggle } from "~/components/theme-toggle";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";

/** One agency in the switcher list. Shape mirrors `getViewerAgencies` edges (external data). */
export type NavAgency = {
  agency_id: number;
  agency_slug: string;
  agency_name: string;
};

type AgencyTab = { key: string; href: Route; label: string; icon: LucideIcon; exact: boolean };

/**
 * Shared chrome for the agency shell: the logo-as-switcher (current agency opens a
 * menu of the caller's other agencies plus a Home entry), the big route-based tab
 * links with pathname-derived active state, and the locale/theme controls in-nav.
 *
 * Rendered once by `a/[agency_slug]/layout.tsx`; every tab is a real route segment.
 *
 * @example <AgencyNav agency={agency} agencies={agencies} />
 */
export function AgencyNav({ agency, agencies }: { agency: NavAgency; agencies: NavAgency[] }) {
  const { t } = useRosetta(LOCALES);
  const pathname = usePathname();
  const agency_slug = agency.agency_slug;

  // Tabs are built inline so labels read straight from this scope's translator —
  // no translator passed across a function boundary. `exact` index tab matches only
  // `/a/{slug}`; the rest match by prefix so `/a/{slug}/tickets/{id}` keeps Tickets lit.
  const tabs: AgencyTab[] = [
    {
      key: "overview",
      href: ROUTE("/a/[agency_slug]", { agency_slug }),
      label: t("tab_overview"),
      icon: ShieldCheck,
      exact: true,
    },
    {
      key: "team",
      href: ROUTE("/a/[agency_slug]/team", { agency_slug }),
      label: t("tab_team"),
      icon: Users,
      exact: false,
    },
    {
      key: "access",
      href: ROUTE("/a/[agency_slug]/access", { agency_slug }),
      label: t("tab_access"),
      icon: Network,
      exact: false,
    },
    {
      key: "tickets",
      href: ROUTE("/a/[agency_slug]/tickets", { agency_slug }),
      label: t("tab_tickets"),
      icon: Ticket,
      exact: false,
    },
    {
      key: "inbox",
      href: ROUTE("/a/[agency_slug]/inbox", { agency_slug }),
      label: t("tab_inbox"),
      icon: Inbox,
      exact: false,
    },
    {
      key: "settings",
      href: ROUTE("/a/[agency_slug]/settings", { agency_slug }),
      label: t("tab_settings"),
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <header className="border-border bg-background sticky top-0 z-30 flex shrink-0 flex-col gap-0 border-b">
      <div className="flex items-center justify-between gap-3 px-4 py-3 @3xl:px-6">
        <AgencySwitcher agency={agency} agencies={agencies} />
        <div className="flex shrink-0 items-center gap-2">
          <ConversationsBell
            scope={{ kind: "agency", agency_slug: agency.agency_slug, agency_id: agency.agency_id }}
            compact={true}
            placement="down"
          />
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>

      <nav
        aria-label={t("nav_aria")}
        className="no-scrollbar -mb-px flex items-stretch gap-1 overflow-x-auto px-3 @3xl:px-5"
      >
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-none items-center gap-2 border-b-2 px-3 py-3 text-base font-medium transition-colors @3xl:px-4",
                active
                  ? "border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <Icon size={18} strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

/**
 * Logo-as-dropdown agency selector built on the shadcn `DropdownMenu`. Shows the
 * current agency (logo + name); the menu lists the caller's other agencies
 * (switch to `/a/{slug}`) and a Home entry → `/home`. Owns its own translator —
 * never receives `t`/rosetta as a prop.
 */
function AgencySwitcher({ agency, agencies }: { agency: NavAgency; agencies: NavAgency[] }) {
  const { t } = useRosetta(LOCALES);
  const others = agencies.filter((a) => a.agency_id !== agency.agency_id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("switcher_aria")}
          className="hover:bg-accent/70 data-[state=open]:bg-accent data-[state=open]:border-border flex min-w-0 items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors"
        >
          <EntityAvatar
            entity="agencies"
            entityId={agency.agency_id}
            name={agency.agency_name}
            className="size-9 rounded-lg text-xs"
          />
          <span className="flex min-w-0 flex-col gap-px">
            <span className="text-foreground truncate text-sm font-semibold tracking-[-0.01em]">
              {agency.agency_name}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <span>{t("eyebrow")}</span>
              <span className="opacity-40">·</span>
              <code className="font-mono text-tiny">{agency.agency_slug}</code>
            </span>
          </span>
          <ChevronsUpDown size={15} className="text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        {others.length > 0 ? (
          <>
            <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {t("switcher_heading")}
            </DropdownMenuLabel>
            {others.map((other) => (
              <DropdownMenuItem key={other.agency_id} asChild>
                <Link href={ROUTE("/a/[agency_slug]", { agency_slug: other.agency_slug })}>
                  <EntityAvatar
                    entity="agencies"
                    entityId={other.agency_id}
                    name={other.agency_name}
                    className="size-6 rounded-md text-tiny"
                  />
                  <span className="min-w-0 flex-1 truncate">{other.agency_name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem disabled className="opacity-100">
          <EntityAvatar
            entity="agencies"
            entityId={agency.agency_id}
            name={agency.agency_name}
            className="size-6 rounded-md text-tiny"
          />
          <span className="min-w-0 flex-1 truncate font-medium">{agency.agency_name}</span>
          <Check size={15} className="text-foreground shrink-0" />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTE("/home")} className="text-muted-foreground">
            <House size={15} className="shrink-0" />
            <span>{t("home")}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const LOCALE_ES = {
  eyebrow: "Consola de agencia",
  nav_aria: "Secciones de la agencia",
  tab_overview: "Resumen",
  tab_team: "Equipo",
  tab_access: "Accesos",
  tab_tickets: "Tickets",
  tab_inbox: "Bandeja",
  tab_settings: "Ajustes",
  switcher_aria: "Cambiar de agencia",
  switcher_heading: "Tus otras agencias",
  home: "Inicio",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Agency console",
  nav_aria: "Agency sections",
  tab_overview: "Overview",
  tab_team: "Team",
  tab_access: "Access",
  tab_tickets: "Tickets",
  tab_inbox: "Inbox",
  tab_settings: "Settings",
  switcher_aria: "Switch agency",
  switcher_heading: "Your other agencies",
  home: "Home",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Console da agência",
  nav_aria: "Seções da agência",
  tab_overview: "Resumo",
  tab_team: "Equipe",
  tab_access: "Acessos",
  tab_tickets: "Tickets",
  tab_inbox: "Caixa de entrada",
  tab_settings: "Configurações",
  switcher_aria: "Trocar de agência",
  switcher_heading: "Suas outras agências",
  home: "Início",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
