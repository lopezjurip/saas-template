"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { sendLoginOtp, verifyLoginOtp } from "./actions";
import { type SendOtpValues, sendOtpSchema, type VerifyOtpValues, verifyOtpSchema } from "./schemas";

export function LoginForm({ defaultPhone }: { defaultPhone: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const phoneForm = useForm<SendOtpValues>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phone: defaultPhone },
  });
  const codeForm = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone: defaultPhone, token: "" },
  });

  const onSendOtp = phoneForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await sendLoginOtp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Formato de teléfono inválido");
      else if (res?.data?.phone) {
        setSentTo(res.data.phone);
        codeForm.setValue("phone", res.data.phone);
      }
    });
  });

  const onVerifyOtp = codeForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await verifyLoginOtp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Datos inválidos");
    });
  });

  if (sentTo) {
    return (
      <form onSubmit={onVerifyOtp} className="flex flex-col gap-4">
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
          {pending ? "Verificando…" : "Iniciar sesión"}
        </Button>
        <button
          type="button"
          className="text-muted-foreground text-center text-xs underline"
          onClick={() => {
            setSentTo(null);
            codeForm.reset({ phone: defaultPhone, token: "" });
          }}
        >
          Cambiar número
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSendOtp} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Número de teléfono</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+56 9 90511003"
          autoComplete="tel"
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
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enviando código…" : "Enviar código"}
      </Button>
    </form>
  );
}
