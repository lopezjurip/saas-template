"use client";

import type { Database } from "@packages/supabase/types";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui-common/shadcn/components/ui/tabs";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Hourglass,
  Inbox,
  Info,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionClaimTicket } from "./actions";

export type PoolTicket = {
  ticket_id: string;
  ticket_subject: string;
  ticket_status: Database["public"]["Enums"]["ticket_status"];
  ticket_priority: Database["public"]["Enums"]["notification_priority"];
  ticket_claimed_at: string | null;
  ticket_resolved_at: string | null;
  ticket_created_at: string;
  assigned_profile_id: string | null;
  assigned_agency_id: string | null;
  organization_id: number | null;
  tenant_id: number;
  conversation_id: string;
  organization_name: string | null;
  organization_slug: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
};

type StatusFilter = "open" | "claimed" | "in_progress" | "resolved" | "closed" | "all";

/**
 * Agency ticket pool — filterable list of support tickets accessible to the agency.
 */
export function TicketPool({
  tickets,
  agency_id,
  agency_slug,
  agency_name,
}: {
  tickets: PoolTicket[];
  agency_id: string;
  agency_slug: string;
  agency_name: string;
}) {
  const { t } = useRosetta(LOCALES);
  const [filter, setFilter] = useState<StatusFilter>("open");

  const filtered = filter === "all" ? tickets : tickets.filter((tk) => tk["ticket_status"] === filter);

  const counts = TICKET_COUNTS(tickets);

  return (
    <div className="@container bg-background relative flex min-h-svh w-full flex-col overflow-hidden">
      <header className="border-border bg-background flex shrink-0 items-center gap-3 border-b px-4 py-3 @min-[768px]:px-6">
        <Link
          href={ROUTE("/a/[agency_slug]", { agency_slug })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="bg-muted text-foreground border-border inline-flex size-8 shrink-0 items-center justify-center rounded-lg border">
            <Building2 size={15} />
          </span>
        </Link>
        <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
        <div className="flex min-w-0 flex-col gap-px">
          <span className="text-foreground truncate text-sm font-semibold tracking-[-0.01em]">{t("header_title")}</span>
          <span className="text-muted-foreground text-xs">{agency_name}</span>
        </div>
      </header>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as StatusFilter)}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList
          variant="line"
          className="border-border no-scrollbar h-auto w-full justify-start gap-1 overflow-x-auto border-b px-3 @min-[768px]:px-5"
        >
          <PoolTabTrigger value="open" icon={Inbox} label={t("tab_open")} count={counts["open"]} />
          <PoolTabTrigger
            value="in_progress"
            icon={CircleDot}
            label={t("tab_in_progress")}
            count={counts["in_progress"]}
          />
          <PoolTabTrigger value="claimed" icon={Hourglass} label={t("tab_claimed")} count={counts["claimed"]} />
          <PoolTabTrigger value="resolved" icon={CheckCircle2} label={t("tab_resolved")} count={counts["resolved"]} />
          <PoolTabTrigger value="closed" icon={Clock} label={t("tab_closed")} count={counts["closed"]} />
          <PoolTabTrigger value="all" icon={ArrowRight} label={t("tab_all")} count={tickets.length} />
        </TabsList>

        <main className="min-w-0 flex-1 overflow-auto px-4 py-5 pb-8 @min-[768px]:px-6 @min-[768px]:py-6 @min-[768px]:pb-10">
          <div className="mx-auto flex w-full max-w-205 flex-col gap-5">
            {(["open", "claimed", "in_progress", "resolved", "closed", "all"] as const).map((status) => (
              <TabsContent key={status} value={status} className="mt-0">
                <TicketList tickets={filtered} agency_id={agency_id} agency_slug={agency_slug} filter={status} t={t} />
              </TabsContent>
            ))}
          </div>
        </main>
      </Tabs>
    </div>
  );
}

type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];

