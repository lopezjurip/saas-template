"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui-common/shadcn/components/ui/tabs";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import {
  BadgeCheck,
  Ban,
  Building2,
  Eye,
  Globe,
  Hourglass,
  Inbox,
  type LucideIcon,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState, useTransition } from "react";
import { EntityAvatar } from "~/components/entity-avatar";
import { ConversationsBell } from "~/components/shell/conversations-bell";
import type { AffiliationState } from "~/lib/agencies";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionUpdateAffiliateMembership } from "./actions";

export type ConsoleAffiliate = {
  agency_membership_id: number;
  profile_id: string;
  state: AffiliationState;
  name: string;
  email: string | null;
  is_self: boolean;
};

export type ConsoleOrg = {
  organization_id: number;
  organization_name: string;
  organization_slug: string | null;
};

export type ConsoleData = {
  agency_id: number;
  agency_name: string;
  agency_slug: string;
  disabled: boolean;
  affiliates: ConsoleAffiliate[];
  is_global: boolean;
  orgs: ConsoleOrg[];
};

type ConsoleTab = "team" | "access" | "profile" | "tickets";

export function AgencyConsole({
  data,
  inviteHref,
  ticketsHref,
}: {
  data: ConsoleData;
  inviteHref: Route;
  ticketsHref: Route;
}) {
  const { t } = useRosetta(LOCALES);
  const [tab, setTab] = useState<ConsoleTab>("team");

  const active = data.affiliates.filter((a) => a.state === "accepted").length;
  const teamCount = data.affiliates.length;
  const accessCount = data.is_global ? null : data.orgs.length;
  const owner = data.affiliates.find((a) => a.is_self) ?? data.affiliates.find((a) => a.state === "accepted");

  const head = CONSOLE_HEAD(t)[tab];

  return (
    <div className="@container bg-background relative flex min-h-svh w-full flex-col overflow-hidden">
      <header className="border-border bg-background flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 @min-[768px]:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <EntityAvatar
            entity="agencies"
            entityId={data.agency_id}
            name={data.agency_name}
            className="size-9 rounded-lg text-xs"
          />
          <div className="flex min-w-0 flex-col gap-px">
            <span className="text-foreground truncate text-sm font-semibold tracking-[-0.01em]">
              {data.agency_name}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <span>{t("topbar_console")}</span>
              <span className="opacity-40">·</span>
              <code className="font-mono text-tiny">{data.agency_slug}</code>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="border-border text-muted-foreground bg-muted/50 hidden items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-tiny font-medium leading-none tracking-[0.02em] @min-[768px]:flex">
            <ShieldCheck size={11} /> {t("topbar_affiliate")}
          </span>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-8"
            aria-label={t("settings")}
          >
            <Link href={ROUTE("/a/[agency_slug]/settings", { agency_slug: data.agency_slug })}>
              <Settings size={16} />
            </Link>
          </Button>
          <ConversationsBell
            scope={{ kind: "agency", agency_slug: data.agency_slug, agency_id: data.agency_id }}
            compact={true}
            placement="down"
          />
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden min-w-0 flex-col items-end gap-px @min-[768px]:flex">
              <span className="text-foreground max-w-40 truncate text-xs font-medium leading-none">{owner?.name}</span>
              {owner?.email ? (
                <span className="text-muted-foreground mt-0.5 max-w-40 truncate text-xs leading-none">
                  {owner.email}
                </span>
              ) : null}
            </span>
            <span className="bg-muted text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {INITIALS_OF(owner?.name ?? "?")}
            </span>
          </div>
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as ConsoleTab)}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList
          variant="line"
          aria-label={t("tabs_aria")}
          className="border-border no-scrollbar h-auto w-full justify-start gap-1 overflow-x-auto border-b px-3 @min-[768px]:px-5"
        >
          <ConsoleTabTrigger value="team" icon={Users} label={t("tab_team")} count={teamCount} />
          <ConsoleTabTrigger value="access" icon={Globe} label={t("tab_access")} count={accessCount} />
          <ConsoleTabTrigger value="profile" icon={Settings} label={t("tab_profile")} count={null} />
          <ConsoleTabTrigger value="tickets" icon={Inbox} label={t("tab_tickets")} count={null} href={ticketsHref} />
        </TabsList>

        <main className="min-w-0 flex-1 overflow-auto px-4 py-5 pb-8 @min-[768px]:px-6 @min-[768px]:py-6 @min-[768px]:pb-10">
          <div className="mx-auto flex w-full max-w-205 flex-col gap-6">
            <ConsoleStatStrip data={data} active={active} t={t} />

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="text-foreground m-0 text-lg font-semibold tracking-tight">{head.title}</h1>
                <p className="text-muted-foreground m-0 max-w-[60ch] text-xs leading-normal text-pretty">{head.desc}</p>
              </div>
              {tab === "team" ? (
                <Button asChild size="sm" className="h-9 shrink-0">
                  <Link href={inviteHref}>
                    <UserPlus size={15} strokeWidth={2} />{" "}
                    <span className="hidden @min-[520px]:inline">{t("invite")}</span>
                  </Link>
                </Button>
              ) : null}
            </div>

            <TabsContent value="team" className="mt-0">
              <ConsoleTeamTab data={data} active={active} inviteHref={inviteHref} t={t} />
            </TabsContent>
            <TabsContent value="access" className="mt-0">
              <ConsoleAccessTab global={data.is_global} orgs={data.orgs} t={t} />
            </TabsContent>
            <TabsContent value="profile" className="mt-0">
              <ConsoleProfileTab data={data} t={t} />
            </TabsContent>
            <TabsContent value="tickets" className="mt-0">
              {/* Tickets live at a sub-route; this tab is a nav link in the header. */}
              <span className="text-muted-foreground text-sm">{t("tickets_redirect_hint")}</span>
            </TabsContent>
          </div>
        </main>
      </Tabs>
    </div>
  );
}

