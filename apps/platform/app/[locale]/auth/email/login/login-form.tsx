"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { DevMailboxNotice } from "~/components/dev-mailbox-notice";
import { useRosetta } from "~/hooks/use-rosetta";
import { signInWithPasskey } from "~/lib/passkeys.client";
import { sendMagicLink, signInWithPassword, verifyMagicOtp } from "./actions";
import { type LoginValues, loginSchema, type VerifyMagicOtpValues, verifyMagicOtpSchema } from "./schemas";

export function LoginForm({ defaultEmail, hasPasskey }: { defaultEmail: string; hasPasskey: boolean }) {
  const { t } = useRosetta(LOCALES);
  const [serverError, setServerError] = useState<string | null>(null);
  const [magicSentTo, setMagicSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [magicPending, startMagicTransition] = useTransition();
  const [otpPending, startOtpTransition] = useTransition();
  const [passkeyPending, startPasskeyTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: "" },
  });

  const otpForm = useForm<VerifyMagicOtpValues>({
    resolver: zodResolver(verifyMagicOtpSchema),
    defaultValues: { email: defaultEmail, token: "" },
  });

  const anyPending = pending || magicPending || passkeyPending || otpPending;

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setMagicSentTo(null);
    startTransition(async () => {
      const res = await signInWithPassword(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError(t("invalid_form"));
    });
  });

  const onMagicLink = () => {
    setServerError(null);
    setMagicSentTo(null);
    startMagicTransition(async () => {
      const email = form.getValues("email");
      const res = await sendMagicLink({ email });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError(t("invalid_email"));
      else if (res?.data?.sentTo) {
        setMagicSentTo(res.data.sentTo);
        otpForm.reset({ email: res.data.sentTo, token: "" });
      }
    });
  };

  const onVerifyOtp = otpForm.handleSubmit((values) => {
    setServerError(null);
    startOtpTransition(async () => {
      const res = await verifyMagicOtp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError(t("invalid_code"));
    });
  });

  const onPasskey = () => {
    setServerError(null);
    setMagicSentTo(null);
    startPasskeyTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setServerError(t("no_passkey_support"));
          return;
        }
        await signInWithPasskey(form.getValues("email"));
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setServerError(t("passkey_cancelled"));
        } else {
          setServerError(e instanceof Error ? e.message : t("unexpected_error"));
        }
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {hasPasskey && (
        <>
          <Button type="button" onClick={onPasskey} disabled={anyPending} className="w-full">
            {passkeyPending ? t("passkey_verifying") : t("passkey_signin")}
          </Button>
          <div className="relative">
            <Separator />
            <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase">
              {t("divider_or")}
            </span>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email_label")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password_label")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {magicSentTo && (
        <>
          <Alert>
            <AlertDescription>{t("magic_link_sent", { email: magicSentTo })}</AlertDescription>
          </Alert>
          <DevMailboxNotice email={magicSentTo} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="magic-token">{t("magic_code_label")}</Label>
            <Input
              id="magic-token"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-invalid={!!otpForm.formState.errors.token}
              {...otpForm.register("token")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void onVerifyOtp();
                }
              }}
            />
            {otpForm.formState.errors.token && (
              <p className="text-destructive text-xs">{otpForm.formState.errors.token.message}</p>
            )}
          </div>
          <Button type="button" onClick={() => onVerifyOtp()} disabled={anyPending} className="w-full">
            {otpPending ? t("verifying") : t("verify_code")}
          </Button>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={anyPending} variant={hasPasskey ? "outline" : "default"} className="w-full">
          {pending ? t("signing_in") : t("signin")}
        </Button>
        <Button type="button" variant="outline" onClick={onMagicLink} disabled={anyPending} className="w-full">
          {magicPending ? t("sending") : magicSentTo ? t("resend_magic_link") : t("send_magic_link")}
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  passkey_verifying: "Verificando passkey…",
  passkey_signin: "Iniciar sesión con passkey",
  divider_or: "o",
  email_label: "Correo electrónico",
  password_label: "Contraseña",
  magic_link_sent:
    "Te enviamos un enlace mágico a {{email}}. Haz clic en el enlace o ingresa el código de 6 dígitos abajo.",
  magic_code_label: "Código del correo",
  verifying: "Verificando…",
  verify_code: "Verificar código",
  signing_in: "Iniciando…",
  signin: "Iniciar sesión",
  sending: "Enviando…",
  resend_magic_link: "Reenviar enlace mágico",
  send_magic_link: "Enviarme un enlace mágico",
  invalid_form: "Formulario inválido",
  invalid_email: "Correo inválido",
  invalid_code: "Código inválido",
  no_passkey_support: "Tu navegador no soporta passkeys.",
  passkey_cancelled: "Cancelaste el inicio de sesión con passkey.",
  unexpected_error: "Error inesperado",
};

const LOCALE_EN: typeof LOCALE_ES = {
  passkey_verifying: "Verifying passkey…",
  passkey_signin: "Sign in with passkey",
  divider_or: "or",
  email_label: "Email address",
  password_label: "Password",
  magic_link_sent: "We sent a magic link to {{email}}. Click the link or enter the 6-digit code below.",
  magic_code_label: "Code from email",
  verifying: "Verifying…",
  verify_code: "Verify code",
  signing_in: "Signing in…",
  signin: "Sign in",
  sending: "Sending…",
  resend_magic_link: "Resend magic link",
  send_magic_link: "Send me a magic link",
  invalid_form: "Invalid form",
  invalid_email: "Invalid email",
  invalid_code: "Invalid code",
  no_passkey_support: "Your browser doesn't support passkeys.",
  passkey_cancelled: "You cancelled the passkey sign-in.",
  unexpected_error: "Unexpected error",
};

const LOCALE_PT: typeof LOCALE_ES = {
  passkey_verifying: "Verificando passkey…",
  passkey_signin: "Entrar com passkey",
  divider_or: "ou",
  email_label: "Endereço de e-mail",
  password_label: "Senha",
  magic_link_sent: "Enviamos um link mágico para {{email}}. Clique no link ou insira o código de 6 dígitos abaixo.",
  magic_code_label: "Código do e-mail",
  verifying: "Verificando…",
  verify_code: "Verificar código",
  signing_in: "Entrando…",
  signin: "Entrar",
  sending: "Enviando…",
  resend_magic_link: "Reenviar link mágico",
  send_magic_link: "Enviar um link mágico",
  invalid_form: "Formulário inválido",
  invalid_email: "E-mail inválido",
  invalid_code: "Código inválido",
  no_passkey_support: "Seu navegador não suporta passkeys.",
  passkey_cancelled: "Você cancelou o login com passkey.",
  unexpected_error: "Erro inesperado",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
