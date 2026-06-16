"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { SLUGIFY } from "@packages/utils/slug";
import { usePostHog } from "@posthog/next";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CreateOrganizationValues, createOrganizationSchema } from "./schemas";

const CreateOrganizationFormMutation = /*#__PURE__*/ gql(`
  mutation CreateOrganizationFormMutation($organization_name: String!, $organization_slug: String!, $tenant_id: Int!) {
    organization: viewerOrganizationCreate(
      organizationName: $organization_name
      organizationSlug: $organization_slug
      tenantId: $tenant_id
    ) {
      organizationId
      organizationSlug
    }
  }
`);

/**
 * Creates an organization inside the current tenant via `viewerOrganizationCreate`
 * (the caller must hold `organization_manage` or `*` on some org in the tenant; the RPC
 * raises `no_permission` otherwise). On success it navigates to the new org's home.
 *
 * @example
 * <CreateOrganizationForm tenantId={12} tenantSlug="acme" backHref="/t/acme/4" />
 */
export function CreateOrganizationForm({
  tenantId,
  tenantSlug,
  backHref,
}: {
  tenantId: number;
  tenantSlug: string;
  backHref: Route;
}) {
  const { t } = useRosetta(LOCALES);
  const posthog = usePostHog();
  const [serverError, setServerError] = useState<string | null>(null);
  const [createState, createOrganization] = useGraphyMutation(CreateOrganizationFormMutation);
  const isCreating = createState.isValidating;

  const form = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { organization_name: "", organization_slug: "" },
  });

  const organizationName = form.watch("organization_name");
  const slugTouched = Boolean(form.formState.dirtyFields.organization_slug);
  const { setValue } = form;

  useEffect(() => {
    if (slugTouched) return;
    const suggested = SLUGIFY(organizationName).slice(0, 40);
    setValue("organization_slug", suggested, { shouldValidate: false, shouldDirty: false });
  }, [organizationName, slugTouched, setValue]);

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    const { data, error } = await createOrganization({ ...values, tenant_id: tenantId });
    const organization = data?.["organization"];
    const organization_id = organization?.["organizationId"];
    if (error || !organization_id) {
      const message = error?.message ?? "";
      if (message.includes("no_permission")) {
        setServerError(t("no_permission"));
      } else if (message.includes("duplicate") || message.includes("unique")) {
        setServerError(t("slug_taken"));
      } else if (message.includes("slug_validate") || message.includes("check")) {
        setServerError(t("slug_invalid"));
      } else {
        setServerError(t("create_failed"));
      }
      return;
    }
    posthog?.capture("organization_created", { organization_id, tenant_id: tenantId });
    window.location.assign(
      ROUTE_HREF(ROUTE("/t/[tenant_slug]/[organization_id]", { tenant_slug: tenantSlug, organization_id })),
    );
  });

  return (
    <form onSubmit={onSubmit} aria-busy={isCreating} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organization_name">{t("name_label")}</Label>
        <Input
          id="organization_name"
          className="h-10"
          disabled={isCreating}
          placeholder="Operaciones"
          autoComplete="off"
          aria-invalid={!!form.formState.errors.organization_name}
          {...form.register("organization_name")}
        />
        {form.formState.errors.organization_name && (
          <p className="text-destructive text-xs">{form.formState.errors.organization_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organization_slug">{t("slug_label")}</Label>
        <Input
          id="organization_slug"
          className="h-10"
          disabled={isCreating}
          placeholder="operaciones"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={!!form.formState.errors.organization_slug}
          {...form.register("organization_slug")}
        />
        <p className="text-muted-foreground text-xs">{t("slug_help")}</p>
        {form.formState.errors.organization_slug && (
          <p className="text-destructive text-xs">{form.formState.errors.organization_slug.message}</p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <ButtonSpinner pending={isCreating} pendingChildren={<span>{t("creating")}</span>} className="h-10 w-full">
          <span>{t("create")}</span>
          <ArrowRight size={16} />
        </ButtonSpinner>
        <Button asChild type="button" variant="ghost" className="h-10 w-full text-muted-foreground">
          <Link href={backHref}>{t("cancel")}</Link>
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  name_label: "Nombre",
  slug_label: "Identificador",
  slug_help: "Sólo minúsculas, números y guiones. Debe ser único dentro de la empresa.",
  creating: "Creando organización…",
  create: "Crear organización",
  cancel: "Cancelar",
  no_permission: "No tienes permisos para crear organizaciones en esta empresa.",
  slug_taken: "Ese identificador ya está en uso en esta empresa. Prueba otro.",
  slug_invalid: "Ese identificador no es válido.",
  create_failed: "No pudimos crear la organización. Intenta de nuevo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  name_label: "Name",
  slug_label: "Identifier",
  slug_help: "Lowercase letters, numbers and hyphens only. Must be unique within the company.",
  creating: "Creating organization…",
  create: "Create organization",
  cancel: "Cancel",
  no_permission: "You don't have permission to create organizations in this company.",
  slug_taken: "That identifier is already in use in this company. Try another one.",
  slug_invalid: "That identifier is not valid.",
  create_failed: "We couldn't create the organization. Try again.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  name_label: "Nome",
  slug_label: "Identificador",
  slug_help: "Apenas letras minúsculas, números e hifens. Deve ser único dentro da empresa.",
  creating: "Criando organização…",
  create: "Criar organização",
  cancel: "Cancelar",
  no_permission: "Você não tem permissão para criar organizações nesta empresa.",
  slug_taken: "Esse identificador já está em uso nesta empresa. Tente outro.",
  slug_invalid: "Esse identificador não é válido.",
  create_failed: "Não foi possível criar a organização. Tente novamente.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
