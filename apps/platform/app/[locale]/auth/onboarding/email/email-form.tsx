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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email-code">Código enviado a {sentTo}</Label>
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
          <span>{pending ? "Verificando…" : "Verificar"}</span>
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 self-start -ml-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setSentTo(null)}
        >
          Cambiar correo
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSendEmail} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email-input">Correo</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex">
            <Mail size={16} />
          </span>
          <Input
            id="email-input"
            className="h-10 pl-9"
            type="email"
            placeholder="tu@empresa.cl"
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
        <span>{pending ? "Enviando…" : "Enviar código"}</span>
      </Button>
    </form>
  );
}
