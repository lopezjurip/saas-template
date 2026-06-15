import { createServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { APP_HOST } from "~/lib/constants";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ApiKeyList } from "./api-key-list";
import { CreateApiKeyForm } from "./create-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function IntegrationsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: keys } = await supabase
    .from("api_keys")
    .select("api_key_id, api_key_name, api_key_prefix, api_key_created_at, api_key_last_used_at, api_key_revoked_at")
    .is("api_key_revoked_at", null)
    .order("api_key_created_at", { ascending: false });

  const locale = await getServerLocale();
  const { t } = await getRosetta(LOCALES, locale);

  const mcpUrl = `https://${APP_HOST}/api/mcp`;

  return (
    <div className="flex max-w-[720px] flex-col gap-8">
      <header className="flex flex-col gap-1">
        <span className="text-tiny font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {t("breadcrumb")}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("heading")}</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">{t("description")}</p>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground">{t("mcp_section_title")}</h2>
          <p className="text-xs text-muted-foreground">{t("mcp_section_description")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3.5 py-3">
          <code className="flex-1 truncate font-mono text-xs text-foreground">{mcpUrl}</code>
        </div>
        <p className="text-xs text-muted-foreground">{t("mcp_auth_hint")}</p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground">{t("keys_section_title")}</h2>
          <p className="text-xs text-muted-foreground">{t("keys_section_description")}</p>
        </div>
        <CreateApiKeyForm />
        <ApiKeyList keys={keys ?? []} />
      </section>
    </div>
  );
}

const LOCALE_ES = {
  page_title: "Integraciones",
  breadcrumb: "Cuenta · Integraciones",
  heading: "Integraciones y API",
  description:
    "Crea claves de API para conectar agentes de IA y herramientas externas. Cada clave da acceso a tu cuenta a través del servidor MCP.",
  mcp_section_title: "Endpoint MCP",
  mcp_section_description:
    "Usa esta URL en tu cliente MCP (Claude Desktop, Cursor, etc.) con una clave de API como Bearer token.",
  mcp_auth_hint: "Autorización: Authorization: Bearer <tu-clave>",
  keys_section_title: "Claves de API",
  keys_section_description: "Las claves solo se muestran al momento de crearse. Revócalas si las pierdes.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    page_title: "Integrations",
    breadcrumb: "Account · Integrations",
    heading: "Integrations & API",
    description:
      "Create API keys to connect AI agents and external tools. Each key grants access to your account through the MCP server.",
    mcp_section_title: "MCP Endpoint",
    mcp_section_description:
      "Use this URL in your MCP client (Claude Desktop, Cursor, etc.) with an API key as Bearer token.",
    mcp_auth_hint: "Authorization header: Authorization: Bearer <your-key>",
    keys_section_title: "API Keys",
    keys_section_description: "Keys are only shown when first created. Revoke them if lost.",
  } satisfies typeof LOCALE_ES,
  pt: {
    page_title: "Integrações",
    breadcrumb: "Conta · Integrações",
    heading: "Integrações e API",
    description:
      "Crie chaves de API para conectar agentes de IA e ferramentas externas. Cada chave concede acesso à sua conta pelo servidor MCP.",
    mcp_section_title: "Endpoint MCP",
    mcp_section_description:
      "Use esta URL no seu cliente MCP (Claude Desktop, Cursor, etc.) com uma chave de API como Bearer token.",
    mcp_auth_hint: "Cabeçalho: Authorization: Bearer <sua-chave>",
    keys_section_title: "Chaves de API",
    keys_section_description: "As chaves só são exibidas ao serem criadas. Revogue-as se perdê-las.",
  } satisfies typeof LOCALE_ES,
};
