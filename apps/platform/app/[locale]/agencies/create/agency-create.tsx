"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Textarea } from "@packages/ui-common/shadcn/components/ui/textarea";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { SLUGIFY } from "@packages/utils/slug";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Copy,
  Eye,
  Landmark,
  LifeBuoy,
  Link2,
  type LucideIcon,
  Plus,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import type { AgencyKind } from "~/lib/agencies-mock";

type Stage = "form" | "created";

const KIND_ICON: Record<AgencyKind, LucideIcon> = /*#__PURE__*/ {
  audit: Briefcase,
  government: Landmark,
  internal: LifeBuoy,
  accounting: Building2,
};

// Order mirrors the design: audit → regulator → accounting → internal.
const KIND_ORDER = /*#__PURE__*/ ["audit", "government", "accounting", "internal"] as const;

export function AgencyCreate() {
  const { t } = useRosetta(LOCALES);
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AgencyKind>("audit");
  const [touchedSlug, setTouchedSlug] = useState(false);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  // Shared slug rule from @packages/utils, capped at 40 like the tenant-create flow.
  const autoSlug = SLUGIFY(name).slice(0, 40);
  const effectiveSlug = (touchedSlug ? slug : autoSlug) || t("slug_fallback");
  const consoleUrl = `app.humane.cl/a/${effectiveSlug}`;
  // Locale stays a literal sentinel — proxy.ts rewrites /[locale]/… to the active locale.
  const backHref = "/[locale]/admin/agencies";
  const consoleHref = `/[locale]/a/${effectiveSlug}`;
  const inviteHref = `/[locale]/admin/agencies/${effectiveSlug}/affiliates/new`;

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-7 px-6 py-8">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2 self-start">
        <Link href={backHref}>← {t("back")}</Link>
      </Button>

      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-[22px] font-semibold tracking-[-0.02em]">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-[13.5px] leading-[1.55] [text-wrap:pretty]">
            {t("subtitle")}
          </p>
        </header>

        {stage === "form" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-name">{t("name_label")}</Label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Briefcase size={16} />
                </span>
                <Input
                  id="ag-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("name_ph")}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-slug">{t("slug_label")}</Label>
              <div className="border-input focus-within:border-ring focus-within:ring-ring/40 flex items-stretch overflow-hidden rounded-md border bg-transparent focus-within:ring-[3px]">
                <span className="text-muted-foreground bg-muted/50 border-border inline-flex items-center whitespace-nowrap border-r pl-3 pr-1.5 font-mono text-[13px]">
                  app.humane.cl/a/
                </span>
                <input
                  id="ag-slug"
                  type="text"
                  value={touchedSlug ? slug : autoSlug}
                  onChange={(e) => {
                    setTouchedSlug(true);
                    setSlug(SLUGIFY(e.target.value).slice(0, 40));
                  }}
                  placeholder={t("slug_fallback")}
                  className="text-foreground placeholder:text-muted-foreground h-10 min-w-0 flex-1 bg-transparent px-2.5 font-mono text-sm outline-none"
                />
              </div>
              <p className="text-muted-foreground text-xs leading-[1.5]">{t("slug_hint")}</p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-foreground text-sm font-medium">{t("kind_label")}</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-blurb">{t("blurb_label")}</Label>
              <Textarea id="ag-blurb" rows={3} placeholder={t("blurb_ph")} className="resize-none leading-[1.5]" />
            </div>

            <div className="border-border bg-muted/40 flex items-start gap-2.5 rounded-md border px-3.5 py-3">
              <span className="text-muted-foreground mt-px shrink-0">
                <Eye size={15} />
              </span>
              <span className="text-muted-foreground text-[12px] leading-[1.5] [text-wrap:pretty]">
                {t("read_only_prefix")} <strong className="text-foreground font-medium">{t("read_only_strong")}</strong>{" "}
                {t("read_only_suffix")}
              </span>
            </div>

            <Button className="h-9 w-full" onClick={() => setStage("created")}>
              <Plus size={16} strokeWidth={2} /> {t("create")}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Check size={22} strokeWidth={2.5} />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-foreground text-[15px] font-semibold tracking-[-0.01em]">
                  {t("created_title")}
                </span>
                <span className="text-muted-foreground max-w-[44ch] text-[12.5px] leading-[1.5] [text-wrap:pretty]">
                  <strong className="text-foreground font-medium">{name || t("created_fallback")}</strong>{" "}
                  {t("created_desc")}
                </span>
              </div>
            </div>

            <div className="border-border bg-background flex items-center gap-3 rounded-lg border px-3.5 py-3">
              <AgencyTile kind={kind} size={42} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-foreground truncate text-[13.5px] font-semibold tracking-[-0.01em]">
                  {name || t("created_fallback")}
                </span>
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11.5px]">
                  <code className="font-mono">{effectiveSlug}</code>
                  <span className="opacity-40">·</span>
                  <span>{t(`kind_${kind}`)}</span>
                </span>
              </div>
              <ReadOnlyBadge label={t("read_only_badge")} className="hidden sm:inline-flex" />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
                {t("console_address")}
              </span>
              <div className="border-border bg-muted/40 flex items-center gap-2 rounded-md border px-3 py-2.5">
                <Link2 size={15} className="text-muted-foreground shrink-0" />
                <code className="text-foreground flex-1 truncate font-mono text-[11.5px]">{consoleUrl}</code>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-[30px] shrink-0"
                  aria-label={t("copy_link")}
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://${consoleUrl}`).catch(() => {});
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button asChild variant="outline" className="flex-1">
                <Link href={inviteHref}>
                  <UserPlus size={15} /> {t("affiliate_team")}
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={consoleHref}>
                  {t("open_console")} <ArrowRight size={15} />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
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

function ReadOnlyBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "text-muted-foreground bg-muted/60 border-border inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium leading-[1.2] tracking-[0.02em]",
        className,
      )}
    >
      <Eye size={11} /> {label}
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
          "mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
        )}
      >
        <Check size={12} strokeWidth={3} />
      </span>
    </button>
  );
}

