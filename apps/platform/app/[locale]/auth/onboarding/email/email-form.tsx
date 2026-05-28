"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingEmailOtp } from "~/hooks/use-onboarding";

const emailSchema = z.object({
  email: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.email("Correo inválido")),
});
type EmailValues = z.infer<typeof emailSchema>;

const codeSchema = z.object({ token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos") });
type CodeValues = z.infer<typeof codeSchema>;

export function EmailForm({ defaultEmail }: { defaultEmail: string }) {
  const { sendEmailOtp, verifyEmailOtp, error, pending } = useOnboardingEmailOtp();
  const [sentTo, setSentTo] = useState<string | null>(null);

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
        <div>
          <label className="sc-label" htmlFor="email-code">
            Código enviado a {sentTo}
          </label>
          <input
            id="email-code"
            className="sc-input"
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
        <button type="submit" disabled={pending} className="sc-btn sc-btn-primary sc-btn-block">
          <span>{pending ? "Verificando…" : "Verificar"}</span>
          <ArrowRight size={16} />
        </button>
        <button type="button" className="sc-back" onClick={() => setSentTo(null)}>
          Cambiar correo
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSendEmail} className="flex flex-col gap-4">
      <div>
        <label className="sc-label" htmlFor="email-input">
          Correo
        </label>
        <div className="sc-input-icon-wrap">
          <span className="sc-input-icon">
            <Mail size={16} />
          </span>
          <input
            id="email-input"
            className="sc-input"
            type="email"
            placeholder="tu@empresa.cl"
            autoComplete="email"
            aria-invalid={!!emailForm.formState.errors.email}
            {...emailForm.register("email")}
          />
        </div>
        {emailForm.formState.errors.email && (
          <p className="text-destructive text-xs mt-1">{emailForm.formState.errors.email.message}</p>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <button type="submit" disabled={pending} className="sc-btn sc-btn-primary sc-btn-block">
        <Mail size={15} />
        <span>{pending ? "Enviando…" : "Enviar código"}</span>
      </button>
    </form>
  );
}
