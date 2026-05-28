"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
      const res = await actionSendPhoneOtp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Formato inválido");
      else setSentTo(values.phone);
    });
  });

  const onVerify = codeForm.handleSubmit((values) => {
    if (!sentTo) return;
    setServerError(null);
    startTransition(async () => {
      const res = await actionVerifyPhoneOtp({ phone: sentTo, token: values.token });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Datos inválidos");
      else {
        setSentTo(null);
        codeForm.reset({ token: "" });
      }
    });
  });

  if (sentTo) {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-3">
        <div className="acc-form-row">
          <label className="sc-label" htmlFor="ph_code">
            Código enviado a {sentTo}
          </label>
          <input
            id="ph_code"
            className="sc-input"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            aria-invalid={!!codeForm.formState.errors.token}
            {...codeForm.register("token")}
          />
        </div>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <div className="acc-form-foot">
          <button type="button" className="sc-btn sc-btn-ghost" style={{ height: 36 }} onClick={() => setSentTo(null)}>
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="sc-btn sc-btn-primary" style={{ height: 36 }}>
            {pending ? "Verificando…" : "Verificar"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSendPhone} className="flex flex-col gap-3">
      <div className="acc-form-row">
        <label className="sc-label" htmlFor="ph_new">
          Nuevo número
        </label>
        <input
          id="ph_new"
          className="sc-input"
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
      <div className="acc-form-foot">
        <button type="submit" disabled={pending} className="sc-btn sc-btn-primary" style={{ height: 36 }}>
          {pending ? "Enviando…" : "Enviar código"}
        </button>
      </div>
    </form>
  );
}
