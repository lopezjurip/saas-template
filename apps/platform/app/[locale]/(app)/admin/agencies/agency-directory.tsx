"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Building2, ChevronRight, Eye, Globe, LayoutGrid, List, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { type AppRoute, ROUTE } from "~/lib/route";

export type AgencyDirItem = {
  agency_id: string;
  agency_name: string;
  agency_slug: string;
  disabled: boolean;
  active_affiliates: number;
  is_global: boolean;
  org_count: number;
};

type AgencyDirLayout = "rows" | "cards";

export function AgencyDirectory({ locale, items }: { locale: string; items: AgencyDirItem[] }) {
  const { t } = useRosetta(LOCALES);
  const [layout, setLayout] = useState<AgencyDirLayout>("rows");
  const createHref = ROUTE("/[locale]/agencies/create", { locale });

  return (
    <div className="@container mx-auto flex w-full max-w-4xl flex-col gap-7 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-xl font-semibold tracking-[-0.02em]">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[68ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
        </div>
        <Button asChild size="sm" className="h-9">
          <Link href={createHref}>
            <Plus size={15} strokeWidth={2} /> {t("new_agency")}
          </Link>
        </Button>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("group_all")}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground text-xs tabular-nums">{items.length}</span>
            <LayoutToggle
              value={layout}
              onChange={setLayout}
              rowsLabel={t("layout_rows")}
              cardsLabel={t("layout_cards")}
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
            <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
              <Building2 size={22} />
            </span>
            <div className="flex max-w-[42ch] flex-col gap-1">
              <span className="text-foreground text-sm font-semibold">{t("empty_title")}</span>
              <span className="text-xs leading-normal text-pretty">{t("empty_desc")}</span>
            </div>
            <Button asChild size="sm" className="mt-1">
              <Link href={createHref}>
                <Plus size={14} strokeWidth={2} /> {t("new_agency")}
              </Link>
            </Button>
          </div>
        ) : layout === "cards" ? (
          <div className="grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2">
            {items.map((agency) => (
              <AgencyDirCard
                key={agency["agency_id"]}
                agency={agency}
                href={ROUTE("/[locale]/admin/agencies/[slug]", { locale, slug: agency["agency_slug"] })}
                scopeLabel={SCOPE_LABEL(agency, t)}
                activeLabel={t("active", { count: agency["active_affiliates"] })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((agency) => (
              <AgencyDirRow
                key={agency["agency_id"]}
                agency={agency}
                href={ROUTE("/[locale]/admin/agencies/[slug]", { locale, slug: agency["agency_slug"] })}
                scopeLabel={SCOPE_LABEL(agency, t)}
                activeLabel={t("active", { count: agency["active_affiliates"] })}
                disabledLabel={t("disabled")}
              />
            ))}
          </div>
        )}

        <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-xs leading-normal">
          <span className="text-muted-foreground/80 mt-px shrink-0">
            <Eye size={13} />
          </span>
          <span className="text-pretty">{t("read_only_note")}</span>
        </p>
      </section>
    </div>
  );
}

// ── Inline atoms (scoped to this surface to honor the file-list constraint) ──

function AgencyTile({ size = 40 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="border-border bg-muted text-foreground inline-flex shrink-0 items-center justify-center rounded-lg border"
    >
      <Building2 size={Math.round(size * 0.46)} />
    </span>
  );
}

function ScopeBadge({ global, label }: { global: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-tiny font-medium leading-[1.2] tracking-[0.01em]",
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
  scopeLabel,
  activeLabel,
  disabledLabel,
}: {
  agency: AgencyDirItem;
  href: AppRoute;
  scopeLabel: string;
  activeLabel: string;
  disabledLabel: string;
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
      <AgencyTile />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
            {agency["agency_name"]}
          </span>
          <code className="text-muted-foreground/80 hidden truncate font-mono text-tiny @min-[640px]:inline">
            {agency["agency_slug"]}
          </code>
          {agency["disabled"] ? (
            <span className="border-border text-muted-foreground bg-muted/50 inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-tiny font-medium leading-none tracking-[0.02em]">
              {disabledLabel}
            </span>
          ) : null}
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 whitespace-nowrap text-xs tabular-nums">
          {activeLabel}
        </span>
      </span>
      <ScopeBadge global={agency["is_global"]} label={scopeLabel} />
      <span className="text-muted-foreground/70 group-hover:text-foreground shrink-0 transition-colors">
        <ChevronRight size={16} />
      </span>
    </Link>
  );
}

function AgencyDirCard({
  agency,
  href,
  scopeLabel,
  activeLabel,
}: {
  agency: AgencyDirItem;
  href: AppRoute;
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
        <AgencyTile size={44} />
        <ScopeBadge global={agency["is_global"]} label={scopeLabel} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-foreground truncate text-sm font-semibold tracking-[-0.01em]">
          {agency["agency_name"]}
        </span>
        <code className="text-muted-foreground/80 truncate font-mono text-xs">{agency["agency_slug"]}</code>
      </div>
      <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 pt-1 text-xs">
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Users size={13} /> {activeLabel}
        </span>
        <span className="text-muted-foreground/70 group-hover:text-foreground inline-flex items-center gap-1 transition-colors">
          <ChevronRight size={14} />
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

function SCOPE_LABEL(agency: AgencyDirItem, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string {
  if (agency.is_global) return t("scope_global");
  return t("scope_orgs", { count: agency.org_count });
}

const LOCALE_ES = {
  eyebrow: "SaaS Template · Administración de plataforma",
  title: "Agencias",
  subtitle:
    "Grupos de personas externas con acceso de solo lectura entre organizaciones — auditores, fiscalizadores y el equipo interno de soporte. Cada agencia tiene sus afiliados y los accesos que se le otorgan por organización.",
  new_agency: "Nueva agencia",
  group_all: "Todas las agencias",
  layout_rows: "Ver como filas",
  layout_cards: "Ver como tarjetas",
  active: "{{count}} activos",
  disabled: "Deshabilitada",
  scope_global: "Acceso global",
  scope_orgs: "{{count}} organizaciones",
  empty_title: "Aún no hay agencias",
  empty_desc:
    "Crea la primera agencia para agrupar a personas externas con acceso de solo lectura entre organizaciones.",
  read_only_note:
    "Las agencias nunca pueden escribir. Su acceso es de solo lectura, sin importar los permisos que se les otorguen.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "SaaS Template · Platform administration",
  title: "Agencies",
  subtitle:
    "Platform-level groups of external people with read-only access across organizations — auditors, regulators and the internal support team. Each agency has its affiliates and the access it is granted per organization.",
  new_agency: "New agency",
  group_all: "All agencies",
  layout_rows: "View as rows",
  layout_cards: "View as cards",
  active: "{{count}} active",
  disabled: "Disabled",
  scope_global: "Global access",
  scope_orgs: "{{count}} organizations",
  empty_title: "No agencies yet",
  empty_desc: "Create the first agency to group external people with read-only access across organizations.",
  read_only_note: "Agencies can never write. Their access is read-only, no matter which permissions they are granted.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "SaaS Template · Administração da plataforma",
  title: "Agências",
  subtitle:
    "Grupos de pessoas externas com acesso somente leitura entre organizações — auditores, fiscais e a equipe interna de suporte. Cada agência tem seus afiliados e os acessos concedidos por organização.",
  new_agency: "Nova agência",
  group_all: "Todas as agências",
  layout_rows: "Ver como linhas",
  layout_cards: "Ver como cartões",
  active: "{{count}} ativos",
  disabled: "Desabilitada",
  scope_global: "Acesso global",
  scope_orgs: "{{count}} organizações",
  empty_title: "Ainda não há agências",
  empty_desc: "Crie a primeira agência para agrupar pessoas externas com acesso somente leitura entre organizações.",
  read_only_note:
    "As agências nunca podem escrever. Seu acesso é somente leitura, independentemente das permissões concedidas.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
