import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { McpConnect } from "~/components/mcp/mcp-connect";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationMcpSettingsPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/mcp">,
) {
  const { organization_id: organization_id_param } = await props.params;

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  // RLS-scoped: gates membership and gives us the org name for the eyebrow.
  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  const { t } = await getRosetta(LOCALES);
  const endpoint = `${APP_URL.origin}/api/mcp`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
          {organization["organizationName"]} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
      </header>

      <McpConnect endpoint={endpoint} />
    </div>
  );
}

const LOCALE_ES = {
  page_title: "MCP",
  eyebrow: "MCP",
  title: "Conecta tu IA",
  subtitle: "Conecta Claude, Cursor o tu propio agente mediante un servidor MCP. Cada llamada respeta tus permisos.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "MCP",
  eyebrow: "MCP",
  title: "Connect your AI",
  subtitle: "Connect Claude, Cursor, or your own agent through an MCP server. Every call respects your permissions.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "MCP",
  eyebrow: "MCP",
  title: "Conecte sua IA",
  subtitle: "Conecte o Claude, o Cursor ou seu próprio agente via servidor MCP. Cada chamada respeita suas permissões.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
