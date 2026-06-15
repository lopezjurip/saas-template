"use client";

import { useClipboard } from "@packages/react-hooks/use-clipboard";
import { useRosetta } from "@packages/rosetta/use-rosetta";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card, CardContent } from "@packages/ui-common/shadcn/components/ui/card";
import { ArrowRight, Check, Copy, Terminal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

interface McpPromptCtaProps {
  endpoint: string;
  platformHref: Route;
}

/**
 * Renders the MCP landing CTA that copies an agent-ready setup prompt.
 * @example
 * <McpPromptCta endpoint="https://example.com/api/mcp" platformHref="/home" />
 */
export function McpPromptCta({ endpoint, platformHref }: McpPromptCtaProps) {
  const { t } = useRosetta(LOCALES);
  const { copy, copied, error } = useClipboard();
  const prompt = t("prompt", { endpoint });

  async function onCopyPrompt() {
    await copy(prompt);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Terminal aria-hidden="true" className="size-4" />
          </span>
          <div className="flex max-w-[56ch] flex-col gap-2">
            <h2 className="text-balance text-2xl font-semibold tracking-tight">{t("title")}</h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed">
          <code className="whitespace-pre-wrap font-mono">{prompt}</code>
        </pre>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" size="sm" className="cursor-pointer" onClick={onCopyPrompt}>
            {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
            {copied ? t("button.copied") : t("button.copy")}
          </Button>
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link href={platformHref}>
              {t("button.platform")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{t("error")}</p> : null}
      </CardContent>
    </Card>
  );
}

const LOCALE_ES = {
  title: "Pega este prompt en tu IA",
  subtitle:
    "El siguiente paso no es otro formulario: copia estas instrucciones y pídele a tu agente que configure o pruebe el MCP remoto.",
  prompt:
    "Configura un servidor MCP remoto para esta aplicación usando el endpoint {{endpoint}}.\n\nObjetivo: conecta tu cliente o agente de IA a ese servidor MCP, inicia el flujo OAuth cuando el cliente lo solicite y prueba las herramientas disponibles.\n\nDespués de conectarte:\n1. Ejecuta whoami para confirmar la identidad autenticada.\n2. Ejecuta list_tenants y list_organizations para revisar el acceso disponible.\n3. Si el usuario tiene permiso members_manage, prueba list_organization_members con una organización válida.\n\nTen en cuenta que cada llamada debe ejecutarse como el usuario autenticado; las políticas RLS de Postgres deciden qué datos puede ver o modificar.",
  "button.copy": "Copiar prompt para IA",
  "button.copied": "Prompt copiado",
  "button.platform": "Ir a la plataforma",
  error: "No se pudo copiar el prompt. Puedes seleccionarlo manualmente.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Paste this prompt into your AI",
  subtitle:
    "The next step is not another form: copy these instructions and ask your agent to configure or test the remote MCP server.",
  prompt:
    "Configure a remote MCP server for this application using the endpoint {{endpoint}}.\n\nGoal: connect your AI client or agent to that MCP server, start the OAuth flow when the client asks for it, and test the available tools.\n\nAfter connecting:\n1. Run whoami to confirm the authenticated identity.\n2. Run list_tenants and list_organizations to review available access.\n3. If the user has the members_manage permission, test list_organization_members with a valid organization.\n\nRemember that every call must run as the authenticated user; Postgres RLS policies decide which data can be viewed or modified.",
  "button.copy": "Copy AI prompt",
  "button.copied": "Prompt copied",
  "button.platform": "Go to the platform",
  error: "The prompt could not be copied. You can select it manually.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Cole este prompt na sua IA",
  subtitle:
    "O próximo passo não é outro formulário: copie estas instruções e peça ao seu agente para configurar ou testar o MCP remoto.",
  prompt:
    "Configure um servidor MCP remoto para esta aplicação usando o endpoint {{endpoint}}.\n\nObjetivo: conecte seu cliente ou agente de IA a esse servidor MCP, inicie o fluxo OAuth quando o cliente solicitar e teste as ferramentas disponíveis.\n\nDepois de conectar:\n1. Execute whoami para confirmar a identidade autenticada.\n2. Execute list_tenants e list_organizations para revisar o acesso disponível.\n3. Se o usuário tiver a permissão members_manage, teste list_organization_members com uma organização válida.\n\nLembre que cada chamada deve rodar como o usuário autenticado; as políticas RLS do Postgres decidem quais dados podem ser vistos ou modificados.",
  "button.copy": "Copiar prompt para IA",
  "button.copied": "Prompt copiado",
  "button.platform": "Ir para a plataforma",
  error: "Não foi possível copiar o prompt. Você pode selecioná-lo manualmente.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
