"use client";

import { useSupabase } from "@packages/supabase/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowRight, MessageCircle, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { OtpField } from "../_components/otp-field";

type Channel = "sms" | "whatsapp";

type Props = {
  phone: string;
  next: string;
  channels: Channel[];
};

/**
 * Phone path is OTP-only. Passkey sign-in is keyed by email in this system, so it is
 * not offered here even when the account has one — the email path covers passkey.
 */
export function PhoneStepForm({ phone, next, channels }: Props) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sentVia, setSentVia] = useState<Channel | null>(null);
  const [token, setToken] = useState("");

  function onSend(channel: Channel) {
    setError(null);
    startTransition(async () => {
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
      const { error: err } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
      if (err) {
        setError(t("error_otp"));
        return;
      }
      await supabase.auth.refreshSession();
      // Hand off to the post-auth router (onboarding-vs-next). It re-validates `next` server-side.
      router.push(ROUTE_HREF(UNSAFE_ROUTE("/auth/router", { next })));
      router.refresh();
    });
  }

  if (sentVia) {
    const channelLabel = sentVia === "whatsapp" ? t("channel_whatsapp") : t("channel_sms");
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="phone-otp"
          value={token}
          onChange={setToken}
          sentTo={
            <>
              {t("sent_to_prefix", { channel: channelLabel })}{" "}
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
          <span>{pending ? t("verifying") : t("verify")}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          onClick={() => setSentVia(null)}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("try_other")}
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
          <span>{pending ? t("sending") : t("send_whatsapp")}</span>
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
          <span>{pending ? t("sending") : t("send_sms")}</span>
        </Button>
      )}
    </div>
  );
}

const LOCALE_ES = {
  sent_to_prefix: "Enviado por {{channel}} a",
  channel_whatsapp: "WhatsApp",
  channel_sms: "SMS",
  verifying: "Verificando…",
  verify: "Verificar",
  try_other: "Probar otro método",
  sending: "Enviando…",
  send_whatsapp: "Enviar código por WhatsApp",
  send_sms: "Enviar código por SMS",
  error_otp: "Código incorrecto o expirado.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  sent_to_prefix: "Sent via {{channel}} to",
  channel_whatsapp: "WhatsApp",
  channel_sms: "SMS",
  verifying: "Verifying…",
  verify: "Verify",
  try_other: "Try another method",
  sending: "Sending…",
  send_whatsapp: "Send code via WhatsApp",
  send_sms: "Send code via SMS",
  error_otp: "Incorrect or expired code.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  sent_to_prefix: "Enviado via {{channel}} para",
  channel_whatsapp: "WhatsApp",
  channel_sms: "SMS",
  verifying: "A verificar…",
  verify: "Verificar",
  try_other: "Tentar outro método",
  sending: "A enviar…",
  send_whatsapp: "Enviar código por WhatsApp",
  send_sms: "Enviar código por SMS",
  error_otp: "Código incorreto ou expirado.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