const LOCALE_ES = {
  page_title: "Crear agencia",
  back: "Agencias",
  eyebrow: "Agencias · Nueva",
  title: "Crear una agencia",
  subtitle:
    "Una agencia agrupa a personas externas —una firma auditora, un ente fiscalizador o un estudio contable— con acceso de solo lectura entre organizaciones. Luego invitas a su equipo y cada organización decide qué le comparte.",
  name_label: "Nombre de la agencia",
  name_ph: "Ej. BDO Auditores",
  slug_label: "Identificador (slug)",
  slug_fallback: "tu-agencia",
  slug_hint: "Es la dirección de la consola de la agencia. Se genera del nombre; puedes ajustarla.",
  kind_label: "Tipo de agencia",
  kind_audit: "Auditoría",
  kind_audit_desc: "Firmas que revisan finanzas y remuneraciones.",
  kind_government: "Fiscalización",
  kind_government_desc: "Entes reguladores con acceso de cumplimiento.",
  kind_accounting: "Contable",
  kind_accounting_desc: "Estudios que llevan la contabilidad de clientes.",
  kind_internal: "Interna",
  kind_internal_desc: "Equipo interno con alcance global de soporte.",
  blurb_label: "Descripción",
  blurb_ph: "¿Para qué se contrata a esta agencia?",
  read_only_prefix: "Las agencias",
  read_only_strong: "nunca",
  read_only_suffix:
    "pueden escribir. Su acceso es de solo lectura, sin importar los permisos que cada organización les otorgue.",
  create: "Crear agencia",
  created_title: "Agencia creada",
  created_fallback: "Tu agencia",
  created_desc: "ya existe. Ahora invita a su equipo y pide a las organizaciones que le den acceso.",
  read_only_badge: "Solo lectura",
  console_address: "Dirección de la consola",
  copy_link: "Copiar enlace",
  affiliate_team: "Afiliar al equipo",
  open_console: "Abrir consola",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Create agency",
  back: "Agencies",
  eyebrow: "Agencies · New",
  title: "Create an agency",
  subtitle:
    "An agency groups external people —an audit firm, a regulator or an accounting practice— with read-only access across organizations. You then invite its team and each organization decides what to share.",
  name_label: "Agency name",
  name_ph: "e.g. BDO Auditors",
  slug_label: "Identifier (slug)",
  slug_fallback: "your-agency",
  slug_hint: "It's the address of the agency console. Generated from the name; you can adjust it.",
  kind_label: "Agency type",
  kind_audit: "Audit",
  kind_audit_desc: "Firms that review finances and payroll.",
  kind_government: "Regulator",
  kind_government_desc: "Regulatory bodies with compliance access.",
  kind_accounting: "Accounting",
  kind_accounting_desc: "Practices that keep clients' books.",
  kind_internal: "Internal",
  kind_internal_desc: "Internal team with global support scope.",
  blurb_label: "Description",
  blurb_ph: "What is this agency hired for?",
  read_only_prefix: "Agencies can",
  read_only_strong: "never",
  read_only_suffix: "write. Their access is read-only, regardless of the permissions each organization grants them.",
  create: "Create agency",
  created_title: "Agency created",
  created_fallback: "Your agency",
  created_desc: "now exists. Invite its team and ask organizations to grant it access.",
  read_only_badge: "Read only",
  console_address: "Console address",
  copy_link: "Copy link",
  affiliate_team: "Affiliate the team",
  open_console: "Open console",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Criar agência",
  back: "Agências",
  eyebrow: "Agências · Nova",
  title: "Criar uma agência",
  subtitle:
    "Uma agência agrupa pessoas externas —uma firma de auditoria, um órgão fiscalizador ou um escritório contábil— com acesso somente leitura entre organizações. Depois você convida sua equipe e cada organização decide o que compartilhar.",
  name_label: "Nome da agência",
  name_ph: "Ex. BDO Auditores",
  slug_label: "Identificador (slug)",
  slug_fallback: "sua-agencia",
  slug_hint: "É o endereço da console da agência. Gerado a partir do nome; você pode ajustá-lo.",
  kind_label: "Tipo de agência",
  kind_audit: "Auditoria",
  kind_audit_desc: "Firmas que revisam finanças e remunerações.",
  kind_government: "Fiscalização",
  kind_government_desc: "Órgãos reguladores com acesso de conformidade.",
  kind_accounting: "Contábil",
  kind_accounting_desc: "Escritórios que cuidam da contabilidade de clientes.",
  kind_internal: "Interna",
  kind_internal_desc: "Equipe interna com alcance global de suporte.",
  blurb_label: "Descrição",
  blurb_ph: "Para que esta agência é contratada?",
  read_only_prefix: "As agências",
  read_only_strong: "nunca",
  read_only_suffix:
    "podem escrever. Seu acesso é somente leitura, independentemente das permissões que cada organização conceder.",
  create: "Criar agência",
  created_title: "Agência criada",
  created_fallback: "Sua agência",
  created_desc: "já existe. Agora convide sua equipe e peça às organizações que lhe deem acesso.",
  read_only_badge: "Somente leitura",
  console_address: "Endereço da console",
  copy_link: "Copiar link",
  affiliate_team: "Afiliar a equipe",
  open_console: "Abrir console",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
