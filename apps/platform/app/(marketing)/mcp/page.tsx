import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Card, CardContent } from "@packages/ui-common/shadcn/components/ui/card";
import { URL_NEW } from "@packages/utils/url";
import { KeyRound, Plug, ShieldCheck, Terminal } from "lucide-react";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { McpPromptCta } from "~/components/mcp/mcp-prompt-cta";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";

export async function generateMetadata(props: PageProps<"/mcp">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      type: "website",
      url: URL_NEW("/mcp", APP_URL).href,
      locale: locale,
      title: t("title"),
      description: t("subtitle"),
      siteName: "SaaS Template",
    },
  };
}

export default async function McpPage(props: PageProps<"/mcp">) {
  const { t, locale } = await getRosetta(LOCALES);
  const user = await getSupabaseServerUser();

  const endpoint = `${APP_URL.origin}/api/mcp`;
  const ctaHref = user ? ROUTE("/home") : ROUTE("/auth");

  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: URL_NEW("/mcp", APP_URL).href,
    inLanguage: locale,
  };

  const flow = [
    { icon: Plug, title: t("flow.a.title"), body: t("flow.a.body") },
    { icon: ShieldCheck, title: t("flow.b.title"), body: t("flow.b.body") },
    { icon: KeyRound, title: t("flow.c.title"), body: t("flow.c.body") },
  ];

  return (
    <>
      <JsonLd data={webPageSchema} />
      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6 py-14 sm:py-20">
          <Badge variant="outline" className="w-fit gap-1.5 rounded-full font-normal text-muted-foreground">
            <Terminal aria-hidden="true" className="h-3 w-3" />
            {t("tag")}
          </Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="max-w-[60ch] text-pretty text-base leading-relaxed text-muted-foreground">{t("subtitle")}</p>

          <McpPromptCta endpoint={endpoint} platformHref={ctaHref} />

          <Card className="mt-2">
            <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("endpoint.label")}
              </span>
              <code className="block w-full overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {endpoint}
              </code>
              <p className="text-sm text-muted-foreground">{t("endpoint.note")}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 pb-14 sm:pb-20">
          <div className="mb-8 flex max-w-[44ch] flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("flow.tag")}
            </span>
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{t("flow.title")}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {flow.map((step) => (
              <Card key={step.title} className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                    <step.icon aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

const LOCALE_ES = {
  tag: "Model Context Protocol",
  title: "Conecta tus agentes con un servidor MCP",
  subtitle:
    "SaaS Template expone un servidor MCP remoto (Streamable HTTP) para que asistentes de IA consulten y actúen sobre tus datos — siempre con las políticas RLS de Postgres aplicadas por usuario.",
  "endpoint.label": "Endpoint",
  "endpoint.note":
    "Transporte Streamable HTTP, sin estado. Compatible con cualquier cliente MCP (Claude, Cursor, IDEs y agentes propios).",
  "flow.tag": "Autenticación",
  "flow.title": "Acceso seguro por OAuth",
  "flow.a.title": "Conecta el endpoint",
  "flow.a.body":
    "Apunta tu cliente MCP a /api/mcp. Las herramientas anónimas responden sin token; las que tocan datos exigen autenticación.",
  "flow.b.title": "Descubre el servidor de autorización",
  "flow.b.body":
    "El cliente lee /.well-known/oauth-protected-resource (RFC 9728) y descubre el servidor OAuth 2.1 de Supabase.",
  "flow.c.title": "Autoriza y opera",
  "flow.c.body":
    "Tras el consentimiento y el intercambio PKCE, el Bearer token de Supabase viaja en cada llamada y RLS aplica el acceso por usuario.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  tag: "Model Context Protocol",
  title: "Connect your agents with an MCP server",
  subtitle:
    "SaaS Template ships a remote MCP server (Streamable HTTP) so AI assistants can read and act on your data — always with Postgres RLS enforced per user.",
  "endpoint.label": "Endpoint",
  "endpoint.note":
    "Stateless Streamable HTTP transport. Works with any MCP client (Claude, Cursor, IDEs, and your own agents).",
  "flow.tag": "Authentication",
  "flow.title": "Secure access over OAuth",
  "flow.a.title": "Connect the endpoint",
  "flow.a.body":
    "Point your MCP client at /api/mcp. Anonymous tools respond without a token; data-touching tools require authentication.",
  "flow.b.title": "Discover the authorization server",
  "flow.b.body":
    "The client reads /.well-known/oauth-protected-resource (RFC 9728) and discovers the Supabase OAuth 2.1 server.",
  "flow.c.title": "Authorize and operate",
  "flow.c.body":
    "After consent and the PKCE exchange, the Supabase Bearer token rides on every call and RLS enforces per-user access.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  tag: "Model Context Protocol",
  title: "Conecte seus agentes com um servidor MCP",
  subtitle:
    "O SaaS Template oferece um servidor MCP remoto (Streamable HTTP) para que assistentes de IA leiam e ajam sobre seus dados — sempre com as políticas RLS do Postgres aplicadas por usuário.",
  "endpoint.label": "Endpoint",
  "endpoint.note":
    "Transporte Streamable HTTP, sem estado. Funciona com qualquer cliente MCP (Claude, Cursor, IDEs e agentes próprios).",
  "flow.tag": "Autenticação",
  "flow.title": "Acesso seguro via OAuth",
  "flow.a.title": "Conecte o endpoint",
  "flow.a.body":
    "Aponte seu cliente MCP para /api/mcp. Ferramentas anônimas respondem sem token; as que tocam dados exigem autenticação.",
  "flow.b.title": "Descubra o servidor de autorização",
  "flow.b.body":
    "O cliente lê /.well-known/oauth-protected-resource (RFC 9728) e descobre o servidor OAuth 2.1 do Supabase.",
  "flow.c.title": "Autorize e opere",
  "flow.c.body":
    "Após o consentimento e a troca PKCE, o Bearer token do Supabase acompanha cada chamada e o RLS aplica o acesso por usuário.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
