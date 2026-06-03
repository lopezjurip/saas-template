"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Clock,
  Eye,
  Globe,
  Landmark,
  LayoutGrid,
  LifeBuoy,
  List,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import {
  ACTIVE_AFFILIATES,
  type AccessibleOrg,
  AFFILIATE_ORGS,
  AGENCY_WILDCARD,
  type Agency,
  type AgencyKind,
  INITIALS_OF,
  IS_GLOBAL_AGENCY,
} from "~/lib/agencies-mock";

type DashLayout = "cards" | "list";

// Sample "last seen" strings — mock content, kept literal like the design.
const LAST_SEEN = /*#__PURE__*/ ["hace 2 h", "ayer", "hace 3 días", "hace 1 semana", "hace 2 semanas"];

const KIND_ICON: Record<AgencyKind, LucideIcon> = /*#__PURE__*/ {
  audit: Briefcase,
  government: Landmark,
  internal: LifeBuoy,
  accounting: Building2,
};

export function AffiliateDashboard({ agency }: { agency: Agency }) {
  const { t } = useRosetta(LOCALES);
  const [layout, setLayout] = useState<DashLayout>("cards");

  const items = AFFILIATE_ORGS(agency);
  const global = IS_GLOBAL_AGENCY(agency);

  return (
    <div className="@container bg-background relative flex min-h-svh w-full flex-col overflow-hidden">
      <PortalTopBar agency={agency} portalLabel={t("portal")} readOnlyLabel={t("read_only")} />

      <main className="min-w-0 flex-1 overflow-auto px-4 py-5 pb-8 @min-[768px]:px-6 @min-[768px]:py-7 @min-[768px]:pb-10">
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-foreground m-0 text-[20px] font-semibold tracking-[-0.02em]">
              {global ? t("title_global") : t("title")}
            </h1>
            <p className="text-muted-foreground m-0 max-w-[58ch] text-[13px] leading-[1.55] [text-wrap:pretty]">
              {global ? t("subtitle_global") : t("subtitle", { agency: agency.name })}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
              <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
                <Building2 size={22} />
              </span>
              <div className="flex max-w-[42ch] flex-col gap-1">
                <span className="text-foreground text-sm font-semibold">{t("empty_title")}</span>
                <span className="text-[12.5px] leading-[1.5] [text-wrap:pretty]">{t("empty_desc")}</span>
              </div>
            </div>
          ) : (
            <section className="flex flex-col gap-2.5">
              <div className="flex min-h-7 items-center justify-between gap-2.5">
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
                  {t("with_access")}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-muted-foreground text-[11.5px] tabular-nums">{items.length}</span>
                  <LayoutToggle
                    value={layout}
                    onChange={setLayout}
                    cardsLabel={t("layout_cards")}
                    listLabel={t("layout_list")}
                  />
                </div>
              </div>

              {layout === "cards" ? (
                <div className="grid grid-cols-1 gap-3 @min-[768px]:grid-cols-2">
                  {items.map((item) => (
                    <OrgAccessCard
                      key={item.org.id}
                      item={item}
                      membersLabel={t("members", { count: item.org.members })}
                      seenLabel={t("seen", { when: SEEN_FOR(item) })}
                      permLabel={(slug) => PERM_LABEL(slug, t)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <OrgAccessRow
                      key={item.org.id}
                      item={item}
                      metaLabel={t("row_meta", { count: item.org.members, when: SEEN_FOR(item) })}
                      openLabel={t("open")}
                      permLabel={(slug) => PERM_LABEL(slug, t)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Inline atoms (scoped to this surface to honor the file-list constraint) ──

function PortalTopBar({
  agency,
  portalLabel,
  readOnlyLabel,
}: {
  agency: Agency;
  portalLabel: string;
  readOnlyLabel: string;
}) {
  const me = ACTIVE_AFFILIATES(agency)[0];
  const Icon = KIND_ICON[agency.kind];
  const internal = agency.kind === "internal";
  return (
    <header className="border-border bg-background flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 @min-[768px]:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          style={{ width: 34, height: 34 }}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-lg border",
            internal
              ? "border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "border-border bg-muted text-foreground",
          )}
        >
          <Icon size={16} />
        </span>
        <div className="flex min-w-0 flex-col gap-[1px]">
          <span className="text-foreground truncate text-[13.5px] font-semibold tracking-[-0.01em]">{agency.name}</span>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
            <span className="hidden @min-[768px]:inline">{portalLabel}</span>
            <span className="hidden opacity-40 @min-[768px]:inline">·</span>
            <ReadOnlyBadge label={readOnlyLabel} />
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden flex-col items-end gap-[1px] @min-[768px]:flex">
          <span className="text-foreground text-[12.5px] font-medium leading-none">{me?.name}</span>
          <span className="text-muted-foreground mt-0.5 text-[11px] leading-none">{me?.role}</span>
        </span>
        <span className="bg-muted text-foreground inline-flex h-8 w-8 items-center justify-center rounded-full text-[11.5px] font-semibold">
          {INITIALS_OF(me?.name ?? "?")}
        </span>
      </div>
    </header>
  );
}

function ReadOnlyBadge({ label }: { label: string }) {
  return (
    <span className="text-muted-foreground bg-muted/60 border-border inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium leading-[1.2] tracking-[0.02em]">
      <Eye size={11} /> {label}
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

function OrgAccessCard({
  item,
  membersLabel,
  seenLabel,
  permLabel,
}: {
  item: AccessibleOrg;
  membersLabel: string;
  seenLabel: string;
  permLabel: (slug: string) => string;
}) {
  const { org, slugs, implicit } = item;
  const isWild = slugs.includes(AGENCY_WILDCARD);
  return (
    <button
      type="button"
      className={cn(
        "group flex h-full flex-col gap-3 text-left",
        "border-border bg-background rounded-xl border p-4",
        "cursor-pointer transition-[background,border-color,box-shadow] duration-100",
        "hover:border-foreground/25 hover:shadow-[0_1px_3px_hsl(0_0%_0%/0.04),0_8px_24px_hsl(0_0%_0%/0.06)]",
        "focus-visible:border-ring focus-visible:ring-ring/40 outline-none focus-visible:ring-[3px]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="bg-muted text-foreground border-border inline-flex h-11 w-11 items-center justify-center rounded-lg border text-[14px] font-semibold tracking-[-0.01em]">
          {INITIALS_OF(org.name)}
        </span>
        <span className="text-muted-foreground/50 group-hover:text-foreground mt-1 transition-colors">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-foreground truncate text-[14.5px] font-semibold tracking-[-0.01em]">{org.name}</span>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11.5px]">
          <code className="font-mono">{org.slug}</code>
          <span className="opacity-40">·</span>
          <span className="tabular-nums">{membersLabel}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {isWild ? (
          <GrantPill slug={AGENCY_WILDCARD} implicit={false} label={permLabel(AGENCY_WILDCARD)} />
        ) : (
          slugs.map((s) => <GrantPill key={s} slug={s} implicit={implicit} label={permLabel(s)} />)
        )}
      </div>
      <div className="text-muted-foreground mt-auto flex items-center gap-1.5 pt-1 text-[11px]">
        <Clock size={12} /> {seenLabel}
      </div>
    </button>
  );
}

function OrgAccessRow({
  item,
  metaLabel,
  openLabel,
  permLabel,
}: {
  item: AccessibleOrg;
  metaLabel: string;
  openLabel: string;
  permLabel: (slug: string) => string;
}) {
  const { org, slugs, implicit } = item;
  const isWild = slugs.includes(AGENCY_WILDCARD);
  return (
    <button
      type="button"
      className={cn(
        "group grid w-full items-center gap-3.5 text-left",
        "border-border bg-background rounded-md border px-3.5 py-3",
        "cursor-pointer transition-[background,border-color] duration-100",
        "hover:bg-accent/60 hover:border-foreground/25",
        "focus-visible:border-ring focus-visible:ring-ring/40 outline-none focus-visible:ring-[3px]",
      )}
      style={{ gridTemplateColumns: "40px 1fr auto" }}
    >
      <span className="bg-muted text-foreground border-border inline-flex h-10 w-10 items-center justify-center rounded-lg border text-[12.5px] font-semibold tracking-[-0.01em]">
        {INITIALS_OF(org.name)}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="text-foreground truncate text-sm font-medium">{org.name}</span>
          <span className="text-muted-foreground hidden whitespace-nowrap text-[11px] tabular-nums @min-[768px]:inline">
            {metaLabel}
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5">
          {isWild ? (
            <GrantPill slug={AGENCY_WILDCARD} implicit={false} label={permLabel(AGENCY_WILDCARD)} />
          ) : (
            slugs.map((s) => <GrantPill key={s} slug={s} implicit={implicit} label={permLabel(s)} />)
          )}
        </span>
      </span>
      <span className="text-muted-foreground/60 group-hover:text-foreground inline-flex shrink-0 items-center gap-1 text-[12px] transition-colors">
        <span className="hidden @min-[768px]:inline">{openLabel}</span> <ArrowUpRight size={15} />
      </span>
    </button>
  );
}

function LayoutToggle({
  value,
  onChange,
  cardsLabel,
  listLabel,
}: {
  value: DashLayout;
  onChange: (value: DashLayout) => void;
  cardsLabel: string;
  listLabel: string;
}) {
  return (
    <div className="border-border bg-muted/40 inline-flex items-center gap-0.5 rounded-lg border p-0.5">
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
      <button
        type="button"
        aria-pressed={value === "list"}
        aria-label={listLabel}
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2 transition-colors",
          value === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List size={15} />
      </button>
    </div>
  );
}

function SEEN_FOR(item: AccessibleOrg): string {
  return LAST_SEEN[item.org.members % LAST_SEEN.length] ?? LAST_SEEN[0] ?? "";
}

function PERM_LABEL(slug: string, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string {
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
  portal: "Portal de afiliados",
  read_only: "Solo lectura",
  title: "Tus organizaciones",
  title_global: "Todas las organizaciones",
  subtitle:
    "Estas son las organizaciones que te dieron acceso a través de {{agency}}. Entra a cada una para revisar sus datos — recuerda que tu acceso es de solo lectura.",
  subtitle_global:
    "Como equipo interno, tienes acceso global de solo lectura a cualquier organización de la plataforma.",
  with_access: "Con acceso",
  layout_cards: "Ver como tarjetas",
  layout_list: "Ver como lista",
  members: "{{count}} miembros",
  seen: "Visto {{when}}",
  row_meta: "{{count}} miembros · visto {{when}}",
  open: "Abrir",
  empty_title: "Sin organizaciones asignadas",
  empty_desc:
    "Todavía ninguna organización te ha dado acceso. Cuando un administrador habilite a tu agencia, sus datos aparecerán aquí.",
  perm_wildcard: "Acceso global",
  perm_payroll_view: "Ver remuneraciones",
  perm_reports_view: "Ver reportes",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver miembros",
  perm_compliance_view: "Ver cumplimiento",
  perm_audit_export: "Exportar auditoría",
};

const LOCALE_EN: typeof LOCALE_ES = {
  portal: "Affiliate portal",
  read_only: "Read only",
  title: "Your organizations",
  title_global: "All organizations",
  subtitle:
    "These are the organizations that gave you access through {{agency}}. Open each one to review its data — remember your access is read-only.",
  subtitle_global: "As an internal team, you have global read-only access to any organization on the platform.",
  with_access: "With access",
  layout_cards: "View as cards",
  layout_list: "View as list",
  members: "{{count}} members",
  seen: "Seen {{when}}",
  row_meta: "{{count}} members · seen {{when}}",
  open: "Open",
  empty_title: "No organizations assigned",
  empty_desc:
    "No organization has given you access yet. When an admin enables your agency, its data will show up here.",
  perm_wildcard: "Global access",
  perm_payroll_view: "View payroll",
  perm_reports_view: "View reports",
  perm_documents_view: "View documents",
  perm_members_view: "View members",
  perm_compliance_view: "View compliance",
  perm_audit_export: "Export audit",
};

const LOCALE_PT: typeof LOCALE_ES = {
  portal: "Portal de afiliados",
  read_only: "Somente leitura",
  title: "Suas organizações",
  title_global: "Todas as organizações",
  subtitle:
    "Estas são as organizações que lhe deram acesso através da {{agency}}. Entre em cada uma para revisar seus dados — lembre-se de que seu acesso é somente leitura.",
  subtitle_global: "Como equipe interna, você tem acesso global somente leitura a qualquer organização da plataforma.",
  with_access: "Com acesso",
  layout_cards: "Ver como cartões",
  layout_list: "Ver como lista",
  members: "{{count}} membros",
  seen: "Visto {{when}}",
  row_meta: "{{count}} membros · visto {{when}}",
  open: "Abrir",
  empty_title: "Sem organizações atribuídas",
  empty_desc:
    "Nenhuma organização lhe deu acesso ainda. Quando um administrador habilitar sua agência, os dados aparecerão aqui.",
  perm_wildcard: "Acesso global",
  perm_payroll_view: "Ver remunerações",
  perm_reports_view: "Ver relatórios",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver membros",
  perm_compliance_view: "Ver conformidade",
  perm_audit_export: "Exportar auditoria",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
