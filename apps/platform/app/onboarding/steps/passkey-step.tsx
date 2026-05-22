"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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

        const supabase = createBrowserClient();
        // biome-ignore lint/suspicious/noExplicitAny: WebAuthn MFA types still evolving in supabase-js
        const enroll = await (supabase.auth.mfa.enroll as any)({
          factorType: "webauthn",
          friendlyName: `Passkey ${new Date().toLocaleDateString("es-CL")}`,
        });

        if (enroll.error || !enroll.data?.id) {
          setError("No pudimos iniciar el registro del passkey.");
          return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: same
        const challenge = await (supabase.auth.mfa.challenge as any)({ factorId: enroll.data.id });
        if (challenge.error || !challenge.data) {
          setError("No pudimos generar el desafío de WebAuthn.");
          return;
        }

        // The challenge payload includes PublicKeyCredentialCreationOptions under `webauthn`.
        const publicKey = challenge.data.webauthn?.credential_creation_options ?? challenge.data.webauthn;
        if (!publicKey) {
          setError("Tu servidor de auth no soporta passkeys todavía.");
          return;
        }

        const credential = await navigator.credentials.create({ publicKey });
        if (!credential) {
          setError("Cancelaste el registro del passkey.");
          return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: same
        const verify = await (supabase.auth.mfa.verify as any)({
          factorId: enroll.data.id,
          challengeId: challenge.data.id,
          // Some SDK versions accept `code`, others `credential` — send both.
          code: JSON.stringify(credential),
          credential,
        });

        if (verify.error) {
          setError("No pudimos validar el passkey. Intenta de nuevo.");
          return;
        }

        await supabase.auth.refreshSession();
        router.push("/onboarding");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
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
