"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRosetta } from "~/hooks/use-rosetta";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionStartDocumentSignup, actionVerifyDocumentSignup } from "./actions";
import { type SendOtpValues, sendOtpSchema, type VerifyOtpValues, verifyOtpSchema } from "./schemas";

const LOCALE_ES = {
  form_invalid: "Formulario inválido",
  invalid_code: "Código inválido",
  otp_sent_to: "Te enviamos un código a",
  code_label: "Código de 6 dígitos",
  verifying: "Verificando…",
  accept_invitation: "Aceptar invitación",
  change_contact: "Cambiar contacto",
  full_name_label: "Nombre completo",
  by_phone: "Por teléfono",
  by_email: "Por correo",
  phone_label: "Teléfono",
  email_label: "Correo",
  sending: "Enviando código…",
  continue: "Continuar",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    form_invalid: "Invalid form",
    invalid_code: "Invalid code",
    otp_sent_to: "We sent a code to",
    code_label: "6-digit code",
    verifying: "Verifying…",
    accept_invitation: "Accept invitation",
    change_contact: "Change contact",
    full_name_label: "Full name",
    by_phone: "By phone",
    by_email: "By email",
    phone_label: "Phone",
    email_label: "Email",
    sending: "Sending code…",
    continue: "Continue",
  } satisfies typeof LOCALE_ES,
  pt: {
    form_invalid: "Formulário inválido",
    invalid_code: "Código inválido",
    otp_sent_to: "Enviamos um código para",
    code_label: "Código de 6 dígitos",
    verifying: "Verificando…",
    accept_invitation: "Aceitar convite",
    change_contact: "Trocar contato",
    full_name_label: "Nome completo",
    by_phone: "Por telefone",
    by_email: "Por e-mail",
    phone_label: "Telefone",
    email_label: "E-mail",
    sending: "Enviando código…",
    continue: "Continuar",
  } satisfies typeof LOCALE_ES,
};

export function AcceptForm({ token, defaultEmail }: { token: string; defaultEmail: string }) {
  const { t } = useRosetta(LOCALES);
  const [serverError, setServerError] = useState<string | null>(null);
  const [otpInfo, setOtpInfo] = useState<{ channel: "sms" | "email"; contact: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const sendForm = useForm<SendOtpValues>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      invitation_token: token,
      full_name: "",
      channel: defaultEmail ? "email" : "sms",
      phone: "",
      email: defaultEmail,
    },
  });

  const verifyForm = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { invitation_token: token, channel: "sms", contact: "", token: "" },
  });

  const channel = sendForm.watch("channel");

  const onSubmitSend = sendForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const [data, error] = await ErrorSafeAction.unwrap(actionStartDocumentSignup(values));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError(t("form_invalid"));
      else if (data) {
        const { channel: ch, contact } = data;
        setOtpInfo({ channel: ch, contact });
        verifyForm.reset({ invitation_token: token, channel: ch, contact, token: "" });
      }
    });
  });

  const onSubmitVerify = verifyForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      // success path redirects server-side; only failures return here.
      const [, error] = await ErrorSafeAction.unwrap(actionVerifyDocumentSignup(values));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError(t("invalid_code"));
    });
  });

  if (otpInfo) {
    return (
      <form onSubmit={onSubmitVerify} className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          {t("otp_sent_to")} <span className="font-medium">{otpInfo.contact}</span>.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="token">{t("code_label")}</Label>
          <Input
            id="token"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            aria-invalid={!!verifyForm.formState.errors.token}
            {...verifyForm.register("token")}
          />
          {verifyForm.formState.errors.token && (
            <p className="text-destructive text-xs">{verifyForm.formState.errors.token.message}</p>
          )}
        </div>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("verifying") : t("accept_invitation")}
        </Button>
        <button
          type="button"
          className="text-muted-foreground text-center text-xs underline"
          onClick={() => setOtpInfo(null)}
        >
          {t("change_contact")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitSend} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">{t("full_name_label")}</Label>
        <Input
          id="full_name"
          autoComplete="name"
          aria-invalid={!!sendForm.formState.errors.full_name}
          {...sendForm.register("full_name")}
        />
        {sendForm.formState.errors.full_name && (
          <p className="text-destructive text-xs">{sendForm.formState.errors.full_name.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={channel === "sms" ? "default" : "outline"}
          className="flex-1"
          onClick={() => sendForm.setValue("channel", "sms")}
        >
          {t("by_phone")}
        </Button>
        <Button
          type="button"
          variant={channel === "email" ? "default" : "outline"}
          className="flex-1"
          onClick={() => sendForm.setValue("channel", "email")}
        >
          {t("by_email")}
        </Button>
      </div>

      {channel === "sms" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{t("phone_label")}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+56 9 ..."
            autoComplete="tel"
            aria-invalid={!!sendForm.formState.errors.phone}
            {...sendForm.register("phone")}
          />
          {sendForm.formState.errors.phone && (
            <p className="text-destructive text-xs">{String(sendForm.formState.errors.phone.message)}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("email_label")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!sendForm.formState.errors.email}
            {...sendForm.register("email")}
          />
          {sendForm.formState.errors.email && (
            <p className="text-destructive text-xs">{String(sendForm.formState.errors.email.message)}</p>
          )}
        </div>
      )}

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("sending") : t("continue")}
      </Button>
    </form>
  );
}
