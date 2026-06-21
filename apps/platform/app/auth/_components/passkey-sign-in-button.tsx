"use client";

import { useSupabase } from "@packages/supabase/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
export function PasskeySignInButton({ next }: { next: string }) {
  const router = useRouter();
  const supabase = useSupabase();
  const { t } = useRosetta(LOCALES);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    startTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError(t("unsupported"));
          return;
        }
        const { error: err } = await supabase.auth.signInWithPasskey();
        if (err) throw err;
        await supabase.auth.refreshSession();
        router.push(`/auth/router?next=${encodeURIComponent(next)}`);
        router.refresh();
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setError(t("cancelled"));
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
        <span>{pending ? t("verifying") : t("label")}</span>
      </Button>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}

const LOCALE_ES = {
  unsupported: "Tu navegador no soporta passkeys.",
  cancelled: "Cancelaste el inicio con passkey.",
  verifying: "Verificando…",
  label: "Continuar con passkey",
};

const LOCALE_EN: typeof LOCALE_ES = {
  unsupported: "Your browser does not support passkeys.",
  cancelled: "You cancelled the passkey sign-in.",
  verifying: "Verifying…",
  label: "Continue with passkey",
};

const LOCALE_PT: typeof LOCALE_ES = {
  unsupported: "Seu navegador não suporta passkeys.",
  cancelled: "Você cancelou o login com passkey.",
  verifying: "Verificando…",
  label: "Continuar com passkey",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
