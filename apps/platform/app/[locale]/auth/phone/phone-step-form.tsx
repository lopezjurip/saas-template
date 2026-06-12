"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowRight, MessageCircle, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { OtpField } from "../_components/otp-field";

type Channel = "sms" | "whatsapp";

type Props = {
  phone: string;
  next: string;
  channels: Channel[];
};

function RESOLVE_TARGET(locale: string, next: string): string {
  return next.startsWith("/") && next !== "/" ? next : `/${locale}/home`;
}

/**
 * Phone path is OTP-only. Passkey sign-in is keyed by email in this system, so it is
 * not offered here even when the account has one — the email path covers passkey.
 */
export function PhoneStepForm({ phone, next, channels }: Props) {
  const router = useRouter();
  const locale = useLocaleParam();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sentVia, setSentVia] = useState<Channel | null>(null);
  const [token, setToken] = useState("");

  function onSend(channel: Channel) {
    setError(null);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true, channel },
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSentVia(channel);
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
      if (err) {
        setError("Código incorrecto o expirado.");
        return;
      }
      await supabase.auth.refreshSession();
      router.push(ROUTE_HREF(UNSAFE_ROUTE(RESOLVE_TARGET(locale, next))));
      router.refresh();
    });
  }

  if (sentVia) {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="phone-otp"
          value={token}
          onChange={setToken}
          sentTo={
            <>
              Enviado por {sentVia === "whatsapp" ? "WhatsApp" : "SMS"} a{" "}
              <strong className="font-medium text-foreground">{phone}</strong>.
            </>
          }
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending || token.length !== 6} className="h-10 w-full">
          <span>{pending ? "Verificando…" : "Verificar"}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          onClick={() => setSentVia(null)}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          Probar otro método
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {channels.includes("whatsapp") && (
        <Button type="button" onClick={() => onSend("whatsapp")} disabled={pending} className="h-10 w-full">
          <MessageCircle size={16} />
          <span>{pending ? "Enviando…" : "Enviar código por WhatsApp"}</span>
        </Button>
      )}

      {channels.includes("sms") && (
        <Button
          type="button"
          onClick={() => onSend("sms")}
          disabled={pending}
          variant={channels.includes("whatsapp") ? "outline" : "default"}
          className="h-10 w-full"
        >
          <Smartphone size={16} />
          <span>{pending ? "Enviando…" : "Enviar código por SMS"}</span>
        </Button>
      )}
    </div>
  );
}
