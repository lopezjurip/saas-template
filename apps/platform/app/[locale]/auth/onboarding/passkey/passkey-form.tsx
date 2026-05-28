"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { createPasskey } from "~/lib/passkeys.client";

export function PasskeyForm({ email }: { email: string }) {
  const router = useRouter();
  const locale = useLocaleParam();
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
        const supabase = createBrowserClient();
        await supabase.auth.refreshSession();
        router.push(`/${locale}/auth/onboarding`);
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
    <>
      <div className="ob-passkey-card">
        <div className="ob-passkey-icon">
          <Fingerprint size={28} />
        </div>
        <div className="ob-passkey-body">
          <div className="ob-passkey-line">
            <span>Cuenta</span>
            <strong>{email || "—"}</strong>
          </div>
          <div className="ob-passkey-line">
            <span>Dispositivo</span>
            <strong>Este navegador</strong>
          </div>
          <div className="ob-passkey-line">
            <span>Se sincroniza con</span>
            <strong>tu llavero del sistema</strong>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <button type="button" onClick={onEnroll} disabled={pending} className="sc-btn sc-btn-primary sc-btn-block">
        <Fingerprint size={15} />
        <span>{pending ? "Registrando…" : "Crear passkey en este dispositivo"}</span>
      </button>

      <p className="sc-hint text-center mt-1">
        Podrás agregar más passkeys (otro celular, una llave física) desde tu cuenta.
      </p>
    </>
  );
}
