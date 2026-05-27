"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { useRosetta } from "~/hooks/use-rosetta";
import { createPasskey } from "~/lib/passkeys.client";

export function PasskeyStep() {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onEnroll = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError(t("no_support"));
          return;
        }
        await createPasskey();
        // Hook-injected claims update on session refresh — without this the next /onboarding
        // request still sees the old JWT and routes us back to the passkey step.
        const supabase = createBrowserClient();
        await supabase.auth.refreshSession();
        router.push(`/${locale}/onboarding`);
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setError(t("cancelled"));
        } else {
          setError(e instanceof Error ? e.message : t("unexpected_error"));
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">{t("heading")}</h2>
        <p className="text-muted-foreground mt-1 text-xs">{t("description")}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={onEnroll} disabled={pending} className="w-full">
        {pending ? t("enrolling") : t("create_passkey")}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link href={`/${locale}/onboarding?step=password`}>{t("skip_to_password")}</Link>
      </Button>
    </div>
  );
}

const LOCALE_ES = {
  heading: "Crea un passkey",
  description:
    "Un passkey reemplaza la contraseña. Usa tu huella, Face ID o llave de seguridad para entrar más rápido y de forma segura.",
  enrolling: "Registrando passkey…",
  create_passkey: "Crear passkey",
  skip_to_password: "Omitir y usar contraseña",
  no_support: "Tu navegador no soporta passkeys.",
  cancelled: "Cancelaste el registro del passkey.",
  unexpected_error: "Ocurrió un error inesperado.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Create a passkey",
  description:
    "A passkey replaces your password. Use your fingerprint, Face ID or security key to sign in faster and more securely.",
  enrolling: "Registering passkey…",
  create_passkey: "Create passkey",
  skip_to_password: "Skip and use password",
  no_support: "Your browser doesn't support passkeys.",
  cancelled: "You cancelled the passkey registration.",
  unexpected_error: "An unexpected error occurred.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Crie um passkey",
  description:
    "Um passkey substitui a senha. Use sua impressão digital, Face ID ou chave de segurança para entrar mais rápido e com segurança.",
  enrolling: "Registrando passkey…",
  create_passkey: "Criar passkey",
  skip_to_password: "Pular e usar senha",
  no_support: "Seu navegador não suporta passkeys.",
  cancelled: "Você cancelou o registro do passkey.",
  unexpected_error: "Ocorreu um erro inesperado.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
