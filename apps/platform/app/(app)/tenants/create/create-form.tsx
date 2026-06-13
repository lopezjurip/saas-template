"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { SLUGIFY } from "@packages/utils/slug";
import { usePostHog } from "@posthog/next";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CreateTenantValues, createTenantSchema } from "./schemas";

/**
 * Initial-plan picker is UI-only for now — billing is phase 2 (CLAUDE.md: tenant_tier gates
 * features once billing exists), so the choice isn't persisted yet. Prices mirror the design mock.
 */
type PlanId = "free" | "pro";

const CreateTenantFormMutation = /*#__PURE__*/ gql(`
  mutation CreateTenantFormMutation($tenant_name: String!, $tenant_slug: String!) {
    tenant: viewer_tenant_create(tenant_name: $tenant_name, tenant_slug: $tenant_slug) {
      tenant_id
    }
  }
`);

export function CreateTenantForm() {
  const { t } = useRosetta(LOCALES);
  const posthog = usePostHog();
  const [serverError, setServerError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanId>("free");
  const [createState, createTenant] = useGraphyMutation(CreateTenantFormMutation);
  /**
   * Read the live host (hostname + port) so the previewed URL stays accurate in Conductor
   * dev where parallel instances are bound to different ports. Empty on SSR → matches the
   * initial client render to avoid hydration mismatches; populated after mount.
   */
  const [appHost, setAppHost] = useState("");
  useEffect(() => {
    setAppHost(window.location.host);
  }, []);

  const form = useForm<CreateTenantValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { tenant_name: "", tenant_slug: "" },
  });

  const slug = form.watch("tenant_slug");
  const tenantName = form.watch("tenant_name");
  const slugTouched = Boolean(form.formState.dirtyFields.tenant_slug);
  const { setValue } = form;

  /**
   * Suggest a slug derived from the tenant name until the user edits the slug field manually.
   */
  useEffect(() => {
    if (slugTouched) return;
    const suggested = SLUGIFY(tenantName).slice(0, 40);
    setValue("tenant_slug", suggested, { shouldValidate: false, shouldDirty: false });
  }, [tenantName, slugTouched, setValue]);

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    const { data, error } = await createTenant(values);
    const tenant_id = data?.["tenant"]?.["tenant_id"];
    if (error || !tenant_id) {
      const message = error?.message ?? "";
      if (message.includes("duplicate") || message.includes("unique")) {
        setServerError(t("slug_taken"));
      } else if (message.includes("check") && message.includes("tenant_slug")) {
        setServerError(t("slug_reserved"));
      } else {
        setServerError(t("create_failed"));
      }
      return;
    }
    posthog?.capture("tenant_created", { tenant_id, tenant_slug: values["tenant_slug"] });
    posthog?.group("tenant", String(tenant_id), { tenant_slug: values["tenant_slug"] });
    window.location.assign(ROUTE_HREF(ROUTE("/t/[tenant_slug]", { tenant_slug: values["tenant_slug"] })));
  });

  const PLANS: { id: PlanId; name: string; price: string; per: string; blurb: string }[] = [
    { id: "free", name: "Free", price: "$0", per: t("plan_free_per"), blurb: t("plan_free_blurb") },
    { id: "pro", name: "Pro", price: "$24", per: t("plan_pro_per"), blurb: t("plan_pro_blurb") },
  ];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant_name">{t("company_name_label")}</Label>
        <Input
          id="tenant_name"
          className="h-10"
          placeholder="Mi empresa"
          autoComplete="organization"
          aria-invalid={!!form.formState.errors.tenant_name}
          {...form.register("tenant_name")}
        />
        {form.formState.errors.tenant_name && (
          <p className="text-destructive text-xs">{form.formState.errors.tenant_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant_slug">{t("slug_label")}</Label>
        <Input
          id="tenant_slug"
          className="h-10"
          placeholder="acme"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={!!form.formState.errors.tenant_slug}
          {...form.register("tenant_slug")}
        />
        <p className="text-muted-foreground text-xs">
          {t("url_preview")} <strong className="font-medium text-foreground">{`${appHost}/${slug || "{slug}"}`}</strong>
        </p>
        {form.formState.errors.tenant_slug && (
          <p className="text-destructive text-xs">{form.formState.errors.tenant_slug.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground">{t("plan_label")}</span>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((p) => {
            const on = p.id === plan;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                data-active={on}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-background p-3 text-left transition-[background,border-color]",
                  "hover:border-foreground/30",
                  "data-[active=true]:border-foreground data-[active=true]:bg-muted/40",
                )}
              >
                <span className="inline-flex items-center justify-between">
                  <span className="text-sm/normal font-semibold text-foreground">{p.name}</span>
                  {on && (
                    <span className="text-foreground">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold tracking-[-0.01em] text-foreground tabular-nums">
                  {p.price} <span className="text-xs font-normal text-muted-foreground">{p.per}</span>
                </span>
                <span className="text-xs leading-snug text-muted-foreground text-pretty">{p.blurb}</span>
              </button>
            );
          })}
        </div>
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" disabled={createState.isValidating} className="h-10 w-full">
          <span>{createState.isValidating ? t("creating") : t("create_company")}</span>
          {!createState.isValidating && <ArrowRight size={16} />}
        </Button>
        <Button asChild type="button" variant="ghost" className="h-10 w-full text-muted-foreground">
          <Link href={ROUTE("/home")}>{t("cancel")}</Link>
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  company_name_label: "Nombre",
  slug_label: "Identificador",
  url_preview: "Tu URL será",
  plan_label: "Plan inicial",
  plan_free_per: "para siempre",
  plan_free_blurb: "Hasta 3 miembros y lo esencial.",
  plan_pro_per: "por miembro / mes",
  plan_pro_blurb: "14 días de prueba, sin tarjeta.",
  creating: "Creando empresa…",
  create_company: "Crear empresa",
  cancel: "Cancelar",
  invalid_form: "Formulario inválido",
  slug_taken: "Ese identificador ya está en uso. Prueba otro.",
  slug_reserved: "Ese identificador está reservado.",
  create_failed: "No pudimos crear la empresa. Intenta de nuevo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  company_name_label: "Name",
  slug_label: "Identifier",
  url_preview: "Your URL will be",
  plan_label: "Starting plan",
  plan_free_per: "forever",
  plan_free_blurb: "Up to 3 members and the essentials.",
  plan_pro_per: "per member / month",
  plan_pro_blurb: "14-day trial, no card.",
  creating: "Creating company…",
  create_company: "Create company",
  cancel: "Cancel",
  invalid_form: "Invalid form",
  slug_taken: "That identifier is already in use. Try another one.",
  slug_reserved: "That identifier is reserved.",
  create_failed: "We couldn't create the company. Try again.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  company_name_label: "Nome",
  slug_label: "Identificador",
  url_preview: "Sua URL será",
  plan_label: "Plano inicial",
  plan_free_per: "para sempre",
  plan_free_blurb: "Até 3 membros e o essencial.",
  plan_pro_per: "por membro / mês",
  plan_pro_blurb: "14 dias de teste, sem cartão.",
  creating: "Criando empresa…",
  create_company: "Criar empresa",
  cancel: "Cancelar",
  invalid_form: "Formulário inválido",
  slug_taken: "Esse identificador já está em uso. Tente outro.",
  slug_reserved: "Esse identificador está reservado.",
  create_failed: "Não foi possível criar a empresa. Tente novamente.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
