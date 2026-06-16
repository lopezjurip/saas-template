"use client";

import { useGraphyMutation } from "@packages/graphy/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EntityLogoControls } from "~/components/entity-logo-controls";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";

const UpdateTenantNameMutation = /*#__PURE__*/ gql(`
  mutation UpdateTenantNameMutation($tenant_id: Int!, $tenant_name: String!) {
    tenant: viewerTenantUpdate(tenantId: $tenant_id, tenantName: $tenant_name) {
      tenantId
      tenantName
    }
  }
`);

/**
 * Tenant-level "general" settings: the tenant logo (public `tenants` bucket, gated by
 * `tenant_manage`) and the tenant name. Slug is immutable (it is the routing key and a
 * reserved-slug check applies), so it is shown read-only. The rename is a viewer-scoped
 * transactional RPC, so it runs as a GraphQL mutation from here — no pass-through Server Action.
 *
 * @example <TenantGeneralSettings tenantId={1} tenantName="Acme" tenantSlug="acme" logoSrc={null} />
 */
export function TenantGeneralSettings({
  tenantId,
  tenantName,
  tenantSlug,
  logoSrc,
}: {
  tenantId: number;
  tenantName: string;
  tenantSlug: string;
  logoSrc: string | null;
}) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [name, setName] = useState(tenantName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [updateState, updateTenant] = useGraphyMutation(UpdateTenantNameMutation);
  const pending = updateState.isValidating;

  const dirty = name.trim() !== tenantName && name.trim().length > 0;

  async function onSave() {
    setError(null);
    setSaved(false);
    const { data, error: mutationError } = await updateTenant({ tenant_id: tenantId, tenant_name: name.trim() });
    if (mutationError || !data?.["tenant"]) {
      setError(t("save_failed"));
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
          {tenantName} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
      </header>

      <section className="border-border bg-background flex flex-col gap-4 rounded-xl border p-5">
        <EntityLogoControls
          bucket="tenants"
          ownerKey={String(tenantId)}
          name={tenantName}
          src={logoSrc}
          shape="square"
          helpText={t("logo_hint")}
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tenant-name">{t("name_label")}</Label>
          <Input
            id="tenant-name"
            value={name}
            disabled={pending}
            maxLength={256}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tenant-slug">{t("slug_label")}</Label>
          <Input id="tenant-slug" value={tenantSlug} readOnly disabled className="text-muted-foreground" />
          <p className="text-muted-foreground text-xs leading-normal">{t("slug_hint")}</p>
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <div className="flex items-center gap-3">
          <Button size="sm" disabled={!dirty || pending} onClick={onSave}>
            {pending ? t("saving") : t("save")}
          </Button>
          {saved && !dirty ? <span className="text-muted-foreground text-xs">{t("saved")}</span> : null}
        </div>
      </section>
    </div>
  );
}

const LOCALE_ES = {
  eyebrow: "Empresa",
  title: "Ajustes de la empresa",
  subtitle: "La identidad de la empresa (entidad de facturación). Estos datos son distintos de cada organización.",
  logo_hint: "Usa una imagen cuadrada. Si no subes una, mostramos las iniciales.",
  name_label: "Nombre de la empresa",
  slug_label: "Identificador (slug)",
  slug_hint: "Es la clave de las URLs de la empresa y no se puede cambiar.",
  save: "Guardar",
  saving: "Guardando…",
  saved: "Guardado",
  save_failed: "No pudimos guardar los cambios. Intenta de nuevo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Company",
  title: "Company settings",
  subtitle: "The company's identity (the billing entity). This is separate from each organization.",
  logo_hint: "Use a square image. If you don't upload one, we show the initials.",
  name_label: "Company name",
  slug_label: "Identifier (slug)",
  slug_hint: "It is the key for the company URLs and cannot be changed.",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  save_failed: "We couldn't save the changes. Try again.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Empresa",
  title: "Configurações da empresa",
  subtitle: "A identidade da empresa (entidade de cobrança). Isto é separado de cada organização.",
  logo_hint: "Use uma imagem quadrada. Se você não enviar uma, mostramos as iniciais.",
  name_label: "Nome da empresa",
  slug_label: "Identificador (slug)",
  slug_hint: "É a chave das URLs da empresa e não pode ser alterada.",
  save: "Salvar",
  saving: "Salvando…",
  saved: "Salvo",
  save_failed: "Não foi possível salvar as alterações. Tente novamente.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
