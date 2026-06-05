"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui-common/shadcn/components/ui/tabs";
import { Textarea } from "@packages/ui-common/shadcn/components/ui/textarea";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  BadgeCheck,
  Ban,
  Briefcase,
  Building2,
  Check,
  Eye,
  Globe,
  Hourglass,
  Landmark,
  LifeBuoy,
  Link2,
  type LucideIcon,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import {
  ACTIVE_AFFILIATES,
  type AccessibleOrg,
  AFFILIATE_ORGS,
  type Affiliate,
  type AffiliationState,
  AGENCY_WILDCARD,
  type Agency,
  type AgencyKind,
  INITIALS_OF,
  IS_GLOBAL_AGENCY,
  SCOPED_ORG_COUNT,
} from "~/lib/agencies-mock";

type ConsoleTab = "team" | "access" | "profile";

const KIND_ICON: Record<AgencyKind, LucideIcon> = /*#__PURE__*/ {
  audit: Briefcase,
  government: Landmark,
  internal: LifeBuoy,
  accounting: Building2,
};

const KIND_ORDER = /*#__PURE__*/ ["audit", "government", "accounting", "internal"] as const;

export function AgencyConsole({ agency }: { agency: Agency }) {
  const { t } = useRosetta(LOCALES);
  const [tab, setTab] = useState<ConsoleTab>("team");

  // Locale stays a literal sentinel — proxy.ts rewrites /[locale]/… to the active locale.
  const inviteHref = `/[locale]/admin/agencies/${agency["slug"]}/affiliates/new`;

  const global = IS_GLOBAL_AGENCY(agency);
  const accessItems = AFFILIATE_ORGS(agency);
  const teamCount = agency["affiliates"].length;
  const accessCount = global ? null : accessItems.length;
  const owner = ACTIVE_AFFILIATES(agency)[0];

  const head = CONSOLE_HEAD(t)[tab];

  return (
    <div className="@container bg-background relative flex min-h-svh w-full flex-col overflow-hidden">
      {/* Agency-branded top bar */}
      <header className="border-border bg-background flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 @min-[768px]:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <AgencyTile kind={agency["kind"]} size={36} />
          <div className="flex min-w-0 flex-col gap-[1px]">
            <span className="text-foreground truncate text-[14px] font-semibold tracking-[-0.01em]">
              {agency["name"]}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
              <span>{t("topbar_console")}</span>
              <span className="opacity-40">·</span>
              <code className="font-mono text-[10.5px]">{agency["slug"]}</code>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="border-border text-muted-foreground bg-muted/50 hidden items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-medium leading-none tracking-[0.02em] @min-[768px]:flex">
            <ShieldCheck size={11} /> {t("topbar_admin")}
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden min-w-0 flex-col items-end gap-[1px] @min-[768px]:flex">
              <span className="text-foreground max-w-[140px] truncate text-[12.5px] font-medium leading-none">
                {owner?.["name"]}
              </span>
              <span className="text-muted-foreground mt-0.5 max-w-[140px] truncate text-[11px] leading-none">
                {owner?.["role"]}
              </span>
            </span>
            <span className="bg-muted text-foreground inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold">
              {INITIALS_OF(owner?.["name"] ?? "?")}
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
        </TabsList>

        <main className="min-w-0 flex-1 overflow-auto px-4 py-5 pb-8 @min-[768px]:px-6 @min-[768px]:py-6 @min-[768px]:pb-10">
          <div className="mx-auto flex w-full max-w-[820px] flex-col gap-6">
            <ConsoleStatStrip agency={agency} t={t} />

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="text-foreground m-0 text-[19px] font-semibold tracking-[-0.02em]">{head.title}</h1>
                <p className="text-muted-foreground m-0 max-w-[60ch] text-[12.5px] leading-[1.5] [text-wrap:pretty]">
                  {head.desc}
                </p>
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
              <ConsoleTeamTab agency={agency} inviteHref={inviteHref} t={t} />
            </TabsContent>
            <TabsContent value="access" className="mt-0">
              <ConsoleAccessTab global={global} items={accessItems} t={t} />
            </TabsContent>
            <TabsContent value="profile" className="mt-0">
              <ConsoleProfileTab agency={agency} t={t} />
            </TabsContent>
          </div>
        </main>
      </Tabs>
    </div>
  );
}

