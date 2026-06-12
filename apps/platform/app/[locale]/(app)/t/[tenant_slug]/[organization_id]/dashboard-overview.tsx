"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card } from "@packages/ui-common/shadcn/components/ui/card";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  ArrowUpRight,
  Box,
  Circle,
  CircleCheck,
  FileText,
  LayoutPanelLeft,
  type LucideIcon,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import type { AppRoute } from "~/lib/route";

type Period = "today" | "week" | "month";

type StatKey = "members" | "projects" | "documents" | "storage";
type Stat = {
  key: StatKey;
  value: string;
  delta?: string;
  up?: boolean;
  subKey?: "storage_sub";
  progress?: number;
  Icon: LucideIcon;
};

type VerbKey = "invited" | "published" | "commented" | "joined" | "integration";
type ActivityItem = { who: string; verb: VerbKey; target: string; time: string; initials: string; tone: string };

type RoleKey = "owner" | "admin" | "editor" | "viewer";
type TeamMember = { name: string; role: RoleKey; initials: string; you: boolean; tone: string };

type ChecklistKey = "org" | "team" | "project" | "integration";
type ChecklistStep = { key: ChecklistKey; done: boolean };

const TONES = /*#__PURE__*/ [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
] as const;

const PERIODS: Period[] = /*#__PURE__*/ ["today", "week", "month"];

/**
 * Mock data — replaced by real workspace metrics in the backend pass.
 */
const STATS: Stat[] = /*#__PURE__*/ [
  { key: "members", value: "24", delta: "+3", up: true, Icon: Users },
  { key: "projects", value: "8", delta: "+2", up: true, Icon: LayoutPanelLeft },
  { key: "documents", value: "142", delta: "+12", up: true, Icon: FileText },
  { key: "storage", value: "64%", subKey: "storage_sub", progress: 64, Icon: Box },
];

const ACTIVITY: ActivityItem[] = /*#__PURE__*/ [
  { who: "Maya Chen", verb: "invited", target: "Acme Inc.", time: "12m", initials: "MC", tone: TONES[0] },
  { who: "Theo Park", verb: "published", target: "Q3 Launch Plan", time: "1h", initials: "TP", tone: TONES[1] },
  { who: "Lina Ortiz", verb: "commented", target: "Brand Guidelines", time: "2h", initials: "LO", tone: TONES[2] },
  { who: "Devin Walsh", verb: "joined", target: "", time: "5h", initials: "DW", tone: TONES[3] },
  { who: "Slack", verb: "integration", target: "", time: "—", initials: "SL", tone: TONES[4] },
];

const TEAM: TeamMember[] = /*#__PURE__*/ [
  { name: "Sam Reyes", role: "owner", initials: "SR", you: true, tone: "bg-fuchsia-600 text-white" },
  { name: "Maya Chen", role: "admin", initials: "MC", you: false, tone: TONES[0] },
  { name: "Theo Park", role: "editor", initials: "TP", you: false, tone: TONES[1] },
  { name: "Lina Ortiz", role: "editor", initials: "LO", you: false, tone: TONES[2] },
  { name: "Devin Walsh", role: "viewer", initials: "DW", you: false, tone: TONES[3] },
];

const CHECKLIST: ChecklistStep[] = /*#__PURE__*/ [
  { key: "org", done: true },
  { key: "team", done: true },
  { key: "project", done: false },
  { key: "integration", done: false },
];

