"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  Ban,
  Briefcase,
  Building2,
  Eye,
  Globe,
  Landmark,
  LifeBuoy,
  Lock,
  type LucideIcon,
  Plus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import {
  ACTIVE_AFFILIATES,
  AGENCIES_FOR_ORG,
  AGENCY_PERMISSIONS,
  AGENCY_WILDCARD,
  type Agency,
  type AgencyKind,
  type AgencyPermissionDef,
  type Grant,
} from "~/lib/agencies-mock";

// Permissions that auto-inherit by default in this mock (the design's "on" preset).
const DEFAULT_OPT_IN = /*#__PURE__*/ new Set<string>(["reports_view", "members_view"]);

const KIND_ICON: Record<AgencyKind, LucideIcon> = /*#__PURE__*/ {
  audit: Briefcase,
  government: Landmark,
  internal: LifeBuoy,
  accounting: Building2,
};

// The org this surface represents inside the mock graph (drives which agencies show).
const MOCK_ORG_ID = "org_acme";

export function ExternalAccess({ organizationName }: { organizationName: string }) {
  const { t } = useRosetta(LOCALES);
  const access = AGENCIES_FOR_ORG(MOCK_ORG_ID);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
            {organizationName} · {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-[22px] font-semibold tracking-[-0.02em]">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-[13.5px] leading-[1.55] [text-wrap:pretty]">
            {t("subtitle", { org: organizationName })}
          </p>
        </div>
        <Button size="sm" className="h-9">
          <Plus size={15} strokeWidth={2} /> {t("grant_access")}
        </Button>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("with_access")}
          </span>
          <span className="text-muted-foreground text-[11.5px] tabular-nums">{access.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          {access.map(({ agency, grant }) => (
            <AgencyAccessCard
              key={agency.id}
              agency={agency}
              grant={grant}
              orgName={organizationName}
              kindLabel={t(`kind_${agency.kind}`)}
              globalLabel={t("global_managed")}
              readersLabel={t("readers", { count: ACTIVE_AFFILIATES(agency).length, org: organizationName })}
              platformLabel={t("platform")}
              revokeLabel={t("revoke")}
              permLabel={(slug) => PERM_LABEL(slug, t)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">{t("opt_in")}</span>
          <p className="text-muted-foreground text-[12px] leading-[1.5] [text-wrap:pretty]">
            {t("opt_in_desc_prefix")} <strong className="text-foreground font-medium">{t("opt_in_active")}</strong>{" "}
            {t("opt_in_desc_suffix")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {AGENCY_PERMISSIONS.map((def) => (
            <OptInRow
              key={def.slug}
              def={def}
              defaultOn={DEFAULT_OPT_IN.has(def.slug)}
              label={PERM_LABEL(def.slug, t)}
              desc={PERM_DESC(def.slug, t)}
            />
          ))}
        </div>
        <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-[11.5px] leading-[1.5]">
          <span className="text-muted-foreground/80 mt-px shrink-0">
            <Eye size={13} />
          </span>
          <span className="[text-wrap:pretty]">{t("opt_in_note")}</span>
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

function AgencyAccessCard({
  agency,
  grant,
  kindLabel,
  globalLabel,
  readersLabel,
  platformLabel,
  revokeLabel,
  permLabel,
}: {
  agency: Agency;
  grant: Grant;
  orgName: string;
  kindLabel: string;
  globalLabel: string;
  readersLabel: string;
  platformLabel: string;
  revokeLabel: string;
  permLabel: (slug: string) => string;
}) {
  const isGlobal = grant.orgId === null;
  return (
    <div className="border-border bg-background flex flex-col gap-3 rounded-lg border px-3.5 py-3">
      <div className="flex items-start gap-3">
        <AgencyTile kind={agency.kind} size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground text-[14px] font-semibold tracking-[-0.01em]">{agency.name}</span>
            <span className="text-muted-foreground text-[11.5px]">{kindLabel}</span>
          </div>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[12px]">
            {isGlobal ? (
              <>
                <Globe size={12} /> {globalLabel}
              </>
            ) : (
              <>
                <Users size={12} /> {readersLabel}
              </>
            )}
          </span>
        </div>
        {isGlobal ? (
          <span className="text-muted-foreground/70 border-border inline-flex shrink-0 items-center gap-1 self-center rounded-md border border-dashed px-2 py-1 text-[11px]">
            <Lock size={11} /> {platformLabel}
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/[0.06] hover:border-destructive/40 shrink-0 self-center"
          >
            <Ban size={13} /> {revokeLabel}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 pl-[52px]">
        {grant.slugs.map((s) => (
          <GrantPill key={s} slug={s} implicit={grant.kind === "implicit"} label={permLabel(s)} />
        ))}
      </div>
    </div>
  );
}

function OptInRow({
  def,
  defaultOn,
  label,
  desc,
}: {
  def: AgencyPermissionDef;
  defaultOn: boolean;
  label: string;
  desc: string;
}) {
  const [checked, setChecked] = useState(defaultOn);
  return (
    <div
      className="border-border bg-background grid items-center gap-3 rounded-md border px-3.5 py-2.5"
      style={{ gridTemplateColumns: "1fr auto" }}
    >
      <div className="flex min-w-0 flex-col gap-[1px]">
        <span className="inline-flex items-center gap-2">
          <span className="text-foreground text-[13px] font-medium">{label}</span>
          <code className="text-muted-foreground/80 font-mono text-[10.5px]">{def.slug}</code>
        </span>
        <span className="text-muted-foreground text-[11.5px] leading-[1.4]">{desc}</span>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={label} />
    </div>
  );
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

function PERM_DESC(slug: string, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string {
  if (slug === "payroll_view") return t("desc_payroll_view");
  if (slug === "reports_view") return t("desc_reports_view");
  if (slug === "documents_view") return t("desc_documents_view");
  if (slug === "members_view") return t("desc_members_view");
  if (slug === "compliance_view") return t("desc_compliance_view");
  if (slug === "audit_export") return t("desc_audit_export");
  return "";
}

const LOCALE_ES = {
  eyebrow: "Ajustes",
  title: "Acceso externo",
  subtitle:
    "Agencias externas — firmas auditoras, entes fiscalizadores o soporte — con acceso de solo lectura a {{org}}. Tú controlas qué pueden ver; nunca pueden modificar nada.",
  grant_access: "Dar acceso",
  with_access: "Agencias con acceso",
  global_managed: "Acceso global · gestionado por la plataforma",
  readers: "{{count}} afiliados pueden leer {{org}}",
  platform: "Plataforma",
  revoke: "Revocar",
  opt_in: "Opt-in automático",
  opt_in_desc_prefix: "Permisos que cualquier afiliado",
  opt_in_active: "activo",
  opt_in_desc_suffix:
    "de una agencia con acceso hereda automáticamente, sin asignarlos uno por uno. Útil para reportes básicos que toda firma debería poder ver.",
  opt_in_note:
    "Todo el acceso externo es de solo lectura. El opt-in solo amplía lo que se puede leer — nunca habilita escritura.",
  kind_audit: "Auditoría",
  kind_government: "Fiscalización",
  kind_internal: "Interna",
  kind_accounting: "Contable",
  perm_wildcard: "Acceso global",
  perm_payroll_view: "Ver remuneraciones",
  perm_reports_view: "Ver reportes",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver miembros",
  perm_compliance_view: "Ver cumplimiento",
  perm_audit_export: "Exportar auditoría",
  desc_payroll_view: "Planillas, liquidaciones y haberes.",
  desc_reports_view: "Paneles de analítica y estados financieros.",
  desc_documents_view: "Contratos, anexos y respaldos.",
  desc_members_view: "Listado de personas de la organización.",
  desc_compliance_view: "Datos tributarios y de cumplimiento normativo.",
  desc_audit_export: "Descargar respaldos en CSV o PDF.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Settings",
  title: "External access",
  subtitle:
    "External agencies — audit firms, regulators or support — with read-only access to {{org}}. You control what they can see; they can never modify anything.",
  grant_access: "Grant access",
  with_access: "Agencies with access",
  global_managed: "Global access · managed by the platform",
  readers: "{{count}} affiliates can read {{org}}",
  platform: "Platform",
  revoke: "Revoke",
  opt_in: "Automatic opt-in",
  opt_in_desc_prefix: "Permissions that any",
  opt_in_active: "active",
  opt_in_desc_suffix:
    "affiliate of an agency with access inherits automatically, without assigning them one by one. Useful for basic reports every firm should be able to see.",
  opt_in_note: "All external access is read-only. Opt-in only widens what can be read — it never enables writing.",
  kind_audit: "Audit",
  kind_government: "Regulator",
  kind_internal: "Internal",
  kind_accounting: "Accounting",
  perm_wildcard: "Global access",
  perm_payroll_view: "View payroll",
  perm_reports_view: "View reports",
  perm_documents_view: "View documents",
  perm_members_view: "View members",
  perm_compliance_view: "View compliance",
  perm_audit_export: "Export audit",
  desc_payroll_view: "Payroll runs, payslips and earnings.",
  desc_reports_view: "Analytics dashboards and financial statements.",
  desc_documents_view: "Contracts, addenda and supporting files.",
  desc_members_view: "The organization's roster of people.",
  desc_compliance_view: "Tax and regulatory compliance data.",
  desc_audit_export: "Download backups as CSV or PDF.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Configurações",
  title: "Acesso externo",
  subtitle:
    "Agências externas — firmas de auditoria, órgãos fiscais ou suporte — com acesso somente leitura a {{org}}. Você controla o que podem ver; nunca podem modificar nada.",
  grant_access: "Dar acesso",
  with_access: "Agências com acesso",
  global_managed: "Acesso global · gerenciado pela plataforma",
  readers: "{{count}} afiliados podem ler {{org}}",
  platform: "Plataforma",
  revoke: "Revogar",
  opt_in: "Opt-in automático",
  opt_in_desc_prefix: "Permissões que qualquer afiliado",
  opt_in_active: "ativo",
  opt_in_desc_suffix:
    "de uma agência com acesso herda automaticamente, sem atribuí-las uma a uma. Útil para relatórios básicos que toda firma deveria poder ver.",
  opt_in_note:
    "Todo acesso externo é somente leitura. O opt-in apenas amplia o que pode ser lido — nunca habilita escrita.",
  kind_audit: "Auditoria",
  kind_government: "Fiscalização",
  kind_internal: "Interna",
  kind_accounting: "Contábil",
  perm_wildcard: "Acesso global",
  perm_payroll_view: "Ver remunerações",
  perm_reports_view: "Ver relatórios",
  perm_documents_view: "Ver documentos",
  perm_members_view: "Ver membros",
  perm_compliance_view: "Ver conformidade",
  perm_audit_export: "Exportar auditoria",
  desc_payroll_view: "Folhas de pagamento, holerites e proventos.",
  desc_reports_view: "Painéis de análise e demonstrações financeiras.",
  desc_documents_view: "Contratos, aditivos e comprovantes.",
  desc_members_view: "Lista de pessoas da organização.",
  desc_compliance_view: "Dados tributários e de conformidade regulatória.",
  desc_audit_export: "Baixar backups em CSV ou PDF.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
