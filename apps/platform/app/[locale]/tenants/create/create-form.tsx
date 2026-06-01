"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { SLUGIFY } from "@packages/utils/slug";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { useRosetta } from "~/hooks/use-rosetta";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { createTenant } from "./actions";
import { type CreateTenantValues, createTenantSchema } from "./schemas";

export function CreateTenantForm() {
  const { t } = useRosetta(LOCALES);
  const locale = useLocaleParam();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Read the live host (hostname + port) so the previewed URL stays accurate in Conductor
  // dev where parallel instances are bound to different ports. Empty on SSR → matches the
  // initial client render to avoid hydration mismatches; populated after mount.
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

  // Suggest a slug derived from the tenant name until the user edits the slug field manually.
  useEffect(() => {
    if (slugTouched) return;
    const suggested = SLUGIFY(tenantName).slice(0, 40);
    setValue("tenant_slug", suggested, { shouldValidate: false, shouldDirty: false });
  }, [tenantName, slugTouched, setValue]);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const [data, error] = await ErrorSafeAction.unwrap(createTenant(values));
      if (error instanceof ErrorSafeActionServer) {
        setServerError(error.serverError);
        return;
      }
      if (error instanceof ErrorSafeActionValidation) {
        setServerError(t("invalid_form"));
        return;
      }
      if (error) return;
      // Hard navigate so the browser picks up the refreshed JWT (new tenant claim) on the next request.
      window.location.assign(`/${locale}/${data.slug}`);
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tenant_name">{t("company_name_label")}</Label>
        <Input
          id="tenant_name"
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
          placeholder="acme"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={!!form.formState.errors.tenant_slug}
          {...form.register("tenant_slug")}
        />
        <p className="text-muted-foreground text-xs">
          {t("url_preview")} {slug ? <strong>{`${appHost}/${slug}`}</strong> : `${appHost}/{slug}`}
        </p>
        {form.formState.errors.tenant_slug && (
          <p className="text-destructive text-xs">{form.formState.errors.tenant_slug.message}</p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("creating") : t("create_company")}
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  company_name_label: "Nombre de la empresa",
  slug_label: "Identificador",
  url_preview: "Tu URL será",
  creating: "Creando empresa…",
  create_company: "Crear empresa",
  invalid_form: "Formulario inválido",
};

const LOCALE_EN: typeof LOCALE_ES = {
  company_name_label: "Company name",
  slug_label: "Identifier",
  url_preview: "Your URL will be",
  creating: "Creating company…",
  create_company: "Create company",
  invalid_form: "Invalid form",
};

const LOCALE_PT: typeof LOCALE_ES = {
  company_name_label: "Nome da empresa",
  slug_label: "Identificador",
  url_preview: "Sua URL será",
  creating: "Criando empresa…",
  create_company: "Criar empresa",
  invalid_form: "Formulário inválido",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
