"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { useRosetta } from "~/lib/i18n.client";
import { createPasskey } from "~/lib/passkeys.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";

export function PasskeyForm({ email }: { email: string }) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onEnroll() {
    setError(null);
    startTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError(t("error_no_support"));
          return;
        }
        await createPasskey();
        const supabase = createBrowserClient();
        await supabase.auth.refreshSession();
        router.push(ROUTE_HREF(ROUTE("/[locale]/auth/onboarding", { locale })));
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setError(t("error_cancelled"));
        } else {
          setError(e instanceof Error ? e.message : t("error_unexpected"));
        }
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-[48px_1fr] items-center gap-3.5 rounded-md border bg-muted/35 p-3.5">
        <div className="inline-flex size-12 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-transparent text-muted-foreground/40">
          <Fingerprint size={28} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{t("info_account")}</span>
            <strong className="min-w-0 truncate text-right font-medium text-foreground">{email || "—"}</strong>
          </div>
          <div className="flex justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{t("info_device")}</span>
            <strong className="min-w-0 truncate text-right font-medium text-foreground">
              {t("info_device_value")}
            </strong>
          </div>
          <div className="flex justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{t("info_syncs_with")}</span>
            <strong className="min-w-0 truncate text-right font-medium text-foreground">{t("info_syncs_value")}</strong>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="button" onClick={onEnroll} disabled={pending} className="h-10 w-full">
        <Fingerprint size={15} />
        <span>{pending ? t("enrolling") : t("enroll")}</span>
      </Button>

      <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">{t("hint_add_more")}</p>
    </>
  );
}

const LOCALE_ES = {
  error_no_support: "Tu navegador no soporta passkeys.",
  error_cancelled: "Cancelaste el registro del passkey.",
  error_unexpected: "Ocurrió un error inesperado.",
  info_account: "Cuenta",
  info_device: "Dispositivo",
  info_device_value: "Este navegador",
  info_syncs_with: "Se sincroniza con",
  info_syncs_value: "tu llavero del sistema",
  enrolling: "Registrando…",
  enroll: "Crear passkey en este dispositivo",
  hint_add_more: "Podrás agregar llaves de acceso desde tu cuenta más adelante.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    error_no_support: "Your browser does not support passkeys.",
    error_cancelled: "You cancelled the passkey registration.",
    error_unexpected: "An unexpected error occurred.",
    info_account: "Account",
    info_device: "Device",
    info_device_value: "This browser",
    info_syncs_with: "Syncs with",
    info_syncs_value: "your system keychain",
    enrolling: "Registering…",
    enroll: "Create passkey on this device",
    hint_add_more: "You can add more access keys from your account later.",
  } satisfies typeof LOCALE_ES,
  pt: {
    error_no_support: "Seu navegador não suporta passkeys.",
    error_cancelled: "Você cancelou o registro do passkey.",
    error_unexpected: "Ocorreu um erro inesperado.",
    info_account: "Conta",
    info_device: "Dispositivo",
    info_device_value: "Este navegador",
    info_syncs_with: "Sincroniza com",
    info_syncs_value: "seu chaveiro do sistema",
    enrolling: "Registrando…",
    enroll: "Criar passkey neste dispositivo",
    hint_add_more: "Você pode adicionar mais chaves de acesso pela sua conta mais tarde.",
  } satisfies typeof LOCALE_ES,
};
