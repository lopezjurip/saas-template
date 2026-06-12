"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";

function RESOLVE_TARGET(locale: string, next: string): string {
  return next.startsWith("/") && next !== "/" ? next : `/${locale}/home`;
}

export function PasskeySignInButton({ next }: { next: string }) {
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    startTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError("Tu navegador no soporta passkeys.");
          return;
        }
        const supabase = createBrowserClient();
        const { error: err } = await supabase.auth.signInWithPasskey();
        if (err) throw err;
        await supabase.auth.refreshSession();
        router.push(ROUTE_HREF(UNSAFE_ROUTE(RESOLVE_TARGET(locale, next))));
        router.refresh();
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setError("Cancelaste el inicio con passkey.");
        } else if (e instanceof Error) {
          setError(e.message);
        }
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" onClick={onClick} disabled={pending} className="h-10 w-full gap-2.5">
        <Fingerprint size={18} />
        <span>{pending ? "Verificando…" : "Continuar con passkey"}</span>
      </Button>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}
