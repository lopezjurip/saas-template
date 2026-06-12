"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
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

  if (!prompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-lg">
      <span className="text-sm">Instalar app</span>
      <button
        className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
        onClick={async () => {
          await prompt.prompt();
          setPrompt(null);
        }}
        type="button"
      >
        Instalar
      </button>
      <button
        className="text-xs text-muted-foreground"
        onClick={() => {
          localStorage.setItem("pwa-dismissed", "1");
          setPrompt(null);
        }}
        type="button"
      >
        No gracias
      </button>
    </div>
  );
}
