"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPasskey } from "~/lib/passkeys.client";

export function PasskeyStep() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onEnroll = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError("Tu navegador no soporta passkeys.");
          return;
        }
        await createPasskey();
        // Hook-injected claims update on session refresh — without this the next /onboarding
        // request still sees the old JWT and routes us back to the passkey step.
        const supabase = createBrowserClient();
        await supabase.auth.refreshSession();
        router.push("/onboarding");
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setError("Cancelaste el registro del passkey.");
        } else {
          setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">Crea un passkey</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Un passkey reemplaza la contraseña. Usa tu huella, Face ID o llave de seguridad para entrar más rápido y de
          forma segura.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={onEnroll} disabled={pending} className="w-full">
        {pending ? "Registrando passkey…" : "Crear passkey"}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link href="/onboarding?step=password">Omitir y usar contraseña</Link>
      </Button>
    </div>
  );
}
