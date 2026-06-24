import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { McpConnect } from "~/components/mcp/mcp-connect";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AgencyMcpPage(props: PageProps<"/a/[agency_slug]/mcp">) {
  const { agency_slug } = await props.params;
  const { t } = await getRosetta(LOCALES);

  // viewer_agency_by_slug is RLS-scoped — returns the agency only for an accepted member.
  const supabase = await createSupabaseServerClient();
  const { data: agency } = await supabase.rpc("viewer_agency_by_slug", { agency_slug }).maybeSingle();
  if (!agency) notFound();

  const endpoint = `${APP_URL.origin}/api/mcp`;

  return (
    <div className="bg-muted dark:bg-background min-h-svh w-full">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
        <header className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
            {agency["agency_name"]} · {t("eyebrow")}
          </span>
          <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
        </header>

        <McpConnect endpoint={endpoint} />
      </div>
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
