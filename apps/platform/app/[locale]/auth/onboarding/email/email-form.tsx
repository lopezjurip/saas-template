"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingEmailOtp } from "~/hooks/use-onboarding";
import { useRosetta } from "~/lib/i18n.client";

export function EmailForm({ defaultEmail }: { defaultEmail: string }) {
  const { t } = useRosetta(LOCALES);
  const { sendEmailOtp, verifyEmailOtp, error, pending } = useOnboardingEmailOtp();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailSchema = z.object({
    email: z
      .string()
      .transform((v) => v.trim().toLowerCase())
      .pipe(z.email(t("email_invalid"))),
  });
  type EmailValues = z.infer<typeof emailSchema>;

  const codeSchema = z.object({ token: z.string().regex(/^\d{6}$/, t("code_invalid")) });
  type CodeValues = z.infer<typeof codeSchema>;

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail },
  });
  const codeForm = useForm<CodeValues>({ resolver: zodResolver(codeSchema), defaultValues: { token: "" } });

  const onSendEmail = emailForm.handleSubmit(async (values) => {
    const res = await sendEmailOtp(values.email);
    if (!res?.serverError) {
      setSentTo(values.email);
    }
  });

  const onVerifyCode = codeForm.handleSubmit(async (values) => {
    if (!sentTo) return;
    await verifyEmailOtp(sentTo, values.token);
  });

  if (sentTo) {
    return (
      <form onSubmit={onVerifyCode} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email-code">{t("code_sent_to", { email: sentTo })}</Label>
          <Input
            id="email-code"
            className="h-10"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            aria-invalid={!!codeForm.formState.errors.token}
            {...codeForm.register("token")}
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending} className="h-10 w-full">
          <span>{pending ? t("verifying") : t("verify")}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 self-start -ml-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setSentTo(null)}
        >
          {t("change_email")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSendEmail} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email-input">{t("label_email")}</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex">
            <Mail size={16} />
          </span>
          <Input
            id="email-input"
            className="h-10 pl-9"
            type="email"
            placeholder={t("placeholder_email")}
            autoComplete="email"
            aria-invalid={!!emailForm.formState.errors.email}
            {...emailForm.register("email")}
          />
        </div>
        {emailForm.formState.errors.email && (
          <p className="text-destructive text-xs">{emailForm.formState.errors.email.message}</p>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="h-10 w-full">
        <Mail size={15} />
        <span>{pending ? t("sending") : t("send_code")}</span>
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  email_invalid: "Correo inválido",
  code_invalid: "Código de 6 dígitos",
  label_email: "Correo",
  placeholder_email: "tu@empresa.cl",
  code_sent_to: "Código enviado a {{email}}",
  verifying: "Verificando…",
  verify: "Verificar",
  change_email: "Cambiar correo",
  sending: "Enviando…",
  send_code: "Enviar código",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    email_invalid: "Invalid email",
    code_invalid: "6-digit code",
    label_email: "Email",
    placeholder_email: "you@company.com",
    code_sent_to: "Code sent to {{email}}",
    verifying: "Verifying…",
    verify: "Verify",
    change_email: "Change email",
    sending: "Sending…",
    send_code: "Send code",
  } satisfies typeof LOCALE_ES,
  pt: {
    email_invalid: "E-mail inválido",
    code_invalid: "Código de 6 dígitos",
    label_email: "E-mail",
    placeholder_email: "voce@empresa.com.br",
    code_sent_to: "Código enviado para {{email}}",
    verifying: "Verificando…",
    verify: "Verificar",
    change_email: "Alterar e-mail",
    sending: "Enviando…",
    send_code: "Enviar código",
  } satisfies typeof LOCALE_ES,
};