function PoolTabTrigger({
  value,
  icon: Icon,
  label,
  count,
}: {
  value: StatusFilter;
  icon: LucideIcon;
  label: string;
  count: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className="group/trigger text-muted-foreground data-[state=active]:text-foreground h-auto flex-none gap-1.5 px-2.5 py-2.5 text-sm/normal"
    >
      <Icon size={14} />
      {label}
      {count > 0 ? (
        <span className="bg-muted text-muted-foreground group-data-[state=active]/trigger:bg-foreground group-data-[state=active]/trigger:text-background inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-tiny font-semibold leading-none tabular-nums">
          {count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

function TicketList({
  tickets,
  agency_id,
  agency_slug,
  filter,
  t,
}: {
  tickets: PoolTicket[];
  agency_id: string;
  agency_slug: string;
  filter: StatusFilter;
  t: Translate;
}) {
  if (tickets.length === 0) {
    return (
      <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
        <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
          <Inbox size={22} />
        </span>
        <div className="flex max-w-[42ch] flex-col gap-1">
          <span className="text-foreground text-sm font-semibold">{t("empty_title")}</span>
          <span className="text-xs leading-normal text-pretty">
            {filter === "open" ? t("empty_open_desc") : t("empty_desc")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tickets.map((ticket) => (
        <TicketRow key={ticket["ticket_id"]} ticket={ticket} agency_id={agency_id} agency_slug={agency_slug} t={t} />
      ))}
    </div>
  );
}

function TicketRow({
  ticket,
  agency_id,
  agency_slug,
  t,
}: {
  ticket: PoolTicket;
  agency_id: string;
  agency_slug: string;
  t: Translate;
}) {
  const [pending, startTransition] = useTransition();
  const [claimError, setClaimError] = useState<string | null>(null);

  function handleClaim() {
    setClaimError(null);
    startTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(actionClaimTicket({ ticket_id: ticket["ticket_id"], agency_slug }));
      if (err instanceof ErrorSafeActionServer) setClaimError(err.serverError);
    });
  }

  const scope = ticket["organization_name"]
    ? `${ticket["organization_name"]}${ticket["tenant_name"] ? ` · ${ticket["tenant_name"]}` : ""}`
    : (ticket["tenant_name"] ?? null);

  const detailHref = ROUTE("/a/[agency_slug]/tickets/[ticket_id]", {
    agency_slug,
    ticket_id: ticket["ticket_id"] as string,
  });
  const priority = ticket["ticket_priority"];
  const status = ticket["ticket_status"];

  return (
    <div
      className={cn(
        "border-border bg-background grid w-full items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors",
        "hover:bg-muted/20",
      )}
      style={{ gridTemplateColumns: "1fr auto" }}
    >
      <Link href={detailHref} className="flex min-w-0 flex-col gap-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <PriorityBadge priority={priority} t={t} />
          <StatusBadge status={status} t={t} />
          <span className="text-foreground truncate text-sm font-medium">{ticket["ticket_subject"]}</span>
        </div>
        {scope ? (
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Building2 size={11} className="shrink-0" />
            {scope}
          </span>
        ) : null}
        {claimError ? (
          <span className="text-destructive inline-flex items-center gap-1.5 text-xs">
            <Info size={11} className="shrink-0" />
            {claimError}
          </span>
        ) : null}
        <span className="text-muted-foreground/70 text-xs">{RELATIVE_TIME(ticket["ticket_created_at"])}</span>
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {status === "open" ? (
          <Button size="sm" variant="outline" disabled={pending} onClick={handleClaim} className="h-8 text-xs">
            {pending ? t("claiming") : t("claim")}
          </Button>
        ) : (
          <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
            <Link href={detailHref}>
              {t("view")} <ChevronRight size={13} />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function PriorityBadge({
  priority,
  t,
}: {
  priority: Database["public"]["Enums"]["notification_priority"];
  t: Translate;
}) {
  const styles: Record<typeof priority, string> = {
    critical: "border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400",
    high: "border-orange-600/40 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    medium: "border-yellow-600/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    low: "border-border text-muted-foreground bg-muted/50",
  };

  const Icon: LucideIcon = priority === "critical" || priority === "high" ? AlertTriangle : Info;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-tiny font-semibold leading-[1.2] tracking-[0.01em]",
        styles[priority],
      )}
    >
      <Icon size={10} strokeWidth={2.25} />
      {t(`priority_${priority}`)}
    </span>
  );
}

function StatusBadge({ status, t }: { status: Database["public"]["Enums"]["ticket_status"]; t: Translate }) {
  const styles: Record<typeof status, string> = {
    open: "border-blue-600/35 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    claimed: "border-purple-600/35 bg-purple-500/10 text-purple-700 dark:text-purple-400",
    in_progress: "border-amber-600/35 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    resolved: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    closed: "border-border text-muted-foreground bg-muted/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-tiny font-medium leading-[1.2]",
        styles[status],
      )}
    >
      {t(`status_${status}`)}
    </span>
  );
}

/**
 * Returns ticket counts by status for tab badges.
 */
function TICKET_COUNTS(tickets: PoolTicket[]): Record<Database["public"]["Enums"]["ticket_status"], number> {
  const counts = { open: 0, claimed: 0, in_progress: 0, resolved: 0, closed: 0 };
  for (const tk of tickets) {
    counts[tk["ticket_status"]] += 1;
  }
  return counts;
}

/**
 * Returns a human-readable relative time string for a given ISO timestamp.
 */
function RELATIVE_TIME(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const LOCALE_ES = {
  page_title: "Tickets de soporte",
  header_title: "Tickets",
  tab_open: "Abiertos",
  tab_claimed: "Reclamados",
  tab_in_progress: "En proceso",
  tab_resolved: "Resueltos",
  tab_closed: "Cerrados",
  tab_all: "Todos",
  claim: "Reclamar",
  claiming: "Reclamando…",
  view: "Ver",
  empty_title: "No hay tickets aquí",
  empty_open_desc: "Los tickets abiertos de las organizaciones que gestionas aparecerán aquí.",
  empty_desc: "No hay tickets con este estado.",
  priority_low: "Baja",
  priority_medium: "Media",
  priority_high: "Alta",
  priority_critical: "Crítica",
  status_open: "Abierto",
  status_claimed: "Reclamado",
  status_in_progress: "En proceso",
  status_resolved: "Resuelto",
  status_closed: "Cerrado",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Support tickets",
  header_title: "Tickets",
  tab_open: "Open",
  tab_claimed: "Claimed",
  tab_in_progress: "In progress",
  tab_resolved: "Resolved",
  tab_closed: "Closed",
  tab_all: "All",
  claim: "Claim",
  claiming: "Claiming…",
  view: "View",
  empty_title: "No tickets here",
  empty_open_desc: "Open tickets from organizations you manage will appear here.",
  empty_desc: "No tickets with this status.",
  priority_low: "Low",
  priority_medium: "Medium",
  priority_high: "High",
  priority_critical: "Critical",
  status_open: "Open",
  status_claimed: "Claimed",
  status_in_progress: "In progress",
  status_resolved: "Resolved",
  status_closed: "Closed",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Tickets de suporte",
  header_title: "Tickets",
  tab_open: "Abertos",
  tab_claimed: "Reivindicados",
  tab_in_progress: "Em andamento",
  tab_resolved: "Resolvidos",
  tab_closed: "Fechados",
  tab_all: "Todos",
  claim: "Reivindicar",
  claiming: "Reivindicando…",
  view: "Ver",
  empty_title: "Nenhum ticket aqui",
  empty_open_desc: "Os tickets abertos das organizações que você gerencia aparecerão aqui.",
  empty_desc: "Nenhum ticket com este status.",
  priority_low: "Baixa",
  priority_medium: "Média",
  priority_high: "Alta",
  priority_critical: "Crítica",
  status_open: "Aberto",
  status_claimed: "Reivindicado",
  status_in_progress: "Em andamento",
  status_resolved: "Resolvido",
  status_closed: "Fechado",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
