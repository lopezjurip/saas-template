"use client";

import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { type LucideIcon, RotateCcw, Search, TriangleAlert, Wrench } from "lucide-react";
import { useLocaleParam } from "~/hooks/use-locale-param";

type SystemKind = "notFound" | "error" | "maintenance";

type SystemDef = { code: string; Icon: LucideIcon };

const DEFS: Record<SystemKind, SystemDef> = /*#__PURE__*/ {
  notFound: { code: "404", Icon: Search },
  error: { code: "500", Icon: TriangleAlert },
  maintenance: { code: "503", Icon: Wrench },
};

export function SystemMessage({ kind = "notFound", reset }: { kind?: SystemKind; reset?: () => void }) {
  const locale = useLocaleParam();
  const { code, Icon } = DEFS[kind];
  const copy = RESOLVE_COPY(locale)[kind];
  const homeHref = `/${locale}`;

  return (
    <div
      className="font-sans relative flex min-h-svh w-full items-center justify-center px-5 py-10"
      style={{
        background:
          "radial-gradient(ellipse at top, hsl(var(--muted) / 0.55), transparent 60%), hsl(var(--background))",
      }}
    >
      <Logo className="absolute left-6 top-5 text-sm" />

      <div className="flex max-w-105 flex-col items-center gap-5 text-center">
        <div className="relative inline-flex items-center justify-center">
          <span className="text-muted/70 select-none font-mono text-8xl font-semibold leading-none tracking-[-0.04em]">
            {code}
          </span>
          <span className="absolute inset-0 inline-flex items-center justify-center">
            <span className="bg-background border-border text-foreground inline-flex size-12 items-center justify-center rounded-2xl border shadow-[0_1px_3px_hsl(0_0%_0%/0.06)]">
              <Icon size={22} />
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground m-0 text-xl font-semibold tracking-[-0.02em] text-balance">{copy.title}</h1>
          <p className="text-muted-foreground m-0 text-sm leading-[1.55] text-pretty">{copy.desc}</p>
        </div>

        <div className="flex items-center gap-2">
          {kind === "notFound" ? (
            <Button asChild className="h-9">
              <a href={homeHref}>{copy.primary}</a>
            </Button>
          ) : (
            <Button className="h-9" onClick={() => (reset ? reset() : window.location.reload())}>
              <RotateCcw size={15} /> {copy.primary}
            </Button>
          )}
          {kind === "notFound" ? (
            <Button variant="outline" className="h-9" onClick={() => window.history.back()}>
              {copy.secondary}
            </Button>
          ) : (
            <Button asChild variant="outline" className="h-9">
              <a href={homeHref}>{copy.secondary}</a>
            </Button>
          )}
        </div>

        {kind === "error" ? (
          <code className="text-muted-foreground/70 mt-1 font-mono text-xs">ref: 7f2c8a3b</code>
        ) : null}
      </div>
    </div>
  );
}

type Copy = { title: string; desc: string; primary: string; secondary: string };

function RESOLVE_COPY(locale: string): Record<SystemKind, Copy> {
  if (locale.startsWith("en")) return LOCALE_EN;
  if (locale.startsWith("pt")) return LOCALE_PT;
  return LOCALE_ES;
}

const LOCALE_ES: Record<SystemKind, Copy> = {
  notFound: {
    title: "Esta página no existe",
    desc: "El enlace está roto o la página se movió. Revisa la dirección o vuelve a un lugar conocido.",
    primary: "Ir al inicio",
    secondary: "Volver atrás",
  },
  error: {
    title: "Algo se rompió de nuestro lado",
    desc: "No es por ti. Ya registramos el problema y lo estamos viendo. Intenta de nuevo en un momento.",
    primary: "Reintentar",
    secondary: "Ir al inicio",
  },
  maintenance: {
    title: "Estamos en mantenimiento",
    desc: "Hacemos una mejora corta. Volvemos en unos minutos — tus datos están a salvo.",
    primary: "Reintentar",
    secondary: "Ir al inicio",
  },
};

const LOCALE_EN = {
  notFound: {
    title: "This page doesn't exist",
    desc: "The link is broken or the page moved. Check the address or head back somewhere familiar.",
    primary: "Go home",
    secondary: "Go back",
  },
  error: {
    title: "Something broke on our side",
    desc: "It's not you. We've logged the problem and we're on it. Try again in a moment.",
    primary: "Retry",
    secondary: "Go home",
  },
  maintenance: {
    title: "We're under maintenance",
    desc: "We're shipping a quick improvement. Back in a few minutes — your data is safe.",
    primary: "Retry",
    secondary: "Go home",
  },
} satisfies typeof LOCALE_ES;

const LOCALE_PT = {
  notFound: {
    title: "Esta página não existe",
    desc: "O link está quebrado ou a página foi movida. Verifique o endereço ou volte para um lugar conhecido.",
    primary: "Ir para o início",
    secondary: "Voltar",
  },
  error: {
    title: "Algo quebrou do nosso lado",
    desc: "Não é você. Já registramos o problema e estamos cuidando dele. Tente novamente em um momento.",
    primary: "Tentar de novo",
    secondary: "Ir para o início",
  },
  maintenance: {
    title: "Estamos em manutenção",
    desc: "Estamos fazendo uma melhoria curta. Voltamos em alguns minutos — seus dados estão seguros.",
    primary: "Tentar de novo",
    secondary: "Ir para o início",
  },
} satisfies typeof LOCALE_ES;
