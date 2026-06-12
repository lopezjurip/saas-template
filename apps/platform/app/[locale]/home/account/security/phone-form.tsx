"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionSendPhoneOtp, actionVerifyPhoneOtp } from "../actions";

const phoneSchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-().]/g, ""))
    .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Formato de teléfono inválido")),
});
type PhoneValues = z.infer<typeof phoneSchema>;
const codeSchema = z.object({ token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos") });
type CodeValues = z.infer<typeof codeSchema>;

export function PhoneForm({ currentPhone }: { currentPhone: string | null }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: currentPhone ?? "" },
  });
  const codeForm = useForm<CodeValues>({ resolver: zodResolver(codeSchema), defaultValues: { token: "" } });

  const onSendPhone = phoneForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      // void action → no data on success → ErrorSafeActionEmpty is the success shape.
      const [, error] = await ErrorSafeAction.unwrap(actionSendPhoneOtp(values));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError("Formato inválido");
      else setSentTo(values.phone);
    });
  });

  const onVerify = codeForm.handleSubmit((values) => {
    if (!sentTo) return;
    setServerError(null);
    startTransition(async () => {
      const [, error] = await ErrorSafeAction.unwrap(actionVerifyPhoneOtp({ phone: sentTo, token: values.token }));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError("Datos inválidos");
      else {
        setSentTo(null);
        codeForm.reset({ token: "" });
      }
    });
  });

  if (sentTo) {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ph_code">Código enviado a {sentTo}</Label>
          <Input
            id="ph_code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="123456"
            aria-invalid={!!codeForm.formState.errors.token}
            {...codeForm.register("token")}
          />
        </div>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <div className="mt-1 flex justify-end gap-2 border-t pt-2">
          <Button type="button" variant="ghost" className="h-9" onClick={() => setSentTo(null)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending} className="h-9">
            {pending ? "Verificando…" : "Verificar"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSendPhone} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ph_new">Nuevo número</Label>
        <Input
          id="ph_new"
          type="tel"
          autoComplete="tel"
          placeholder="+56 9 1234 5678"
          aria-invalid={!!phoneForm.formState.errors.phone}
          {...phoneForm.register("phone")}
        />
        {phoneForm.formState.errors.phone && (
          <p className="text-destructive text-xs">{phoneForm.formState.errors.phone.message}</p>
        )}
      </div>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <div className="mt-1 flex justify-end gap-2 border-t pt-2">
        <Button type="submit" disabled={pending} className="h-9">
          {pending ? "Enviando…" : "Enviar código"}
        </Button>
      </div>
    </form>
  );
}
