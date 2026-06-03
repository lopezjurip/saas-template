"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  Briefcase,
  Building2,
  ChevronRight,
  Eye,
  Globe,
  Landmark,
  LayoutGrid,
  LifeBuoy,
  List,
  type LucideIcon,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import {
  ACTIVE_AFFILIATES,
  AGENCIES,
  type Agency,
  type AgencyKind,
  IS_GLOBAL_AGENCY,
  SCOPED_ORG_COUNT,
} from "~/lib/agencies-mock";

type AgencyDirLayout = "rows" | "cards";

const KIND_ICON: Record<AgencyKind, LucideIcon> = /*#__PURE__*/ {
  audit: Briefcase,
  government: Landmark,
  internal: LifeBuoy,
  accounting: Building2,
};

export function AgencyDirectory({ base }: { base: string }) {
  const { t } = useRosetta(LOCALES);
  const [layout, setLayout] = useState<AgencyDirLayout>("rows");

  return (
    <div className="@container mx-auto flex w-full max-w-4xl flex-col gap-7 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-[22px] font-semibold tracking-[-0.02em]">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[68ch] text-[13.5px] leading-[1.55] [text-wrap:pretty]">
            {t("subtitle")}
          </p>
        </div>
        <Button size="sm" className="h-9">
          <Plus size={15} strokeWidth={2} /> {t("new_agency")}
        </Button>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("group_all")}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground text-[11.5px] tabular-nums">{AGENCIES.length}</span>
            <LayoutToggle
              value={layout}
              onChange={setLayout}
              rowsLabel={t("layout_rows")}
              cardsLabel={t("layout_cards")}
            />
          </div>
        </div>

        {layout === "cards" ? (
          <div className="grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2">
            {AGENCIES.map((agency) => (
              <AgencyDirCard
                key={agency.id}
                agency={agency}
                href={`${base}/${agency.slug}`}
                kindLabel={t(`kind_${agency.kind}`)}
                scopeLabel={SCOPE_LABEL(agency, t)}
                activeLabel={t("active", { count: ACTIVE_AFFILIATES(agency).length })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {AGENCIES.map((agency) => (
              <AgencyDirRow
                key={agency.id}
                agency={agency}
                href={`${base}/${agency.slug}`}
                kindLabel={t(`kind_${agency.kind}`)}
                scopeLabel={SCOPE_LABEL(agency, t)}
                activeLabel={t("active", { count: ACTIVE_AFFILIATES(agency).length })}
              />
            ))}
          </div>
        )}

        <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-[11.5px] leading-[1.5]">
          <span className="text-muted-foreground/80 mt-px shrink-0">
            <Eye size={13} />
          </span>
          <span className="[text-wrap:pretty]">{t("read_only_note")}</span>
        </p>
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

function ScopeBadge({ agency, label }: { agency: Agency; label: string }) {
  const global = IS_GLOBAL_AGENCY(agency);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium leading-[1.2] tracking-[0.01em]",
        global
          ? "border border-emerald-600/30 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-300"
          : "border-border text-foreground bg-background border tabular-nums",
      )}
    >
      {global ? <Globe size={11} strokeWidth={2.25} /> : null}
      {label}
    </span>
  );
}

function AgencyDirRow({
  agency,
  href,
  kindLabel,
  scopeLabel,
  activeLabel,
}: {
  agency: Agency;
  href: string;
  kindLabel: string;
  scopeLabel: string;
  activeLabel: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group grid w-full items-center gap-3.5 text-left",
        "border-border bg-background rounded-md border px-3.5 py-3",
        "transition-[background,border-color] duration-100",
        "hover:bg-accent/60 hover:border-foreground/25",
        "focus-visible:border-ring focus-visible:ring-ring/40 outline-none focus-visible:ring-[3px]",
      )}
      style={{ gridTemplateColumns: "40px 1fr auto auto" }}
    >
      <AgencyTile kind={agency.kind} />
      <span className="flex min-w-0 flex-col gap-[2px]">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
            {agency.name}
          </span>
          <code className="text-muted-foreground/80 hidden truncate font-mono text-[10.5px] @min-[640px]:inline">
            {agency.slug}
          </code>
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 whitespace-nowrap text-[12px]">
          <span>{kindLabel}</span>
          <span className="opacity-40">·</span>
          <span className="tabular-nums">{activeLabel}</span>
        </span>
      </span>
      <ScopeBadge agency={agency} label={scopeLabel} />
      <span className="text-muted-foreground/70 group-hover:text-foreground shrink-0 transition-colors">
        <ChevronRight size={16} />
      </span>
    </Link>
  );
}

