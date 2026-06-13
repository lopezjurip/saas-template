"use client";
import { useRosetta } from "@packages/rosetta/use-rosetta";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Listens for the browser's `beforeinstallprompt` event and exposes
 * `install` / `dismiss` actions. Returns `null` prompt when dismissed or
 * already suppressed via localStorage.
 */
export function usePwaInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem("pwa-dismissed")) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    setPrompt(null);
  }

  function dismiss() {
    localStorage.setItem("pwa-dismissed", "1");
    setPrompt(null);
  }

  return { prompt, install, dismiss };
}

/** Fixed bottom-right banner that prompts the user to install the PWA. */
export function PwaInstallBanner({ className, ...props }: ComponentProps<"div">) {
  const { prompt, install, dismiss } = usePwaInstall();
  const { t } = useRosetta(LOCALES);

  if (!prompt) return null;

  return (
    <div
      {...props}
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-lg",
        className,
      )}
    >
      <span className="text-sm">{t("install_app")}</span>
      <button
        className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
        onClick={install}
        type="button"
      >
        {t("install")}
      </button>
      <button className="text-xs text-muted-foreground" onClick={dismiss} type="button">
        {t("dismiss")}
      </button>
    </div>
  );
}

const LOCALE_ES = {
  install_app: "Instalar app",
  install: "Instalar",
  dismiss: "No gracias",
};
const LOCALES = {
  es: LOCALE_ES,
  en: {
    install_app: "Install app",
    install: "Install",
    dismiss: "No thanks",
  } satisfies typeof LOCALE_ES,
  pt: {
    install_app: "Instalar app",
    install: "Instalar",
    dismiss: "Não obrigado",
  } satisfies typeof LOCALE_ES,
};
