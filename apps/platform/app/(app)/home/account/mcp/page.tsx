import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { McpConnect } from "~/components/mcp/mcp-connect";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";

export default async function AccountMcpPage(props: PageProps<"/home/account/mcp">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const { t } = await getRosetta(LOCALES);
  const endpoint = `${APP_URL.origin}/api/mcp`;

  return (
    <div className="flex max-w-180 flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-widest uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      <McpConnect endpoint={endpoint} />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Cuenta · MCP",
  heading: "Conecta tu IA",
  description: "Conecta Claude, Cursor o tu propio agente a tu cuenta mediante un servidor MCP, con tus permisos.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Account · MCP",
  heading: "Connect your AI",
  description:
    "Connect Claude, Cursor, or your own agent to your account through an MCP server, with your permissions.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Conta · MCP",
  heading: "Conecte sua IA",
  description: "Conecte o Claude, o Cursor ou seu próprio agente à sua conta via servidor MCP, com suas permissões.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