export function DashboardOverview({
  organizationName,
  membersHref,
}: {
  organizationName: string;
  membersHref: AppRoute;
}) {
  const { t } = useRosetta(LOCALES);
  const [period, setPeriod] = useState<Period>("week");
  const doneCount = CHECKLIST.filter((c) => c.done).length;

  return (
    <div className="@container px-5 py-5 @min-[900px]:px-8 @min-[900px]:py-7">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-muted-foreground mb-1.5 text-xs font-semibold uppercase tracking-[0.09em]">
            {organizationName}
          </div>
          <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight @min-[900px]:text-2xl">
            {t("heading")}
          </h1>
          <p className="text-muted-foreground m-0 mt-1 text-sm text-pretty">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden @min-[760px]:block">
            <PeriodSegmented
              value={period}
              onChange={setPeriod}
              ariaLabel={t("period_label")}
              labels={{ today: t("period_today"), week: t("period_week"), month: t("period_month") }}
            />
          </div>
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href={membersHref}>{t("invite")}</Link>
          </Button>
          <Button size="sm" className="h-9">
            <Plus className="size-[15px]" /> {t("new_project")}
          </Button>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 @min-[1000px]:grid-cols-4">
        {STATS.map((stat) => (
          <OverviewStatCard
            key={stat.key}
            stat={stat}
            label={t(`stat_${stat.key}`)}
            sub={stat.subKey ? t(stat.subKey) : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 @min-[1000px]:grid-cols-3">
        <Card className="gap-0 overflow-hidden p-0 @min-[1000px]:col-span-2">
          <CardHeading title={t("activity_title")} action={t("view_all")} />
          <ul className="divide-border m-0 list-none divide-y p-0">
            {ACTIVITY.map((item) => (
              <li key={`${item.who}-${item.verb}`} className="flex items-center gap-3 px-4 py-3">
                <InitialsAvatar initials={item.initials} tone={item.tone} size={32} />
                <p className="text-muted-foreground m-0 min-w-0 flex-1 text-sm/normal leading-snug text-pretty">
                  <strong className="text-foreground font-semibold">{item.who}</strong> {t(`verb_${item.verb}`)}
                  {item.target ? <span className="text-foreground font-medium"> {item.target}</span> : null}
                </p>
                <span className="text-muted-foreground shrink-0 whitespace-nowrap text-xs">{item.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="gap-0 overflow-hidden p-0">
            <CardHeading title={t("team_title")} action={t("manage")} />
            <ul className="divide-border m-0 list-none divide-y p-0">
              {TEAM.map((member) => (
                <li key={member.name} className="flex items-center gap-3 px-4 py-2.5">
                  <InitialsAvatar initials={member.initials} tone={member.tone} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block truncate text-sm/normal font-medium">
                      {member.name}
                      {member.you ? <span className="text-muted-foreground font-normal"> · {t("you")}</span> : null}
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">{t(`role_${member.role}`)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-foreground m-0 text-sm font-semibold tracking-[-0.01em]">{t("setup_title")}</h2>
              <span className="text-muted-foreground text-xs font-medium tabular-nums">
                {doneCount}/{CHECKLIST.length}
              </span>
            </div>
            <div className="bg-muted mb-3.5 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-foreground h-full rounded-full transition-all"
                style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }}
              />
            </div>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {CHECKLIST.map((step) => (
                <li key={step.key} className="flex items-center gap-2.5">
                  {step.done ? (
                    <CircleCheck
                      size={17}
                      strokeWidth={2}
                      className="shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                  ) : (
                    <Circle size={17} className="text-muted-foreground/50 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-sm/normal",
                      step.done ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {t(`checklist_${step.key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OverviewStatCard({ stat, label, sub }: { stat: Stat; label: string; sub?: string }) {
  const Icon = stat.Icon;
  return (
    <Card className="flex flex-col gap-3.5 p-4">
      <div className="flex items-center justify-between">
        <span className="bg-muted text-muted-foreground inline-flex size-8 items-center justify-center rounded-lg">
          <Icon size={16} />
        </span>
        {stat.delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
            )}
          >
            {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {stat.delta}
          </span>
        ) : null}
      </div>
      <div>
        <div className="text-foreground text-2xl font-semibold leading-none tracking-[-0.02em] tabular-nums">
          {stat.value}
        </div>
        <div className="text-muted-foreground mt-1.5 text-xs">
          {label}
          {sub ? <span className="text-muted-foreground/70"> · {sub}</span> : null}
        </div>
      </div>
      {stat.progress != null ? (
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div className="bg-foreground h-full rounded-full" style={{ width: `${stat.progress}%` }} />
        </div>
      ) : null}
    </Card>
  );
}

function CardHeading({ title, action }: { title: string; action: string }) {
  return (
    <div className="border-border flex h-12 items-center justify-between border-b px-4">
      <h2 className="text-foreground m-0 text-sm font-semibold tracking-[-0.01em]">{title}</h2>
      <button
        type="button"
        className="text-muted-foreground hover:bg-accent hover:text-foreground -mr-1.5 inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-1.5 py-1 text-xs"
      >
        {action} <ArrowUpRight size={13} />
      </button>
    </div>
  );
}

function PeriodSegmented({
  value,
  onChange,
  ariaLabel,
  labels,
}: {
  value: Period;
  onChange: (value: Period) => void;
  ariaLabel: string;
  labels: Record<Period, string>;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="border-border bg-muted/40 inline-flex items-center gap-0.5 rounded-lg border p-0.5"
    >
      {PERIODS.map((option) => {
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={cn(
              "h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium transition-colors",
              isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}

function InitialsAvatar({ initials, tone, size }: { initials: string; tone: string; size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-[-0.01em]",
        tone,
      )}
    >
      {initials}
    </span>
  );
}

const LOCALE_ES = {
  heading: "Resumen",
  subtitle: "Esto es lo que está pasando en tu organización.",
  period_label: "Periodo",
  period_today: "Hoy",
  period_week: "Semana",
  period_month: "Mes",
  invite: "Invitar",
  new_project: "Nuevo proyecto",
  stat_members: "Miembros activos",
  stat_projects: "Proyectos abiertos",
  stat_documents: "Documentos",
  stat_storage: "Almacenamiento",
  storage_sub: "de 100 GB",
  activity_title: "Actividad reciente",
  view_all: "Ver todo",
  team_title: "Tu equipo",
  manage: "Gestionar",
  you: "Tú",
  role_owner: "Propietario",
  role_admin: "Administrador",
  role_editor: "Editor",
  role_viewer: "Lector",
  setup_title: "Termina la configuración",
  checklist_org: "Crea tu organización",
  checklist_team: "Invita a tu equipo",
  checklist_project: "Crea tu primer proyecto",
  checklist_integration: "Conecta una integración",
  verb_invited: "invitó a 3 personas a",
  verb_published: "publicó",
  verb_commented: "comentó en",
  verb_joined: "se unió al espacio de trabajo",
  verb_integration: "se conectó como integración",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Overview",
  subtitle: "Here's what's happening across your workspace.",
  period_label: "Period",
  period_today: "Today",
  period_week: "Week",
  period_month: "Month",
  invite: "Invite",
  new_project: "New project",
  stat_members: "Active members",
  stat_projects: "Open projects",
  stat_documents: "Documents",
  stat_storage: "Storage used",
  storage_sub: "of 100 GB",
  activity_title: "Recent activity",
  view_all: "View all",
  team_title: "Your team",
  manage: "Manage",
  you: "You",
  role_owner: "Owner",
  role_admin: "Admin",
  role_editor: "Editor",
  role_viewer: "Viewer",
  setup_title: "Finish setup",
  checklist_org: "Create your organization",
  checklist_team: "Invite your team",
  checklist_project: "Create your first project",
  checklist_integration: "Connect an integration",
  verb_invited: "invited 3 people to",
  verb_published: "published",
  verb_commented: "commented on",
  verb_joined: "joined the workspace",
  verb_integration: "was connected as an integration",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Resumo",
  subtitle: "Isto é o que está acontecendo na sua organização.",
  period_label: "Período",
  period_today: "Hoje",
  period_week: "Semana",
  period_month: "Mês",
  invite: "Convidar",
  new_project: "Novo projeto",
  stat_members: "Membros ativos",
  stat_projects: "Projetos abertos",
  stat_documents: "Documentos",
  stat_storage: "Armazenamento",
  storage_sub: "de 100 GB",
  activity_title: "Atividade recente",
  view_all: "Ver tudo",
  team_title: "Sua equipe",
  manage: "Gerenciar",
  you: "Você",
  role_owner: "Proprietário",
  role_admin: "Administrador",
  role_editor: "Editor",
  role_viewer: "Leitor",
  setup_title: "Conclua a configuração",
  checklist_org: "Crie sua organização",
  checklist_team: "Convide sua equipe",
  checklist_project: "Crie seu primeiro projeto",
  checklist_integration: "Conecte uma integração",
  verb_invited: "convidou 3 pessoas para",
  verb_published: "publicou",
  verb_commented: "comentou em",
  verb_joined: "entrou no espaço de trabalho",
  verb_integration: "foi conectado como integração",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
