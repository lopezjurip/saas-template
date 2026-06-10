import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Globe,
  Hourglass,
  Landmark,
  LifeBuoy,
  Link2,
  type LucideIcon,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ACTIVE_AFFILIATES,
  type Affiliate,
  type AffiliationState,
  AGENCY_BY_SLUG,
  AGENCY_WILDCARD,
  type AgencyKind,
  type Grant,
  INITIALS_OF,
  IS_GLOBAL_AGENCY,
  ORG_BY_ID,
  SCOPED_ORG_COUNT,
} from "~/lib/agencies-mock";
import { getRosetta } from "~/hooks/get-rosetta";
import { ROSETTA } from "~/lib/i18n";
import { assertLocale } from "~/lib/i18n.server";

const KIND_ICON: Record<AgencyKind, LucideIcon> = /*#__PURE__*/ {
  audit: Briefcase,
  government: Landmark,
  internal: LifeBuoy,
  accounting: Building2,
};

export async function generateMetadata(props: PageProps<"/[locale]/admin/agencies/[slug]">): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const agency = AGENCY_BY_SLUG(slug);
  return { title: agency ? agency.name : t("page_title") };
}

export default async function AdminAgencyDetailPage(props: PageProps<"/[locale]/admin/agencies/[slug]">) {
  const { locale, slug } = await props.params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);

  const agency = AGENCY_BY_SLUG(slug);
  if (!agency) notFound();

  const Icon = KIND_ICON[agency.kind];
  const internal = agency.kind === "internal";
  const active = ACTIVE_AFFILIATES(agency).length;
  const global = IS_GLOBAL_AGENCY(agency);
  const base = `/${locale}/admin/agencies`;

  return (
    <div className="@container mx-auto flex w-full max-w-3xl flex-col gap-7 px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2">
          <Link href={base}>← {t("back")}</Link>
        </Button>
        <Button asChild size="sm" className="h-9">
          <Link href={`${base}/${agency.slug}/affiliates/new`}>
            <UserPlus size={15} strokeWidth={2} /> {t("invite")}
          </Link>
        </Button>
      </div>

      <header className="flex flex-col gap-3">
        <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
          {t("eyebrow")}
        </span>
        <div className="flex items-start gap-3.5">
          <span
            style={{ width: 48, height: 48 }}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg border",
              internal
                ? "border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-muted text-foreground",
            )}
          >
            <Icon size={22} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-foreground m-0 text-[20px] font-semibold tracking-[-0.02em]">{agency.name}</h1>
              <ScopeBadge
                global={global}
                label={global ? t("scope_global") : t("scope_orgs", { count: SCOPED_ORG_COUNT(agency) })}
              />
            </div>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[12.5px]">
              <code className="font-mono text-[11px]">{agency.slug}</code>
              <span className="opacity-40">·</span>
              <span>{t(`kind_${agency.kind}`)}</span>
            </span>
          </div>
        </div>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-[13.5px] leading-[1.55] [text-wrap:pretty]">
          {agency.blurb}
        </p>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("affiliates")}
          </span>
          <span className="text-muted-foreground text-[11.5px] tabular-nums">
            {t("affiliates_count", { active, total: agency.affiliates.length })}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {agency.affiliates.map((aff) => (
            <AffiliateRow key={aff.id} aff={aff} stateLabel={t(`state_${aff.state}`)} />
          ))}
        </div>
        <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-[11.5px] leading-[1.5]">
          <span className="text-muted-foreground/80 mt-px shrink-0">
            <ShieldCheck size={13} />
          </span>
          <span className="[text-wrap:pretty]">{t("affiliates_note")}</span>
        </p>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">{t("grants")}</span>
          {!global ? (
            <span className="text-muted-foreground text-[11.5px] tabular-nums">
              {t("scope_orgs", { count: SCOPED_ORG_COUNT(agency) })}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          {agency.grants.map((grant, i) => (
            <GrantOrgCard
              key={grant.orgId ?? `global-${i}`}
              grant={grant}
              globalTitle={t("global_title")}
              globalDesc={t("global_desc")}
              implicitLabel={t("grant_implicit")}
              explicitLabel={t("grant_explicit")}
              permLabel={(slug) => PERM_LABEL(slug, t)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Inline atoms (scoped to this surface to honor the file-list constraint) ──

function ScopeBadge({ global, label }: { global: boolean; label: string }) {
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

function AffiliateRow({ aff, stateLabel }: { aff: Affiliate; stateLabel: string }) {
  const dim = aff.state === "revoked" || aff.state === "rejected";
  return (
    <div
      className={cn(
        "border-border grid w-full items-center gap-3 rounded-md border px-3.5 py-2.5",
        dim ? "bg-muted/30" : "bg-background",
      )}
      style={{ gridTemplateColumns: "34px 1fr auto" }}
    >
      <span
        className={cn(
          "bg-muted text-foreground inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tracking-[-0.01em]",
          dim && "opacity-60",
        )}
      >
        {INITIALS_OF(aff.name)}
      </span>
      <span className="flex min-w-0 flex-col gap-[1px]">
        <span
          className={cn(
            "overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium",
            dim ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {aff.name}
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[12px]">
          <span className="overflow-hidden text-ellipsis">{aff.email}</span>
          <span className="hidden shrink-0 opacity-40 @min-[640px]:inline">·</span>
          <span className="hidden shrink-0 overflow-hidden text-ellipsis @min-[640px]:inline">{aff.role}</span>
        </span>
      </span>
      <AffiliationBadge state={aff.state} label={stateLabel} />
    </div>
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

function GrantOrgCard({
  grant,
  globalTitle,
  globalDesc,
  implicitLabel,
  explicitLabel,
  permLabel,
}: {
  grant: Grant;
  globalTitle: string;
  globalDesc: string;
  implicitLabel: string;
  explicitLabel: string;
  permLabel: (slug: string) => string;
}) {
  if (grant.orgId === null) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-500/[0.06] px-3.5 py-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <Globe size={17} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground text-[13.5px] font-semibold">{globalTitle}</span>
            <span className="text-muted-foreground/80 font-mono text-[10.5px]">org = NULL</span>
          </div>
          <span className="text-muted-foreground text-[12px] leading-[1.45] [text-wrap:pretty]">{globalDesc}</span>
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {grant.slugs.map((s) => (
              <GrantPill key={s} slug={s} implicit={false} label={permLabel(s)} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  const org = ORG_BY_ID(grant.orgId);
  const orgName = org?.name ?? grant.orgId;
  return (
    <div
      className="border-border bg-background grid items-start gap-3 rounded-lg border px-3.5 py-3"
      style={{ gridTemplateColumns: "36px 1fr" }}
    >
      <span className="bg-muted text-foreground border-border inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[12.5px] font-semibold">
        {INITIALS_OF(orgName)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-[13.5px] font-medium">{orgName}</span>
          {grant.kind === "implicit" ? (
            <span className="border-border text-muted-foreground bg-muted/30 inline-flex items-center gap-1 rounded-md border border-dashed px-1.5 py-0.5 text-[10px] font-medium leading-none tracking-[0.02em]">
              <Link2 size={10} /> {implicitLabel}
            </span>
          ) : (
            <span className="border-border text-muted-foreground bg-muted/40 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none tracking-[0.02em]">
              {explicitLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {grant.slugs.map((s) => (
            <GrantPill key={s} slug={s} implicit={grant.kind === "implicit"} label={permLabel(s)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PERM_LABEL(slug: string, t: ReturnType<typeof ROSETTA<typeof LOCALE_ES>>["t"]): string {
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
  page_title: "Agencia",
  back: "Agencias",
  invite: "Afiliar persona",
  eyebrow: "SaaS Template · Agencia",
  scope_global: "Acceso global",
  scope_orgs: "{{count}} organizaciones",
  kind_audit: "Auditoría",
  kind_government: "Fiscalización",
  kind_internal: "Interna",
  kind_accounting: "Contable",
  affiliates: "Afiliados",
  affiliates_count: "{{active}} activos · {{total}} total",
  affiliates_note:
    "Los afiliados son personas externas, no miembros de ninguna organización. Su sesión lleva la agencia — heredan los accesos de abajo y nunca pueden escribir.",
  grants: "Accesos",
  global_title: "Todas las organizaciones",
  global_desc:
    "Acceso global de solo lectura a todos los tenants y organizaciones de la plataforma, actuales y futuros.",
  grant_implicit: "Heredado (opt-in)",
  grant_explicit: "Otorgado",
  state_accepted: "Activo",
  state_pending: "Pendiente",
  state_revoked: "Revocado",
  state_rejected: "Rechazado",
  perm_wildcard: "Acceso global",
  perm_payroll_view: "Ver remuneraciones",
  perm_reports_view: "Ver reportes",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver miembros",
  perm_compliance_view: "Ver cumplimiento",
  perm_audit_export: "Exportar auditoría",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Agency",
  back: "Agencies",
  invite: "Affiliate a person",
  eyebrow: "SaaS Template · Agency",
  scope_global: "Global access",
  scope_orgs: "{{count}} organizations",
  kind_audit: "Audit",
  kind_government: "Regulator",
  kind_internal: "Internal",
  kind_accounting: "Accounting",
  affiliates: "Affiliates",
  affiliates_count: "{{active}} active · {{total}} total",
  affiliates_note:
    "Affiliates are external people, not members of any organization. Their session carries the agency — they inherit the access below and can never write.",
  grants: "Access",
  global_title: "All organizations",
  global_desc: "Global read-only access to every tenant and organization on the platform, current and future.",
  grant_implicit: "Inherited (opt-in)",
  grant_explicit: "Granted",
  state_accepted: "Active",
  state_pending: "Pending",
  state_revoked: "Revoked",
  state_rejected: "Rejected",
  perm_wildcard: "Global access",
  perm_payroll_view: "View payroll",
  perm_reports_view: "View reports",
  perm_documents_view: "View documents",
  perm_members_view: "View members",
  perm_compliance_view: "View compliance",
  perm_audit_export: "Export audit",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Agência",
  back: "Agências",
  invite: "Afiliar uma pessoa",
  eyebrow: "SaaS Template · Agência",
  scope_global: "Acesso global",
  scope_orgs: "{{count}} organizações",
  kind_audit: "Auditoria",
  kind_government: "Fiscalização",
  kind_internal: "Interna",
  kind_accounting: "Contábil",
  affiliates: "Afiliados",
  affiliates_count: "{{active}} ativos · {{total}} total",
  affiliates_note:
    "Os afiliados são pessoas externas, não membros de nenhuma organização. Sua sessão carrega a agência — herdam os acessos abaixo e nunca podem escrever.",
  grants: "Acessos",
  global_title: "Todas as organizações",
  global_desc: "Acesso global somente leitura a todos os tenants e organizações da plataforma, atuais e futuros.",
  grant_implicit: "Herdado (opt-in)",
  grant_explicit: "Concedido",
  state_accepted: "Ativo",
  state_pending: "Pendente",
  state_revoked: "Revogado",
  state_rejected: "Rejeitado",
  perm_wildcard: "Acesso global",
  perm_payroll_view: "Ver remunerações",
  perm_reports_view: "Ver relatórios",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver membros",
  perm_compliance_view: "Ver conformidade",
  perm_audit_export: "Exportar auditoria",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