function AgencyDirCard({
  agency,
  href,
  kindLabel,
  scopeLabel,
  activeLabel,
}: {
  agency: Agency;
  href: string;
  kindLabel: string;
  scopeLabel: string;
  activeLabel: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col gap-3 text-left",
        "border-border bg-background rounded-xl border p-4",
        "transition-[background,border-color,box-shadow] duration-100",
        "hover:border-foreground/25 hover:shadow-[0_1px_3px_hsl(0_0%_0%/0.04),0_8px_24px_hsl(0_0%_0%/0.06)]",
        "focus-visible:border-ring focus-visible:ring-ring/40 outline-none focus-visible:ring-[3px]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <AgencyTile kind={agency.kind} size={44} />
        <ScopeBadge agency={agency} label={scopeLabel} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-foreground truncate text-[14.5px] font-semibold tracking-[-0.01em]">{agency.name}</span>
        <span className="text-muted-foreground line-clamp-2 text-[12px] leading-[1.45] [text-wrap:pretty]">
          {agency.blurb}
        </span>
      </div>
      <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 pt-1 text-[11.5px]">
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} /> {activeLabel}
        </span>
        <span className="text-muted-foreground/70 group-hover:text-foreground inline-flex items-center gap-1 transition-colors">
          {kindLabel} <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function LayoutToggle({
  value,
  onChange,
  rowsLabel,
  cardsLabel,
}: {
  value: AgencyDirLayout;
  onChange: (value: AgencyDirLayout) => void;
  rowsLabel: string;
  cardsLabel: string;
}) {
  return (
    <div className="border-border bg-muted/40 inline-flex items-center gap-0.5 rounded-lg border p-0.5">
      <button
        type="button"
        aria-pressed={value === "rows"}
        aria-label={rowsLabel}
        onClick={() => onChange("rows")}
        className={cn(
          "inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2 transition-colors",
          value === "rows" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List size={15} />
      </button>
      <button
        type="button"
        aria-pressed={value === "cards"}
        aria-label={cardsLabel}
        onClick={() => onChange("cards")}
        className={cn(
          "inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2 transition-colors",
          value === "cards" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid size={15} />
      </button>
    </div>
  );
}

function SCOPE_LABEL(agency: Agency, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string {
  if (IS_GLOBAL_AGENCY(agency)) return t("scope_global");
  return t("scope_orgs", { count: SCOPED_ORG_COUNT(agency) });
}

const LOCALE_ES = {
  eyebrow: "Humane · Administración de plataforma",
  title: "Agencias",
  subtitle:
    "Grupos de personas externas con acceso de solo lectura entre organizaciones — auditores, fiscalizadores y el equipo interno de soporte. Cada agencia tiene sus afiliados y los accesos que se le otorgan por organización.",
  new_agency: "Nueva agencia",
  group_all: "Todas las agencias",
  layout_rows: "Ver como filas",
  layout_cards: "Ver como tarjetas",
  active: "{{count}} activos",
  scope_global: "Acceso global",
  scope_orgs: "{{count}} organizaciones",
  kind_audit: "Auditoría",
  kind_government: "Fiscalización",
  kind_internal: "Interna",
  kind_accounting: "Contable",
  read_only_note:
    "Las agencias nunca pueden escribir. Su acceso es de solo lectura, sin importar los permisos que se les otorguen.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Humane · Platform administration",
  title: "Agencies",
  subtitle:
    "Platform-level groups of external people with read-only access across organizations — auditors, regulators and the internal support team. Each agency has its affiliates and the access it is granted per organization.",
  new_agency: "New agency",
  group_all: "All agencies",
  layout_rows: "View as rows",
  layout_cards: "View as cards",
  active: "{{count}} active",
  scope_global: "Global access",
  scope_orgs: "{{count}} organizations",
  kind_audit: "Audit",
  kind_government: "Regulator",
  kind_internal: "Internal",
  kind_accounting: "Accounting",
  read_only_note: "Agencies can never write. Their access is read-only, no matter which permissions they are granted.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Humane · Administração da plataforma",
  title: "Agências",
  subtitle:
    "Grupos de pessoas externas com acesso somente leitura entre organizações — auditores, fiscais e a equipe interna de suporte. Cada agência tem seus afiliados e os acessos concedidos por organização.",
  new_agency: "Nova agência",
  group_all: "Todas as agências",
  layout_rows: "Ver como linhas",
  layout_cards: "Ver como cartões",
  active: "{{count}} ativos",
  scope_global: "Acesso global",
  scope_orgs: "{{count}} organizações",
  kind_audit: "Auditoria",
  kind_government: "Fiscalização",
  kind_internal: "Interna",
  kind_accounting: "Contábil",
  read_only_note:
    "As agências nunca podem escrever. Seu acesso é somente leitura, independentemente das permissões concedidas.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
