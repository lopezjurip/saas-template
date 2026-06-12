"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { SLUGIFY } from "@packages/utils/slug";
import { ArrowRight, Briefcase, Building2, Check, Eye, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import { ROUTE } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionCreateAgency } from "./actions";

type Stage = "form" | "created";

export function AgencyCreate({ locale }: { locale: string }) {
  const { t } = useRosetta(LOCALES);
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [touchedSlug, setTouchedSlug] = useState(false);
  const [slug, setSlug] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Shared slug rule from @packages/utils, capped at 40 like the tenant-create flow.
  const autoSlug = SLUGIFY(name).slice(0, 40);
  const effectiveSlug = (touchedSlug ? slug : autoSlug) || t("slug_fallback");
  const consoleUrl = `app.example.com/a/${createdSlug}`;
  const backHref = ROUTE("/[locale]/admin/agencies", { locale });

  function submit() {
    setServerError(null);
    const finalSlug = (touchedSlug ? slug : autoSlug).trim();
    if (!name.trim()) {
      setServerError(t("name_required"));
      return;
    }
    if (finalSlug.length < 3) {
      setServerError(t("slug_invalid"));
      return;
    }
    startTransition(async () => {
      const [data, error] = await ErrorSafeAction.unwrap(
        actionCreateAgency({ agency_name: name.trim(), agency_slug: finalSlug }),
      );
      if (error instanceof ErrorSafeActionServer) {
        setServerError(error.serverError);
        return;
      }
      if (error instanceof ErrorSafeActionValidation) {
        setServerError(t("slug_invalid"));
        return;
      }
      if (error) return;
      setCreatedSlug(data["agency_slug"]);
      setStage("created");
    });
  }

  const consoleHref = ROUTE("/[locale]/a/[agency_slug]", { locale, agency_slug: createdSlug });
  const inviteHref = ROUTE("/[locale]/admin/agencies/[slug]/affiliates/new", { locale, slug: createdSlug });

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-7 px-6 py-8">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2 self-start">
        <Link href={backHref}>← {t("back")}</Link>
      </Button>

      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-xl font-semibold tracking-[-0.02em]">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
        </header>

        {stage === "form" ? (
          <>
            {serverError ? (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

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
                <span className="text-muted-foreground bg-muted/50 border-border inline-flex items-center whitespace-nowrap border-r pl-3 pr-1.5 font-mono text-sm/normal">
                  app.example.com/a/
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
              <p className="text-muted-foreground text-xs leading-normal">{t("slug_hint")}</p>
            </div>

            <div className="border-border bg-muted/40 flex items-start gap-2.5 rounded-md border px-3.5 py-3">
              <span className="text-muted-foreground mt-px shrink-0">
                <Eye size={15} />
              </span>
              <span className="text-muted-foreground text-xs leading-normal text-pretty">
                {t("read_only_prefix")} <strong className="text-foreground font-medium">{t("read_only_strong")}</strong>{" "}
                {t("read_only_suffix")}
              </span>
            </div>

            <Button className="h-9 w-full" onClick={submit} disabled={pending}>
              <Plus size={16} strokeWidth={2} /> {pending ? t("creating") : t("create")}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Check size={22} strokeWidth={2.5} />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-foreground text-sm font-semibold tracking-[-0.01em]">{t("created_title")}</span>
                <span className="text-muted-foreground max-w-[44ch] text-xs leading-normal text-pretty">
                  <strong className="text-foreground font-medium">{name || t("created_fallback")}</strong>{" "}
                  {t("created_desc")}
                </span>
              </div>
            </div>

            <div className="border-border bg-background flex items-center gap-3 rounded-lg border px-3.5 py-3">
              <span className="border-border bg-muted text-foreground inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg border">
                <Building2 size={19} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-foreground truncate text-sm font-semibold tracking-[-0.01em]">
                  {name || t("created_fallback")}
                </span>
                <code className="text-muted-foreground font-mono text-xs">{createdSlug}</code>
              </div>
              <span className="text-muted-foreground bg-muted/60 border-border hidden items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-tiny font-medium leading-[1.2] tracking-[0.02em] sm:inline-flex">
                <Eye size={11} /> {t("read_only_badge")}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
                {t("console_address")}
              </span>
              <div className="border-border bg-muted/40 flex items-center gap-2 rounded-md border px-3 py-2.5">
                <code className="text-foreground flex-1 truncate font-mono text-xs">{consoleUrl}</code>
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

const LOCALE_ES = {
  page_title: "Crear agencia",
  back: "Agencias",
  eyebrow: "Agencias · Nueva",
  title: "Crear una agencia",
  subtitle:
    "Una agencia agrupa a personas externas —una firma auditora, un ente fiscalizador o un estudio contable— con acceso de solo lectura entre organizaciones. Luego invitas a su equipo y cada organización decide qué le comparte.",
  name_label: "Nombre de la agencia",
  name_ph: "Ej. BDO Auditores",
  name_required: "Ingresa el nombre de la agencia",
  slug_label: "Identificador (slug)",
  slug_fallback: "tu-agencia",
  slug_hint: "Es la dirección de la consola de la agencia. Se genera del nombre; puedes ajustarla.",
  slug_invalid: "El identificador debe tener al menos 3 caracteres",
  read_only_prefix: "Las agencias",
  read_only_strong: "nunca",
  read_only_suffix:
    "pueden escribir. Su acceso es de solo lectura, sin importar los permisos que cada organización les otorgue.",
  create: "Crear agencia",
  creating: "Creando…",
  created_title: "Agencia creada",
  created_fallback: "Tu agencia",
  created_desc: "ya existe. Ahora invita a su equipo y pide a las organizaciones que le den acceso.",
  read_only_badge: "Solo lectura",
  console_address: "Dirección de la consola",
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
  name_required: "Enter the agency name",
  slug_label: "Identifier (slug)",
  slug_fallback: "your-agency",
  slug_hint: "It's the address of the agency console. Generated from the name; you can adjust it.",
  slug_invalid: "The identifier must be at least 3 characters long",
  read_only_prefix: "Agencies can",
  read_only_strong: "never",
  read_only_suffix: "write. Their access is read-only, regardless of the permissions each organization grants them.",
  create: "Create agency",
  creating: "Creating…",
  created_title: "Agency created",
  created_fallback: "Your agency",
  created_desc: "now exists. Invite its team and ask organizations to grant it access.",
  read_only_badge: "Read only",
  console_address: "Console address",
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
  name_required: "Informe o nome da agência",
  slug_label: "Identificador (slug)",
  slug_fallback: "sua-agencia",
  slug_hint: "É o endereço da console da agência. Gerado a partir do nome; você pode ajustá-lo.",
  slug_invalid: "O identificador deve ter pelo menos 3 caracteres",
  read_only_prefix: "As agências",
  read_only_strong: "nunca",
  read_only_suffix:
    "podem escrever. Seu acesso é somente leitura, independentemente das permissões que cada organização conceder.",
  create: "Criar agência",
  creating: "Criando…",
  created_title: "Agência criada",
  created_fallback: "Sua agência",
  created_desc: "já existe. Agora convide sua equipe e peça às organizações que lhe deem acesso.",
  read_only_badge: "Somente leitura",
  console_address: "Endereço da console",
  affiliate_team: "Afiliar a equipe",
  open_console: "Abrir console",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
