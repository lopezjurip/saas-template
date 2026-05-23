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
        // supabase-js's MFA types don't expose WebAuthn yet; we narrow to a structural shape we know works at runtime.
        type WebAuthnEnroll = (args: {
          factorType: "webauthn";
          friendlyName: string;
        }) => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
        type WebAuthnChallenge = (args: { factorId: string }) => Promise<{
          data: {
            id: string;
            webauthn?:
              | PublicKeyCredentialCreationOptions
              | { credential_creation_options?: PublicKeyCredentialCreationOptions };
          } | null;
          error: { message: string } | null;
        }>;
        type WebAuthnVerify = (args: {
          factorId: string;
          challengeId: string;
          code: string;
          credential: Credential;
        }) => Promise<{ error: { message: string } | null }>;

        const mfa = supabase.auth.mfa as unknown as {
          enroll: WebAuthnEnroll;
          challenge: WebAuthnChallenge;
          verify: WebAuthnVerify;
        };

        const enroll = await mfa.enroll({
          factorType: "webauthn",
          friendlyName: `Passkey ${new Date().toLocaleDateString("es-CL")}`,
        });

        if (enroll.error || !enroll.data?.id) {
          setError("No pudimos iniciar el registro del passkey.");
          return;
        }

        const challenge = await mfa.challenge({ factorId: enroll.data.id });
        if (challenge.error || !challenge.data) {
          setError("No pudimos generar el desafío de WebAuthn.");
          return;
        }

        // The challenge payload includes PublicKeyCredentialCreationOptions under `webauthn` —
        // some SDK builds nest it under `credential_creation_options`.
        const webauthn = challenge.data.webauthn;
        const publicKey: PublicKeyCredentialCreationOptions | undefined =
          webauthn && "credential_creation_options" in webauthn
            ? webauthn.credential_creation_options
            : (webauthn as PublicKeyCredentialCreationOptions | undefined);
        if (!publicKey) {
          setError("Tu servidor de auth no soporta passkeys todavía.");
          return;
        }

        const credential = await navigator.credentials.create({ publicKey });
        if (!credential) {
          setError("Cancelaste el registro del passkey.");
          return;
        }

        const verify = await mfa.verify({
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
