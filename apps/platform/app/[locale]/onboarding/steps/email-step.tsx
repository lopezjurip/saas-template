"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { useRosetta } from "~/hooks/use-rosetta";
import { NEXT_STEP_HREF } from "../state";
import { sendEmailOtp, verifyEmailOtp } from "./email-action";

const emailSchema = z.object({
  email: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.email("Correo inválido")),
});
type EmailValues = z.infer<typeof emailSchema>;

const codeSchema = z.object({
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});
type CodeValues = z.infer<typeof codeSchema>;

const NEXT_HREF = NEXT_STEP_HREF("email");

export function EmailStep() {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const locale = useLocaleParam();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const codeForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { token: "" },
  });

  const onSendEmail = emailForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await sendEmailOtp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError(t("invalid_email"));
      else setSentTo(values.email);
    });
  });

  const onVerifyCode = codeForm.handleSubmit((values) => {
    if (!sentTo) return;
    setServerError(null);
    startTransition(async () => {
      const res = await verifyEmailOtp({ email: sentTo, token: values.token });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError(t("invalid_data"));
      else router.push(`/${locale}${NEXT_HREF}`);
    });
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">{t("heading")}</h2>
        <p className="text-muted-foreground mt-1 text-xs">{t("description")}</p>
      </div>

      {!sentTo ? (
        <form onSubmit={onSendEmail} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("email_label")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("email_placeholder")}
              autoComplete="email"
              aria-invalid={!!emailForm.formState.errors.email}
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p className="text-destructive text-xs">{emailForm.formState.errors.email.message}</p>
            )}
          </div>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("sending") : t("send_code")}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerifyCode} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="token">{t("code_sent_to", { to: sentTo })}</Label>
            <Input
              id="token"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-invalid={!!codeForm.formState.errors.token}
              {...codeForm.register("token")}
            />
            {codeForm.formState.errors.token && (
              <p className="text-destructive text-xs">{codeForm.formState.errors.token.message}</p>
            )}
          </div>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("verifying") : t("verify")}
          </Button>
          <button
            type="button"
            className="text-muted-foreground text-center text-xs underline"
            onClick={() => setSentTo(null)}
          >
            {t("change_email")}
          </button>
        </form>
      )}

      <Button asChild variant="ghost" className="w-full">
        <Link href={`/${locale}${NEXT_HREF}`}>{t("skip")}</Link>
      </Button>
    </div>
  );
}

const LOCALE_ES = {
  heading: "Agrega tu correo",
  description: "Lo usaremos para enviarte notificaciones importantes y como respaldo de inicio de sesión.",
  email_label: "Correo electrónico",
  email_placeholder: "tu@empresa.cl",
  sending: "Enviando código…",
  send_code: "Enviar código",
  code_sent_to: "Código enviado a {{to}}",
  verifying: "Verificando…",
  verify: "Verificar",
  change_email: "Cambiar correo",
  skip: "Omitir por ahora",
  invalid_email: "Correo inválido",
  invalid_data: "Datos inválidos",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Add your email",
  description: "We'll use it to send you important notifications and as a sign-in backup.",
  email_label: "Email address",
  email_placeholder: "you@company.com",
  sending: "Sending code…",
  send_code: "Send code",
  code_sent_to: "Code sent to {{to}}",
  verifying: "Verifying…",
  verify: "Verify",
  change_email: "Change email",
  skip: "Skip for now",
  invalid_email: "Invalid email",
  invalid_data: "Invalid data",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Adicione seu e-mail",
  description: "Usaremos para enviar notificações importantes e como backup de login.",
  email_label: "Endereço de e-mail",
  email_placeholder: "voce@empresa.com",
  sending: "Enviando código…",
  send_code: "Enviar código",
  code_sent_to: "Código enviado para {{to}}",
  verifying: "Verificando…",
  verify: "Verificar",
  change_email: "Alterar e-mail",
  skip: "Pular por agora",
  invalid_email: "E-mail inválido",
  invalid_data: "Dados inválidos",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
