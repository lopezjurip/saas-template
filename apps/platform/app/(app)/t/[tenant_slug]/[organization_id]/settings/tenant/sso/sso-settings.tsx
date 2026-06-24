"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Textarea } from "@packages/ui-common/shadcn/components/ui/textarea";
import { Building2, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { actionSSOProviderCreate, actionSSOProviderDelete } from "./actions";

export type SsoProvider = {
  sso_provider_id: string;
  sso_provider_label: string;
  sso_provider_domains: string[];
  sso_provider_enabled: boolean;
};

type Props = {
  tenantId: number;
  tenantName: string;
  providers: SsoProvider[];
};

/**
 * Tenant SSO settings: list existing SAML providers and add new ones.
 * Writes go through service-role server actions that call the Supabase GoTrue admin API.
 * @example <SsoSettings tenantId={1} tenantName="Acme" tenantSlug="acme" organizationId={1} providers={[]} />
 */
export function SsoSettings({ tenantId, tenantName, providers }: Props) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [metadataXml, setMetadataXml] = useState("");
  const [domains, setDomains] = useState("");
  const [showForm, setShowForm] = useState(false);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await actionSSOProviderCreate({
        tenant_id: tenantId,
        label,
        metadata_xml: metadataXml,
        domains,
      });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }
      setLabel("");
      setMetadataXml("");
      setDomains("");
      setShowForm(false);
      router.refresh();
    });
  }

  function onDelete(ssoProviderId: string) {
    setError(null);
    startTransition(async () => {
      const result = await actionSSOProviderDelete({
        tenant_id: tenantId,
        sso_provider_id: ssoProviderId,
      });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
          {tenantName} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{t("providers")}</span>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              {t("add_provider")}
            </Button>
          )}
        </div>

        {providers.length === 0 && !showForm && (
          <div className="border-border bg-background flex flex-col items-center gap-3 rounded-xl border p-8 text-center">
            <span className="bg-muted inline-flex size-10 items-center justify-center rounded-lg">
              <Shield size={18} className="text-muted-foreground" />
            </span>
            <p className="text-muted-foreground m-0 text-sm">{t("empty")}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {providers.map((p) => (
            <div
              key={p["sso_provider_id"]}
              className="border-border bg-background grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border px-3.5 py-3"
            >
              <span className="bg-muted text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Building2 size={16} />
              </span>
              <div className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
                  {p["sso_provider_label"] || p["sso_provider_id"]}
                  <Badge variant="outline" className="text-muted-foreground">
                    SAML 2.0
                  </Badge>
                </span>
                <span className="text-muted-foreground truncate text-xs">{p["sso_provider_domains"].join(", ")}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => onDelete(p["sso_provider_id"])}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>

        {showForm && (
          <form onSubmit={onAdd} className="border-border bg-background flex flex-col gap-4 rounded-xl border p-5">
            <h2 className="text-foreground m-0 text-sm font-semibold">{t("form_title")}</h2>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sso-label">{t("label_name")}</Label>
              <Input
                id="sso-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("label_name_placeholder")}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sso-domains">{t("label_domains")}</Label>
              <Input
                id="sso-domains"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                placeholder={t("label_domains_placeholder")}
                required
              />
              <p className="text-muted-foreground text-xs">{t("label_domains_hint")}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sso-xml">{t("label_xml")}</Label>
              <Textarea
                id="sso-xml"
                value={metadataXml}
                onChange={(e) => setMetadataXml(e.target.value)}
                placeholder={t("label_xml_placeholder")}
                rows={8}
                className="font-mono text-xs"
                required
              />
              <p className="text-muted-foreground text-xs">{t("label_xml_hint")}</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? t("saving") : t("save")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        )}

        {error && !showForm && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </section>
    </div>
  );
}

const LOCALE_ES = {
  eyebrow: "Empresa",
  title: "Single Sign-On (SSO)",
  subtitle:
    "Configurá SAML 2.0 para que los usuarios de tu empresa inicien sesión con su proveedor de identidad corporativo.",
  providers: "Proveedores configurados",
  add_provider: "Agregar proveedor",
  empty: "No hay proveedores SSO configurados.",
  form_title: "Nuevo proveedor SAML 2.0",
  label_name: "Nombre del proveedor",
  label_name_placeholder: "Ej. Okta, Azure AD, Google Workspace",
  label_domains: "Dominios de correo",
  label_domains_placeholder: "empresa.com, subsidiaria.com",
  label_domains_hint: "Separá múltiples dominios con comas. Los usuarios con estos dominios serán redirigidos a SSO.",
  label_xml: "Metadata XML del IdP",
  label_xml_placeholder: "<EntityDescriptor …>",
  label_xml_hint: "Obtené este XML desde el panel de administración de tu proveedor de identidad.",
  save: "Guardar proveedor",
  saving: "Guardando…",
  cancel: "Cancelar",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Company",
  title: "Single Sign-On (SSO)",
  subtitle: "Configure SAML 2.0 so your company users can sign in with their corporate identity provider.",
  providers: "Configured providers",
  add_provider: "Add provider",
  empty: "No SSO providers configured.",
  form_title: "New SAML 2.0 provider",
  label_name: "Provider name",
  label_name_placeholder: "e.g. Okta, Azure AD, Google Workspace",
  label_domains: "Email domains",
  label_domains_placeholder: "company.com, subsidiary.com",
  label_domains_hint: "Separate multiple domains with commas. Users with these domains will be redirected to SSO.",
  label_xml: "IdP Metadata XML",
  label_xml_placeholder: "<EntityDescriptor …>",
  label_xml_hint: "Get this XML from your identity provider's admin panel.",
  save: "Save provider",
  saving: "Saving…",
  cancel: "Cancel",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Empresa",
  title: "Single Sign-On (SSO)",
  subtitle:
    "Configure SAML 2.0 para que os usuários da sua empresa façam login com o provedor de identidade corporativo.",
  providers: "Provedores configurados",
  add_provider: "Adicionar provedor",
  empty: "Nenhum provedor SSO configurado.",
  form_title: "Novo provedor SAML 2.0",
  label_name: "Nome do provedor",
  label_name_placeholder: "Ex. Okta, Azure AD, Google Workspace",
  label_domains: "Domínios de e-mail",
  label_domains_placeholder: "empresa.com, subsidiaria.com",
  label_domains_hint:
    "Separe múltiplos domínios com vírgulas. Usuários com esses domínios serão redirecionados para SSO.",
  label_xml: "Metadata XML do IdP",
  label_xml_placeholder: "<EntityDescriptor …>",
  label_xml_hint: "Obtenha este XML no painel de administração do seu provedor de identidade.",
  save: "Salvar provedor",
  saving: "Salvando…",
  cancel: "Cancelar",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