type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];

// ── Chrome ──────────────────────────────────────────────────────────────────

function ConsoleTabTrigger({
  value,
  icon: Icon,
  label,
  count,
}: {
  value: ConsoleTab;
  icon: LucideIcon;
  label: string;
  count: number | null;
}) {
  return (
    <TabsTrigger
      value={value}
      className="group/trigger text-muted-foreground data-[state=active]:text-foreground h-auto flex-none gap-1.5 px-2.5 py-2.5 text-[13px]"
    >
      <Icon size={15} />
      {label}
      {count != null ? (
        <span className="bg-muted text-muted-foreground group-data-[state=active]/trigger:bg-foreground group-data-[state=active]/trigger:text-background inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10.5px] font-semibold leading-none tabular-nums">
          {count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

function ConsoleStatStrip({ agency, t }: { agency: Agency; t: Translate }) {
  const active = ACTIVE_AFFILIATES(agency).length;
  const pending = agency["affiliates"].filter((a) => a["state"] === "pending").length;
  const global = IS_GLOBAL_AGENCY(agency);
  const orgs = SCOPED_ORG_COUNT(agency);
  const stats = [
    {
      label: t("stat_affiliates"),
      value: String(active),
      sub: pending > 0 ? t("stat_pending", { count: pending }) : t("stat_up_to_date"),
    },
    {
      label: t("stat_orgs"),
      value: global ? t("stat_all") : String(orgs),
      sub: global ? t("stat_global_scope") : t("stat_granted_you"),
    },
    { label: t("stat_access_level"), value: t("stat_read"), sub: t("stat_never_writes") },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="border-border bg-background flex flex-col gap-0.5 rounded-lg border px-3.5 py-3">
          <span className="text-muted-foreground truncate text-[10.5px] font-semibold uppercase tracking-[0.04em]">
            {s.label}
          </span>
          <span className="text-foreground text-[19px] font-semibold leading-tight tracking-[-0.02em] tabular-nums">
            {s.value}
          </span>
          <span className="text-muted-foreground truncate text-[11px]">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ── Team tab ────────────────────────────────────────────────────────────────

function ConsoleTeamTab({ agency, inviteHref, t }: { agency: Agency; inviteHref: string; t: Translate }) {
  const active = ACTIVE_AFFILIATES(agency).length;

  if (agency["affiliates"].length === 0) {
    return (
      <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
        <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
          <UserPlus size={22} />
        </span>
        <div className="flex max-w-[42ch] flex-col gap-1">
          <span className="text-foreground text-sm font-semibold">{t("team_empty_title")}</span>
          <span className="text-[12.5px] leading-[1.5] [text-wrap:pretty]">{t("team_empty_desc")}</span>
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
        <span className="text-muted-foreground text-[11.5px] tabular-nums">
          {t("team_count", { active, total: agency["affiliates"].length })}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {agency["affiliates"].map((aff) => (
          <ConsoleAffiliateRow key={aff["id"]} aff={aff} stateLabel={t(`state_${aff["state"]}`)} t={t} />
        ))}
      </div>
      <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-[11.5px] leading-[1.5]">
        <span className="text-muted-foreground/80 mt-px shrink-0">
          <ShieldCheck size={13} />
        </span>
        <span className="[text-wrap:pretty]">
          {t("team_note_prefix")} <strong className="text-foreground font-medium">{t("tab_access")}</strong>{" "}
          {t("team_note_suffix")}
        </span>
      </p>
    </section>
  );
}

function ConsoleAffiliateRow({ aff, stateLabel, t }: { aff: Affiliate; stateLabel: string; t: Translate }) {
  const dim = aff["state"] === "revoked" || aff["state"] === "rejected";
  let action: { tone: "danger" | "neutral"; label: string; icon: LucideIcon } | null = null;
  if (aff["state"] === "accepted") action = { tone: "danger", label: t("action_revoke"), icon: Ban };
  else if (aff["state"] === "pending") action = { tone: "neutral", label: t("action_resend"), icon: RefreshCw };
  else if (aff["state"] === "revoked") action = { tone: "neutral", label: t("action_reactivate"), icon: RefreshCw };

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
          "bg-muted text-foreground inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tracking-[-0.01em]",
          dim && "opacity-60",
        )}
      >
        {INITIALS_OF(aff["name"])}
      </span>
      <span className="flex min-w-0 flex-col gap-[1px]">
        <span
          className={cn(
            "overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium",
            dim ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {aff["name"]}
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[12px]">
          <span className="overflow-hidden text-ellipsis">{aff["email"]}</span>
          <span className="hidden shrink-0 opacity-40 @min-[768px]:inline">·</span>
          <span className="hidden shrink-0 overflow-hidden text-ellipsis @min-[768px]:inline">{aff["joinedMeta"]}</span>
        </span>
      </span>
      <AffiliationBadge state={aff["state"]} label={stateLabel} />
      {action ? (
        <button
          type="button"
          className={cn(
            "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-[12.5px] font-medium transition-colors",
            "bg-background border-border",
            action.tone === "danger"
              ? "text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/[0.05]"
              : "text-foreground hover:bg-accent",
          )}
        >
          <action.icon size={13.5} /> <span className="hidden @min-[768px]:inline">{action.label}</span>
        </button>
      ) : (
        <span className="text-muted-foreground/70 hidden shrink-0 pr-1 text-[11.5px] italic @min-[768px]:inline">
          {t("action_declined")}
        </span>
      )}
    </div>
  );
}

// ── Access tab (read-only) ──────────────────────────────────────────────────

function ConsoleAccessTab({ global, items, t }: { global: boolean; items: AccessibleOrg[]; t: Translate }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="border-border bg-muted/40 flex items-start gap-2.5 rounded-md border px-3.5 py-3">
        <span className="text-muted-foreground mt-px shrink-0">
          <Eye size={15} />
        </span>
        <span className="text-muted-foreground text-[12px] leading-[1.5] [text-wrap:pretty]">{t("access_banner")}</span>
      </div>

      {global ? (
        <section className="flex flex-col gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("access_scope")}
          </span>
          <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-500/[0.06] px-3.5 py-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <Globe size={17} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-[13.5px] font-semibold">{t("access_global_title")}</span>
                <span className="text-muted-foreground/80 font-mono text-[10.5px]">org = NULL</span>
              </div>
              <span className="text-muted-foreground text-[12px] leading-[1.45] [text-wrap:pretty]">
                {t("access_global_desc")}
              </span>
              <div className="mt-0.5">
                <GrantPill slug={AGENCY_WILDCARD} implicit={false} label={t("perm_wildcard")} />
              </div>
            </div>
          </div>
        </section>
      ) : items.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
            <Building2 size={22} />
          </span>
          <div className="flex max-w-[42ch] flex-col gap-1">
            <span className="text-foreground text-sm font-semibold">{t("access_empty_title")}</span>
            <span className="text-[12.5px] leading-[1.5] [text-wrap:pretty]">{t("access_empty_desc")}</span>
          </div>
        </div>
      ) : (
        <section className="flex flex-col gap-2.5">
          <div className="flex min-h-7 items-center justify-between gap-2.5">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
              {t("access_group")}
            </span>
            <span className="text-muted-foreground text-[11.5px] tabular-nums">{items.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ConsoleAccessCard key={item["org"]["id"]} item={item} t={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ConsoleAccessCard({ item, t }: { item: AccessibleOrg; t: Translate }) {
  const { org, slugs, implicit } = item;
  return (
    <div
      className="border-border bg-background grid items-start gap-3 rounded-lg border px-3.5 py-3"
      style={{ gridTemplateColumns: "36px 1fr" }}
    >
      <span className="bg-muted text-foreground border-border inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[12.5px] font-semibold">
        {INITIALS_OF(org["name"])}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-[13.5px] font-medium">{org["name"]}</span>
          <code className="text-muted-foreground/80 font-mono text-[10.5px]">{org["slug"]}</code>
          {implicit ? (
            <span className="border-border text-muted-foreground bg-muted/30 inline-flex items-center gap-1 rounded-md border border-dashed px-1.5 py-0.5 text-[10px] font-medium leading-none tracking-[0.02em]">
              <Link2 size={10} /> {t("inherited")}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {slugs.map((s) => (
            <GrantPill key={s} slug={s} implicit={implicit} label={PERM_LABEL(s, t)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Profile tab (editable) ──────────────────────────────────────────────────

function ConsoleProfileTab({ agency, t }: { agency: Agency; t: Translate }) {
  const [name, setName] = useState(agency["name"]);
  const [kind, setKind] = useState<AgencyKind>(agency["kind"]);

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-4">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
          {t("profile_group")}
        </span>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cn-name">{t("profile_name")}</Label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Briefcase size={16} />
            </span>
            <Input id="cn-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cn-slug">{t("profile_slug")}</Label>
          <div className="border-input bg-muted/30 flex items-stretch overflow-hidden rounded-md border opacity-90">
            <span className="text-muted-foreground bg-muted/50 border-border inline-flex items-center whitespace-nowrap border-r pl-3 pr-1.5 font-mono text-[13px]">
              app.humane.cl/a/
            </span>
            <input
              id="cn-slug"
              type="text"
              value={agency["slug"]}
              readOnly
              className="text-muted-foreground h-10 min-w-0 flex-1 cursor-not-allowed bg-transparent px-2.5 font-mono text-sm outline-none"
            />
          </div>
          <p className="text-muted-foreground text-xs leading-[1.5]">{t("profile_slug_hint")}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cn-blurb">{t("profile_blurb")}</Label>
          <Textarea id="cn-blurb" rows={3} defaultValue={agency["blurb"]} className="resize-none leading-[1.5]" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-foreground text-sm font-medium">{t("kind_label")}</span>
          <div className="grid grid-cols-1 gap-2 @min-[520px]:grid-cols-2">
            {KIND_ORDER.map((value) => (
              <KindOption
                key={value}
                kind={value}
                label={t(`kind_${value}`)}
                desc={t(`kind_${value}_desc`)}
                selected={value === kind}
                onSelect={() => setKind(value)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-0.5">
          <Button className="h-9">
            <Check size={16} /> {t("profile_save")}
          </Button>
          <Button variant="outline" className="h-9">
            {t("profile_discard")}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
          {t("danger_group")}
        </span>
        <div className="border-destructive/30 bg-destructive/[0.04] flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-foreground text-[13.5px] font-medium">{t("danger_title")}</span>
            <span className="text-muted-foreground text-[12px] leading-[1.45] [text-wrap:pretty]">
              {t("danger_desc")}
            </span>
          </div>
          <button
            type="button"
            className="border-destructive/40 text-destructive bg-background hover:bg-destructive/[0.06] inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3.5 text-[13px] font-medium transition-colors"
          >
            <Trash2 size={15} /> {t("danger_delete")}
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Inline atoms (scoped to this surface to honor the file-list constraint) ──

function AgencyTile({ kind, size = 40 }: { kind: AgencyKind; size?: number }) {
  const Icon = KIND_ICON[kind];
  const internal = kind === "internal";
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border",
        internal
          ? "border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted text-foreground",
      )}
    >
      <Icon size={Math.round(size * 0.46)} />
    </span>
  );
}

function AffiliationBadge({ state, label }: { state: AffiliationState; label: string }) {
  const base =
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium leading-[1.2] tracking-[0.01em]";
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
      <span className={cn(base, "border-destructive/35 text-destructive bg-destructive/[0.06] border")}>
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

function GrantPill({ slug, implicit, label }: { slug: string; implicit: boolean; label: string }) {
  const isWild = slug === AGENCY_WILDCARD;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium leading-[1.3]",
        isWild
          ? "border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : implicit
            ? "border-border text-muted-foreground bg-muted/30 border border-dashed"
            : "border-border text-foreground bg-background border",
      )}
    >
      {isWild ? <Globe size={10.5} /> : null}
      {label}
    </span>
  );
}

function KindOption({
  kind,
  label,
  desc,
  selected,
  onSelect,
}: {
  kind: AgencyKind;
  label: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex w-full items-start gap-3 text-left",
        "bg-background rounded-lg border px-3.5 py-3",
        "cursor-pointer transition-[border-color,background,box-shadow] duration-100",
        "focus-visible:border-ring focus-visible:ring-ring/40 outline-none focus-visible:ring-[3px]",
        selected
          ? "border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary))]"
          : "border-border hover:border-foreground/25 hover:bg-accent/40",
      )}
    >
      <AgencyTile kind={kind} size={38} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground text-[13.5px] font-semibold tracking-[-0.01em]">{label}</span>
        <span className="text-muted-foreground text-[12px] leading-[1.45] [text-wrap:pretty]">{desc}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
        )}
      >
        <Check size={12} strokeWidth={3} />
      </span>
    </button>
  );
}

function CONSOLE_HEAD(t: Translate): Record<ConsoleTab, { title: string; desc: string }> {
  return {
    team: { title: t("team_title"), desc: t("team_desc") },
    access: { title: t("access_title"), desc: t("access_desc") },
    profile: { title: t("profile_title"), desc: t("profile_desc") },
  };
}

function PERM_LABEL(slug: string, t: Translate): string {
  if (slug === AGENCY_WILDCARD) return t("perm_wildcard");
  if (slug === "payroll_view") return t("perm_payroll_view");
  if (slug === "reports_view") return t("perm_reports_view");
  if (slug === "documents_view") return t("perm_documents_view");
  if (slug === "members_view") return t("perm_members_view");
  if (slug === "compliance_view") return t("perm_compliance_view");
  if (slug === "audit_export") return t("perm_audit_export");
  return slug;
}

const LOCALE_ES = {
  page_title: "Consola de agencia",
  topbar_console: "Consola de agencia",
  topbar_admin: "Admin de agencia",
  tabs_aria: "Secciones de la agencia",
  tab_team: "Equipo",
  tab_access: "Accesos",
  tab_profile: "Perfil",
  invite: "Afiliar persona",
  team_title: "Equipo de la agencia",
  team_desc: "Las personas de tu firma que llevan la agencia. Invítalas, reenvía o revoca su acceso.",
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
    "Solo tú gestionas a tu equipo. Cada afiliado lleva la agencia en su sesión y hereda los accesos de la pestaña",
  team_note_suffix: "— nunca puede escribir.",
  team_empty_title: "Aún no afilias a nadie",
  team_empty_desc:
    "Invita a las personas de tu firma por correo. Cuando acepten, se unen a la agencia y heredan sus accesos de solo lectura.",
  state_accepted: "Activo",
  state_pending: "Pendiente",
  state_revoked: "Revocado",
  state_rejected: "Rechazado",
  action_revoke: "Revocar",
  action_resend: "Reenviar",
  action_reactivate: "Reactivar",
  action_declined: "declinó",
  access_banner:
    "No puedes cambiar estos accesos desde aquí. Cada organización decide qué te comparte — si necesitas más, pídeselo a su administrador. Todo lo que ves es de solo lectura.",
  access_scope: "Alcance",
  access_global_title: "Todas las organizaciones",
  access_global_desc:
    "Como equipo interno, tienes acceso global de solo lectura a todos los tenants y organizaciones — actuales y futuros.",
  access_empty_title: "Ninguna organización te dio acceso",
  access_empty_desc:
    "Cuando el administrador de una organización habilite a tu agencia, aparecerá aquí con los permisos de lectura que te otorgue.",
  access_group: "Organizaciones que te dieron acceso",
  inherited: "Heredado",
  kind_label: "Tipo de agencia",
  kind_audit: "Auditoría",
  kind_audit_desc: "Firmas que revisan finanzas y remuneraciones.",
  kind_government: "Fiscalización",
  kind_government_desc: "Entes reguladores con acceso de cumplimiento.",
  kind_accounting: "Contable",
  kind_accounting_desc: "Estudios que llevan la contabilidad de clientes.",
  kind_internal: "Interna",
  kind_internal_desc: "Equipo interno con alcance global de soporte.",
  profile_group: "Perfil de la agencia",
  profile_name: "Nombre",
  profile_slug: "Identificador",
  profile_slug_hint: "El identificador es permanente. Escríbenos si necesitas cambiarlo.",
  profile_blurb: "Descripción",
  profile_save: "Guardar cambios",
  profile_discard: "Descartar",
  danger_group: "Zona de peligro",
  danger_title: "Eliminar agencia",
  danger_desc: "Se revocan todos los accesos y se desafilia al equipo. No se puede deshacer.",
  danger_delete: "Eliminar",
  perm_wildcard: "Acceso global",
  perm_payroll_view: "Ver remuneraciones",
  perm_reports_view: "Ver reportes",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver miembros",
  perm_compliance_view: "Ver cumplimiento",
  perm_audit_export: "Exportar auditoría",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Agency console",
  topbar_console: "Agency console",
  topbar_admin: "Agency admin",
  tabs_aria: "Agency sections",
  tab_team: "Team",
  tab_access: "Access",
  tab_profile: "Profile",
  invite: "Affiliate a person",
  team_title: "Agency team",
  team_desc: "The people from your firm who carry the agency. Invite them, resend or revoke their access.",
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
    "Only you manage your team. Each affiliate carries the agency in their session and inherits the access from the",
  team_note_suffix: "tab — can never write.",
  team_empty_title: "You haven't affiliated anyone yet",
  team_empty_desc:
    "Invite the people from your firm by email. When they accept, they join the agency and inherit its read-only access.",
  state_accepted: "Active",
  state_pending: "Pending",
  state_revoked: "Revoked",
  state_rejected: "Rejected",
  action_revoke: "Revoke",
  action_resend: "Resend",
  action_reactivate: "Reactivate",
  action_declined: "declined",
  access_banner:
    "You can't change this access here. Each organization decides what to share with you — if you need more, ask its admin. Everything you see is read-only.",
  access_scope: "Scope",
  access_global_title: "All organizations",
  access_global_desc:
    "As an internal team, you have global read-only access to every tenant and organization — current and future.",
  access_empty_title: "No organization gave you access",
  access_empty_desc:
    "When an organization's admin enables your agency, it will appear here with the read permissions they grant you.",
  access_group: "Organizations that gave you access",
  inherited: "Inherited",
  kind_label: "Agency type",
  kind_audit: "Audit",
  kind_audit_desc: "Firms that review finances and payroll.",
  kind_government: "Regulator",
  kind_government_desc: "Regulatory bodies with compliance access.",
  kind_accounting: "Accounting",
  kind_accounting_desc: "Practices that keep clients' books.",
  kind_internal: "Internal",
  kind_internal_desc: "Internal team with global support scope.",
  profile_group: "Agency profile",
  profile_name: "Name",
  profile_slug: "Identifier",
  profile_slug_hint: "The identifier is permanent. Write to us if you need to change it.",
  profile_blurb: "Description",
  profile_save: "Save changes",
  profile_discard: "Discard",
  danger_group: "Danger zone",
  danger_title: "Delete agency",
  danger_desc: "All access is revoked and the team is unaffiliated. This can't be undone.",
  danger_delete: "Delete",
  perm_wildcard: "Global access",
  perm_payroll_view: "View payroll",
  perm_reports_view: "View reports",
  perm_documents_view: "View documents",
  perm_members_view: "View members",
  perm_compliance_view: "View compliance",
  perm_audit_export: "Export audit",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Console da agência",
  topbar_console: "Console da agência",
  topbar_admin: "Admin da agência",
  tabs_aria: "Seções da agência",
  tab_team: "Equipe",
  tab_access: "Acessos",
  tab_profile: "Perfil",
  invite: "Afiliar uma pessoa",
  team_title: "Equipe da agência",
  team_desc: "As pessoas da sua firma que carregam a agência. Convide-as, reenvie ou revogue o acesso.",
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
  team_note_prefix: "Só você gerencia sua equipe. Cada afiliado carrega a agência na sessão e herda os acessos da aba",
  team_note_suffix: "— nunca pode escrever.",
  team_empty_title: "Você ainda não afiliou ninguém",
  team_empty_desc:
    "Convide as pessoas da sua firma por e-mail. Quando aceitarem, entram na agência e herdam seus acessos somente leitura.",
  state_accepted: "Ativo",
  state_pending: "Pendente",
  state_revoked: "Revogado",
  state_rejected: "Rejeitado",
  action_revoke: "Revogar",
  action_resend: "Reenviar",
  action_reactivate: "Reativar",
  action_declined: "recusou",
  access_banner:
    "Você não pode alterar esses acessos aqui. Cada organização decide o que compartilhar com você — se precisar de mais, peça ao administrador dela. Tudo o que você vê é somente leitura.",
  access_scope: "Alcance",
  access_global_title: "Todas as organizações",
  access_global_desc:
    "Como equipe interna, você tem acesso global somente leitura a todos os tenants e organizações — atuais e futuros.",
  access_empty_title: "Nenhuma organização lhe deu acesso",
  access_empty_desc:
    "Quando o administrador de uma organização habilitar sua agência, ela aparecerá aqui com as permissões de leitura concedidas.",
  access_group: "Organizações que lhe deram acesso",
  inherited: "Herdado",
  kind_label: "Tipo de agência",
  kind_audit: "Auditoria",
  kind_audit_desc: "Firmas que revisam finanças e remunerações.",
  kind_government: "Fiscalização",
  kind_government_desc: "Órgãos reguladores com acesso de conformidade.",
  kind_accounting: "Contábil",
  kind_accounting_desc: "Escritórios que cuidam da contabilidade de clientes.",
  kind_internal: "Interna",
  kind_internal_desc: "Equipe interna com alcance global de suporte.",
  profile_group: "Perfil da agência",
  profile_name: "Nome",
  profile_slug: "Identificador",
  profile_slug_hint: "O identificador é permanente. Escreva para nós se precisar alterá-lo.",
  profile_blurb: "Descrição",
  profile_save: "Salvar alterações",
  profile_discard: "Descartar",
  danger_group: "Zona de perigo",
  danger_title: "Excluir agência",
  danger_desc: "Todos os acessos são revogados e a equipe é desafiliada. Não pode ser desfeito.",
  danger_delete: "Excluir",
  perm_wildcard: "Acesso global",
  perm_payroll_view: "Ver remunerações",
  perm_reports_view: "Ver relatórios",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver membros",
  perm_compliance_view: "Ver conformidade",
  perm_audit_export: "Exportar auditoria",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
