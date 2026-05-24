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
      else if (res?.validationErrors) setServerError("Correo inválido");
      else setSentTo(values.email);
    });
  });

  const onVerifyCode = codeForm.handleSubmit((values) => {
    if (!sentTo) return;
    setServerError(null);
    startTransition(async () => {
      const res = await verifyEmailOtp({ email: sentTo, token: values.token });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Datos inválidos");
      else router.push(`/${locale}${NEXT_HREF}`);
    });
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">Agrega tu correo</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Lo usaremos para enviarte notificaciones importantes y como respaldo de inicio de sesión.
        </p>
      </div>

      {!sentTo ? (
        <form onSubmit={onSendEmail} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@empresa.cl"
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
            {pending ? "Enviando código…" : "Enviar código"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerifyCode} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="token">Código enviado a {sentTo}</Label>
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
            {pending ? "Verificando…" : "Verificar"}
          </Button>
          <button
            type="button"
            className="text-muted-foreground text-center text-xs underline"
            onClick={() => setSentTo(null)}
          >
            Cambiar correo
          </button>
        </form>
      )}

      <Button asChild variant="ghost" className="w-full">
        <Link href={`/${locale}${NEXT_HREF}`}>Omitir por ahora</Link>
      </Button>
    </div>
  );
}
