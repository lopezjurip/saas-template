"use client";

import { useClipboard } from "@packages/react-hooks/use-clipboard";
import { useRosetta } from "@packages/rosetta/use-rosetta";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card, CardContent } from "@packages/ui-common/shadcn/components/ui/card";
import { Check, Copy, ListChecks, MessageSquare, ShieldCheck } from "lucide-react";
import { McpPromptCta } from "~/components/mcp/mcp-prompt-cta";

interface McpConnectProps {
  /** Full MCP endpoint, e.g. `https://example.com/api/mcp`. Computed server-side from APP_URL. */
  endpoint: string;
}

/**
 * Self-contained MCP connection section reused across the tenant, agency, and profile surfaces.
 * The MCP server is global per-user (single endpoint, OAuth, RLS by JWT), so the same component
 * fits every surface. Shows the endpoint with a copy button, an agent-ready prompt, a plain-language
 * 3-step tutorial, and a few use cases for non-technical users.
 * @example <McpConnect endpoint="https://lvh.me:7003/api/mcp" />
 */
export function McpConnect({ endpoint }: McpConnectProps) {
  const { t } = useRosetta(LOCALES);
  const { copy, copied } = useClipboard();

  const steps = [t("step.a"), t("step.b"), t("step.c")];
  const useCases = [
    { Icon: MessageSquare, body: t("use.a") },
    { Icon: ListChecks, body: t("use.b") },
    { Icon: ShieldCheck, body: t("use.c") },
  ];

  return (
    <div className="flex flex-col gap-4.5">
      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
          <span className="text-tiny font-semibold uppercase tracking-widest text-muted-foreground">
            {t("endpoint.label")}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block w-full overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm">
              {endpoint}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 cursor-pointer"
              onClick={() => copy(endpoint)}
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
              {copied ? t("endpoint.copied") : t("endpoint.copy")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{t("endpoint.note")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-base font-semibold tracking-tight">{t("steps.title")}</h2>
          <ol className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                  {i + 1}
                </span>
                <span className="text-pretty text-sm leading-relaxed text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <McpPromptCta endpoint={endpoint} />

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-base font-semibold tracking-tight">{t("uses.title")}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {useCases.map((useCase) => (
              <li key={useCase.body} className="flex flex-col gap-2 rounded-lg border p-3">
                <useCase.Icon aria-hidden="true" className="size-4.5 text-muted-foreground" />
                <span className="text-pretty text-sm leading-relaxed text-muted-foreground">{useCase.body}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

const LOCALE_ES = {
  "endpoint.label": "Endpoint",
  "endpoint.copy": "Copiar",
  "endpoint.copied": "Copiado",
  "endpoint.note":
    "Pega esta dirección en tu cliente de IA (Claude, Cursor o tu propio agente). Te pedirá iniciar sesión una vez y listo.",
  "steps.title": "Cómo conectarte en 3 pasos",
  "step.a": "Copia el endpoint de arriba.",
  "step.b": "Pégalo donde tu IA pide un “servidor MCP” (en Claude o Cursor, en su configuración de conexiones).",
  "step.c": "Cuando te lo pida, autoriza con tu cuenta. Tu IA solo verá lo que tú puedes ver.",
  "uses.title": "Qué puedes pedirle a tu IA",
  "use.a": "“¿A qué organizaciones pertenezco?” — responde con tus tenants y organizaciones.",
  "use.b": "“Resume los miembros de mi organización” — si tienes permiso para gestionarlos.",
  "use.c": "Todo corre con tu identidad: nadie ve datos que tú no puedas ver.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  "endpoint.label": "Endpoint",
  "endpoint.copy": "Copy",
  "endpoint.copied": "Copied",
  "endpoint.note":
    "Paste this address into your AI client (Claude, Cursor, or your own agent). It will ask you to sign in once and that's it.",
  "steps.title": "Connect in 3 steps",
  "step.a": "Copy the endpoint above.",
  "step.b": "Paste it where your AI asks for an “MCP server” (in Claude or Cursor, under their connections settings).",
  "step.c": "When prompted, authorize with your account. Your AI will only see what you can see.",
  "uses.title": "What you can ask your AI",
  "use.a": "“Which organizations do I belong to?” — answers with your tenants and organizations.",
  "use.b": "“Summarize my organization's members” — if you have permission to manage them.",
  "use.c": "Everything runs as you: no one sees data you can't see.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  "endpoint.label": "Endpoint",
  "endpoint.copy": "Copiar",
  "endpoint.copied": "Copiado",
  "endpoint.note":
    "Cole este endereço no seu cliente de IA (Claude, Cursor ou seu próprio agente). Ele pedirá login uma vez e pronto.",
  "steps.title": "Conecte em 3 passos",
  "step.a": "Copie o endpoint acima.",
  "step.b": "Cole onde sua IA pede um “servidor MCP” (no Claude ou Cursor, nas configurações de conexões).",
  "step.c": "Quando solicitado, autorize com sua conta. Sua IA só verá o que você pode ver.",
  "uses.title": "O que você pode pedir à sua IA",
  "use.a": "“A quais organizações eu pertenço?” — responde com seus tenants e organizações.",
  "use.b": "“Resuma os membros da minha organização” — se você tiver permissão para gerenciá-los.",
  "use.c": "Tudo roda como você: ninguém vê dados que você não pode ver.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