type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];

/**
 * Chrome component for console tabs.
 * When `href` is provided the tab renders as a navigation link instead of
 * switching the in-page tab state.
 */
function ConsoleTabTrigger({
  value,
  icon: Icon,
  label,
  count,
  href,
}: {
  value: ConsoleTab;
  icon: LucideIcon;
  label: string;
  count: number | null;
  href?: Route;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className="text-muted-foreground hover:text-foreground flex h-auto flex-none items-center gap-1.5 border-b-2 border-transparent px-2.5 py-2.5 text-sm/normal transition-colors"
      >
        <Icon size={15} />
        {label}
      </Link>
    );
  }
  return (
    <TabsTrigger
      value={value}
      className="group/trigger text-muted-foreground data-[state=active]:text-foreground h-auto flex-none gap-1.5 px-2.5 py-2.5 text-sm/normal"
    >
      <Icon size={15} />
      {label}
      {count != null ? (
        <span className="bg-muted text-muted-foreground group-data-[state=active]/trigger:bg-foreground group-data-[state=active]/trigger:text-background inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-tiny font-semibold leading-none tabular-nums">
          {count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

function ConsoleStatStrip({ data, active, t }: { data: ConsoleData; active: number; t: Translate }) {
  const pending = data.affiliates.filter((a) => a.state === "pending").length;
  const stats = [
    {
      label: t("stat_affiliates"),
      value: String(active),
      sub: pending > 0 ? t("stat_pending", { count: pending }) : t("stat_up_to_date"),
    },
    {
      label: t("stat_orgs"),
      value: data.is_global ? t("stat_all") : String(data.orgs.length),
      sub: data.is_global ? t("stat_global_scope") : t("stat_granted_you"),
    },
    { label: t("stat_access_level"), value: t("stat_read"), sub: t("stat_never_writes") },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="border-border bg-background flex flex-col gap-0.5 rounded-lg border px-3.5 py-3">
          <span className="text-muted-foreground truncate text-tiny font-semibold uppercase tracking-[0.04em]">
            {s.label}
          </span>
          <span className="text-foreground text-lg font-semibold leading-tight tracking-tight tabular-nums">
            {s.value}
          </span>
          <span className="text-muted-foreground truncate text-xs">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Team tab content.
 */
function ConsoleTeamTab({
  data,
  active,
  inviteHref,
  t,
}: {
  data: ConsoleData;
  active: number;
  inviteHref: Route;
  t: Translate;
}) {
  if (data.affiliates.length === 0) {
    return (
      <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
        <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
          <UserPlus size={22} />
        </span>
        <div className="flex max-w-[42ch] flex-col gap-1">
          <span className="text-foreground text-sm font-semibold">{t("team_empty_title")}</span>
          <span className="text-xs leading-normal text-pretty">{t("team_empty_desc")}</span>
        </div>
        <Button asChild size="sm" className="mt-1">
          <Link href={inviteHref}>
            <UserPlus size={14} strokeWidth={2} /> {t("invite")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center justify-between gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
          {t("team_group")}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {t("team_count", { active, total: data.affiliates.length })}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {data.affiliates.map((aff) => (
          <ConsoleAffiliateRow key={aff.agency_membership_id} agencyId={data.agency_id} aff={aff} t={t} />
        ))}
      </div>
      <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-xs leading-normal">
        <span className="text-muted-foreground/80 mt-px shrink-0">
          <ShieldCheck size={13} />
        </span>
        <span className="text-pretty">
          {t("team_note_prefix")} <strong className="text-foreground font-medium">{t("tab_access")}</strong>{" "}
          {t("team_note_suffix")}
        </span>
      </p>
    </section>
  );
}

function ConsoleAffiliateRow({ agencyId, aff, t }: { agencyId: number; aff: ConsoleAffiliate; t: Translate }) {
  const dim = aff.state === "revoked" || aff.state === "rejected";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(operation: "revoke" | "reactivate") {
    setError(null);
    startTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(
        actionUpdateAffiliateMembership({
          agency_id: agencyId,
          agency_membership_id: aff.agency_membership_id,
          operation,
        }),
      );
      if (err instanceof ErrorSafeActionServer) setError(err.serverError);
    });
  }

  // Revoke an active member; reactivate a revoked one. Pending/rejected/self have no action.
  let action: {
    operation: "revoke" | "reactivate";
    tone: "danger" | "neutral";
    label: string;
    icon: LucideIcon;
  } | null = null;
  if (!aff.is_self) {
    if (aff.state === "accepted")
      action = { operation: "revoke", tone: "danger", label: t("action_revoke"), icon: Ban };
    else if (aff.state === "revoked")
      action = { operation: "reactivate", tone: "neutral", label: t("action_reactivate"), icon: RefreshCw };
  }

  return (
    <div
      className={cn(
        "border-border grid w-full items-center gap-3 rounded-md border px-3.5 py-2.5",
        dim ? "bg-muted/30" : "bg-background",
      )}
      style={{ gridTemplateColumns: "34px 1fr auto auto" }}
    >
      <span
        className={cn(
          "bg-muted text-foreground inline-flex size-8.5 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-[-0.01em]",
          dim && "opacity-60",
        )}
      >
        {INITIALS_OF(aff.name)}
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium",
              dim ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {aff.name}
          </span>
          {aff.is_self ? (
            <span className="bg-foreground text-background shrink-0 rounded-full px-1.5 py-0.5 text-tiny font-semibold uppercase leading-none tracking-[0.04em]">
              {t("self")}
            </span>
          ) : null}
        </span>
        {aff.email ? (
          <span className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap text-xs">
            {error ?? aff.email}
          </span>
        ) : error ? (
          <span className="text-destructive overflow-hidden text-ellipsis whitespace-nowrap text-xs">{error}</span>
        ) : null}
      </span>
      <AffiliationBadge state={aff.state} label={t(`state_${aff.state}`)} />
      {action ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(action.operation)}
          className={cn(
            "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors disabled:opacity-50",
            "bg-background border-border",
            action.tone === "danger"
              ? "text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5"
              : "text-foreground hover:bg-accent",
          )}
        >
          <action.icon size={13.5} /> <span className="hidden @min-[768px]:inline">{action.label}</span>
        </button>
      ) : (
        <span className="text-muted-foreground/70 hidden shrink-0 pr-1 text-xs italic @min-[768px]:inline">
          {aff.state === "rejected" ? t("action_declined") : ""}
        </span>
      )}
    </div>
  );
}

/**
 * Access tab - read-only display of organization access.
 */
function ConsoleAccessTab({ global, orgs, t }: { global: boolean; orgs: ConsoleOrg[]; t: Translate }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="border-border bg-muted/40 flex items-start gap-2.5 rounded-md border px-3.5 py-3">
        <span className="text-muted-foreground mt-px shrink-0">
          <Eye size={15} />
        </span>
        <span className="text-muted-foreground text-xs leading-normal text-pretty">{t("access_banner")}</span>
      </div>

      {global ? (
        <section className="flex flex-col gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("access_scope")}
          </span>
          <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-500/6 px-3.5 py-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <Globe size={17} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-sm font-semibold">{t("access_global_title")}</span>
                <span className="text-muted-foreground/80 font-mono text-tiny">org = NULL</span>
              </div>
              <span className="text-muted-foreground text-xs leading-[1.45] text-pretty">
                {t("access_global_desc")}
              </span>
              <div className="mt-0.5">
                <AccessPill global label={t("read_access")} />
              </div>
            </div>
          </div>
        </section>
      ) : orgs.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
            <Building2 size={22} />
          </span>
          <div className="flex max-w-[42ch] flex-col gap-1">
            <span className="text-foreground text-sm font-semibold">{t("access_empty_title")}</span>
            <span className="text-xs leading-normal text-pretty">{t("access_empty_desc")}</span>
          </div>
        </div>
      ) : (
        <section className="flex flex-col gap-2.5">
          <div className="flex min-h-7 items-center justify-between gap-2.5">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
              {t("access_group")}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">{orgs.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {orgs.map((org) => (
              <ConsoleAccessCard key={org.organization_id} org={org} accessLabel={t("read_access")} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ConsoleAccessCard({ org, accessLabel }: { org: ConsoleOrg; accessLabel: string }) {
  return (
    <div
      className="border-border bg-background grid items-start gap-3 rounded-lg border px-3.5 py-3"
      style={{ gridTemplateColumns: "36px 1fr" }}
    >
      <span className="bg-muted text-foreground border-border inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold">
        {INITIALS_OF(org.organization_name)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-sm font-medium">{org.organization_name}</span>
          {org.organization_slug ? (
            <code className="text-muted-foreground/80 font-mono text-tiny">{org.organization_slug}</code>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <AccessPill global={false} label={accessLabel} />
        </div>
      </div>
    </div>
  );
}

/**
 * Profile tab - read-only display (agency edit/delete not available here).
 */
function ConsoleProfileTab({ data, t }: { data: ConsoleData; t: Translate }) {
  const rows = [
    { label: t("profile_name"), value: data.agency_name },
    { label: t("profile_slug"), value: data.agency_slug, mono: true },
    { label: t("profile_status"), value: data.disabled ? t("profile_disabled") : t("profile_active") },
  ];
  return (
    <section className="flex flex-col gap-4">
      <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
        {t("profile_group")}
      </span>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="border-border bg-background grid items-center gap-3 rounded-md border px-3.5 py-2.5"
            style={{ gridTemplateColumns: "1fr auto" }}
          >
            <span className="text-muted-foreground text-xs font-medium">{row.label}</span>
            <span className={cn("text-foreground text-sm/normal", row.mono && "font-mono text-xs")}>{row.value}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-xs leading-normal">
        <span className="text-muted-foreground/80 mt-px shrink-0">
          <Eye size={13} />
        </span>
        <span className="text-pretty">{t("profile_note")}</span>
      </p>
    </section>
  );
}

/**
 * Inline atoms scoped to this surface to honor the file-list constraint.
 */
function AffiliationBadge({ state, label }: { state: AffiliationState; label: string }) {
  const base =
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-tiny font-medium leading-[1.2] tracking-[0.01em]";
  if (state === "accepted") {
    return (
      <span
        className={cn(
          base,
          "border border-emerald-600/30 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-300",
        )}
      >
        <BadgeCheck size={11} strokeWidth={2.25} /> {label}
      </span>
    );
  }
  if (state === "pending") {
    return (
      <span className={cn(base, "border-border text-muted-foreground border border-dashed bg-transparent")}>
        <Hourglass size={10} /> {label}
      </span>
    );
  }
  if (state === "rejected") {
    return (
      <span className={cn(base, "border-destructive/35 text-destructive bg-destructive/6 border")}>
        <X size={10} strokeWidth={2.5} /> {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        "border-border text-muted-foreground bg-muted/50 decoration-muted-foreground/40 border line-through",
      )}
    >
      {label}
    </span>
  );
}

function AccessPill({ global, label }: { global: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium leading-[1.3]",
        global
          ? "border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "border-border text-foreground bg-background border",
      )}
    >
      <Eye size={10.5} /> {label}
    </span>
  );
}

/**
 * TODO: NEVER PASS DICT TRANSLATIONS AS PROPS OR ARGUMENTS.
 */
function CONSOLE_HEAD(t: Translate): Record<ConsoleTab, { title: string; desc: string }> {
  return {
    team: { title: t("team_title"), desc: t("team_desc") },
    access: { title: t("access_title"), desc: t("access_desc") },
    profile: { title: t("profile_title"), desc: t("profile_desc") },
    tickets: { title: t("tickets_title"), desc: t("tickets_desc") },
  };
}

const LOCALE_ES = {
  page_title: "Consola de agencia",
  topbar_console: "Consola de agencia",
  settings: "Ajustes",
  topbar_affiliate: "Afiliado",
  tabs_aria: "Secciones de la agencia",
  tab_team: "Equipo",
  tab_access: "Accesos",
  tab_profile: "Perfil",
  invite: "Afiliar persona",
  self: "Tú",
  team_title: "Equipo de la agencia",
  team_desc: "Las personas de tu firma que llevan la agencia. Invítalas o revoca su acceso.",
  access_title: "Accesos recibidos",
  access_desc: "Lo que cada organización compartió con tu agencia. Solo lectura — no se edita aquí.",
  profile_title: "Perfil de la agencia",
  profile_desc: "Cómo se ve tu agencia para las organizaciones que la habilitan.",
  stat_affiliates: "Afiliados activos",
  stat_pending: "{{count}} pendientes",
  stat_up_to_date: "al día",
  stat_orgs: "Organizaciones",
  stat_all: "Todas",
  stat_global_scope: "alcance global",
  stat_granted_you: "te dieron acceso",
  stat_access_level: "Nivel de acceso",
  stat_read: "Lectura",
  stat_never_writes: "nunca escribe",
  team_group: "Tu equipo",
  team_count: "{{active}} activos · {{total}} total",
  team_note_prefix:
    "Cualquier afiliado activo gestiona al equipo. Cada afiliado lleva la agencia en su sesión y hereda los accesos de la pestaña",
  team_note_suffix: "— nunca puede escribir.",
  team_empty_title: "Aún no afilias a nadie",
  team_empty_desc:
    "Invita a las personas de tu firma por correo. Cuando acepten, se unen a la agencia y heredan sus accesos de solo lectura.",
  state_accepted: "Activo",
  state_pending: "Pendiente",
  state_revoked: "Revocado",
  state_rejected: "Rechazado",
  action_revoke: "Revocar",
  action_reactivate: "Reactivar",
  action_declined: "declinó",
  read_access: "Acceso de lectura",
  access_banner:
    "No puedes cambiar estos accesos desde aquí. Cada organización decide qué te comparte — si necesitas más, pídeselo a su administrador. Todo lo que ves es de solo lectura.",
  access_scope: "Alcance",
  access_global_title: "Todas las organizaciones",
  access_global_desc:
    "Como equipo interno, tienes acceso global de solo lectura a todos los tenants y organizaciones — actuales y futuros.",
  access_empty_title: "Ninguna organización te dio acceso",
  access_empty_desc:
    "Cuando el administrador de una organización habilite a tu agencia, aparecerá aquí con acceso de lectura.",
  access_group: "Organizaciones que te dieron acceso",
  profile_group: "Perfil de la agencia",
  profile_name: "Nombre",
  profile_slug: "Identificador",
  profile_status: "Estado",
  profile_active: "Activa",
  profile_disabled: "Deshabilitada",
  profile_note: "Para cambiar el nombre o el identificador de la agencia, escríbenos.",
  tab_tickets: "Tickets",
  tickets_title: "Tickets de soporte",
  tickets_desc: "Gestiona los tickets de soporte de las organizaciones que atiende tu agencia.",
  tickets_redirect_hint: "Abriendo tickets…",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Agency console",
  topbar_console: "Agency console",
  settings: "Settings",
  topbar_affiliate: "Affiliate",
  tabs_aria: "Agency sections",
  tab_team: "Team",
  tab_access: "Access",
  tab_profile: "Profile",
  invite: "Affiliate a person",
  self: "You",
  team_title: "Agency team",
  team_desc: "The people from your firm who carry the agency. Invite them or revoke their access.",
  access_title: "Received access",
  access_desc: "What each organization shared with your agency. Read-only — not edited here.",
  profile_title: "Agency profile",
  profile_desc: "How your agency looks to the organizations that enable it.",
  stat_affiliates: "Active affiliates",
  stat_pending: "{{count}} pending",
  stat_up_to_date: "up to date",
  stat_orgs: "Organizations",
  stat_all: "All",
  stat_global_scope: "global scope",
  stat_granted_you: "gave you access",
  stat_access_level: "Access level",
  stat_read: "Read",
  stat_never_writes: "never writes",
  team_group: "Your team",
  team_count: "{{active}} active · {{total}} total",
  team_note_prefix:
    "Any active affiliate manages the team. Each affiliate carries the agency in their session and inherits the access from the",
  team_note_suffix: "tab — can never write.",
  team_empty_title: "You haven't affiliated anyone yet",
  team_empty_desc:
    "Invite the people from your firm by email. When they accept, they join the agency and inherit its read-only access.",
  state_accepted: "Active",
  state_pending: "Pending",
  state_revoked: "Revoked",
  state_rejected: "Rejected",
  action_revoke: "Revoke",
  action_reactivate: "Reactivate",
  action_declined: "declined",
  read_access: "Read access",
  access_banner:
    "You can't change this access here. Each organization decides what to share with you — if you need more, ask its admin. Everything you see is read-only.",
  access_scope: "Scope",
  access_global_title: "All organizations",
  access_global_desc:
    "As an internal team, you have global read-only access to every tenant and organization — current and future.",
  access_empty_title: "No organization gave you access",
  access_empty_desc: "When an organization's admin enables your agency, it will appear here with read access.",
  access_group: "Organizations that gave you access",
  profile_group: "Agency profile",
  profile_name: "Name",
  profile_slug: "Identifier",
  profile_status: "Status",
  profile_active: "Active",
  profile_disabled: "Disabled",
  profile_note: "To change the agency name or identifier, write to us.",
  tab_tickets: "Tickets",
  tickets_title: "Support tickets",
  tickets_desc: "Manage support tickets from the organizations your agency serves.",
  tickets_redirect_hint: "Opening tickets…",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Console da agência",
  topbar_console: "Console da agência",
  settings: "Configurações",
  topbar_affiliate: "Afiliado",
  tabs_aria: "Seções da agência",
  tab_team: "Equipe",
  tab_access: "Acessos",
  tab_profile: "Perfil",
  invite: "Afiliar uma pessoa",
  self: "Você",
  team_title: "Equipe da agência",
  team_desc: "As pessoas da sua firma que carregam a agência. Convide-as ou revogue o acesso.",
  access_title: "Acessos recebidos",
  access_desc: "O que cada organização compartilhou com sua agência. Somente leitura — não se edita aqui.",
  profile_title: "Perfil da agência",
  profile_desc: "Como sua agência aparece para as organizações que a habilitam.",
  stat_affiliates: "Afiliados ativos",
  stat_pending: "{{count}} pendentes",
  stat_up_to_date: "em dia",
  stat_orgs: "Organizações",
  stat_all: "Todas",
  stat_global_scope: "alcance global",
  stat_granted_you: "lhe deram acesso",
  stat_access_level: "Nível de acesso",
  stat_read: "Leitura",
  stat_never_writes: "nunca escreve",
  team_group: "Sua equipe",
  team_count: "{{active}} ativos · {{total}} total",
  team_note_prefix:
    "Qualquer afiliado ativo gerencia a equipe. Cada afiliado carrega a agência na sessão e herda os acessos da aba",
  team_note_suffix: "— nunca pode escrever.",
  team_empty_title: "Você ainda não afiliou ninguém",
  team_empty_desc:
    "Convide as pessoas da sua firma por e-mail. Quando aceitarem, entram na agência e herdam seus acessos somente leitura.",
  state_accepted: "Ativo",
  state_pending: "Pendente",
  state_revoked: "Revogado",
  state_rejected: "Rejeitado",
  action_revoke: "Revogar",
  action_reactivate: "Reativar",
  action_declined: "recusou",
  read_access: "Acesso de leitura",
  access_banner:
    "Você não pode alterar esses acessos aqui. Cada organização decide o que compartilhar com você — se precisar de mais, peça ao administrador dela. Tudo o que você vê é somente leitura.",
  access_scope: "Alcance",
  access_global_title: "Todas as organizações",
  access_global_desc:
    "Como equipe interna, você tem acesso global somente leitura a todos os tenants e organizações — atuais e futuros.",
  access_empty_title: "Nenhuma organização lhe deu acesso",
  access_empty_desc:
    "Quando o administrador de uma organização habilitar sua agência, ela aparecerá aqui com acesso de leitura.",
  access_group: "Organizações que lhe deram acesso",
  profile_group: "Perfil da agência",
  profile_name: "Nome",
  profile_slug: "Identificador",
  profile_status: "Status",
  profile_active: "Ativa",
  profile_disabled: "Desabilitada",
  profile_note: "Para alterar o nome ou o identificador da agência, escreva para nós.",
  tab_tickets: "Tickets",
  tickets_title: "Tickets de suporte",
  tickets_desc: "Gerencie tickets de suporte das organizações que sua agência atende.",
  tickets_redirect_hint: "Abrindo tickets…",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
