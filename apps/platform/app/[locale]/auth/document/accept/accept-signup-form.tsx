"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import { ErrorSafeAction } from "~/lib/safe-action.client";
import { OtpField } from "../../_components/otp-field";
import { actionStartDocumentSignup, actionVerifyDocumentSignup } from "./actions";

type Channel = "sms" | "email";

export function AcceptSignupForm({ token }: { token: string }) {
  const { t } = useRosetta(LOCALES);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [contactInput, setContactInput] = useState("");
  const [sent, setSent] = useState<{ channel: Channel; contact: string } | null>(null);
  const [otp, setOtp] = useState("");

  function onStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const [result, err] = await ErrorSafeAction.unwrap(
        actionStartDocumentSignup({
          invitation_token: token,
          full_name: fullName,
          channel,
          phone: channel === "sms" ? contactInput : "",
          email: channel === "email" ? contactInput : "",
        }),
      );
      if (err) {
        setError(err.message);
        return;
      }
      setSent({ channel: result.channel, contact: result.contact });
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!sent) return;
    setError(null);
    startTransition(async () => {
      /**
       * Verifies and redirects server-side to the org / home on success.
       */
      const [, err] = await ErrorSafeAction.unwrap(
        actionVerifyDocumentSignup({
          invitation_token: token,
          channel: sent.channel,
          contact: sent.contact,
          token: otp,
        }),
      );
      if (err) setError(t("error_otp"));
    });
  }

  if (sent) {
    const channelLabel = sent.channel === "sms" ? t("channel_sms") : t("channel_email");
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4">
        <OtpField
          id="accept-otp"
          value={otp}
          onChange={setOtp}
          sentTo={
            <>
              {t("sent_to_prefix", { channel: channelLabel })}{" "}
              <strong className="font-medium text-foreground">{sent.contact}</strong>.
            </>
          }
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending || otp.length !== 6} className="h-10 w-full">
          <span>{pending ? t("verifying") : t("accept_invite")}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="self-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("change_details")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onStart} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="accept-name">{t("label_name")}</Label>
        <Input
          id="accept-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-10"
          placeholder={t("placeholder_name")}
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        {(["email", "sms"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setChannel(c);
              setContactInput("");
            }}
            data-active={channel === c}
            className={cn(
              "h-8 rounded text-sm/normal font-medium text-muted-foreground transition-colors",
              "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm",
            )}
          >
            {c === "email" ? t("tab_email") : t("tab_sms")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="accept-contact">{channel === "email" ? t("label_email") : t("label_phone")}</Label>
        <Input
          id="accept-contact"
          value={contactInput}
          onChange={(e) => setContactInput(e.target.value)}
          className="h-10"
          type={channel === "email" ? "email" : "tel"}
          placeholder={channel === "email" ? t("placeholder_email") : t("placeholder_phone")}
          autoComplete={channel === "email" ? "email" : "tel"}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={pending || fullName.trim().length < 2 || contactInput.trim().length < 3}
        className="h-10 w-full"
      >
        <span>{pending ? t("sending") : t("send_code")}</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  sent_to_prefix: "Enviado por {{channel}} a",
  channel_sms: "SMS",
  channel_email: "correo",
  verifying: "Verificando…",
  accept_invite: "Aceptar invitación",
  change_details: "Cambiar datos",
  label_name: "Tu nombre completo",
  placeholder_name: "María Pérez",
  tab_email: "Correo",
  tab_sms: "Teléfono",
  label_email: "Correo",
  label_phone: "Teléfono",
  placeholder_email: "tu@empresa.cl",
  placeholder_phone: "+56 9 1234 5678",
  sending: "Enviando…",
  send_code: "Enviar código",
  error_otp: "Código incorrecto o expirado.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  sent_to_prefix: "Sent via {{channel}} to",
  channel_sms: "SMS",
  channel_email: "email",
  verifying: "Verifying…",
  accept_invite: "Accept invitation",
  change_details: "Change details",
  label_name: "Your full name",
  placeholder_name: "Jane Doe",
  tab_email: "Email",
  tab_sms: "Phone",
  label_email: "Email",
  label_phone: "Phone",
  placeholder_email: "you@company.com",
  placeholder_phone: "+56 9 1234 5678",
  sending: "Sending…",
  send_code: "Send code",
  error_otp: "Incorrect or expired code.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  sent_to_prefix: "Enviado via {{channel}} para",
  channel_sms: "SMS",
  channel_email: "e-mail",
  verifying: "A verificar…",
  accept_invite: "Aceitar convite",
  change_details: "Alterar dados",
  label_name: "O seu nome completo",
  placeholder_name: "Maria Silva",
  tab_email: "E-mail",
  tab_sms: "Telefone",
  label_email: "E-mail",
  label_phone: "Telefone",
  placeholder_email: "voce@empresa.com",
  placeholder_phone: "+56 9 1234 5678",
  sending: "A enviar…",
  send_code: "Enviar código",
  error_otp: "Código incorreto ou expirado.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
