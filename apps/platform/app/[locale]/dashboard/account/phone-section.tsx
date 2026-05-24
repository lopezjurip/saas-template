"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { actionSendPhoneOtp, actionVerifyPhoneOtp } from "./actions";

const phoneSchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-().]/g, ""))
    .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Usa formato internacional, e.g. +56 9 90511003")),
});
type PhoneValues = z.infer<typeof phoneSchema>;

const codeSchema = z.object({
  token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos"),
});
type CodeValues = z.infer<typeof codeSchema>;

export function PhoneSection({ currentPhone }: { currentPhone: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });
  const codeForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { token: "" },
  });

  const reset = () => {
    setEditing(false);
    setSentTo(null);
    setServerError(null);
    phoneForm.reset({ phone: "" });
    codeForm.reset({ token: "" });
  };

  const onSendPhone = phoneForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await actionSendPhoneOtp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Formato de teléfono inválido");
      else setSentTo(values.phone);
    });
  });

  const onVerifyCode = codeForm.handleSubmit((values) => {
    if (!sentTo) return;
    setServerError(null);
    startTransition(async () => {
      const res = await actionVerifyPhoneOtp({ phone: sentTo, token: values.token });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Datos inválidos");
      else {
        reset();
        router.refresh();
      }
    });
  });

  if (!editing) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs">
          {currentPhone ? (
            <>
              Teléfono confirmado: <span className="text-foreground font-medium">{currentPhone}</span>.
            </>
          ) : (
            <>Aún no tienes un teléfono confirmado.</>
          )}
        </p>
        <Button type="button" variant="outline" onClick={() => setEditing(true)} className="w-fit">
          {currentPhone ? "Cambiar teléfono" : "Agregar teléfono"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!sentTo ? (
        <form onSubmit={onSendPhone} className="flex flex-col gap-3">
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
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? "Enviando código…" : "Enviar código"}
            </Button>
            <Button type="button" variant="ghost" onClick={reset} className="w-fit">
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={onVerifyCode} className="flex flex-col gap-3">
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
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? "Verificando…" : "Verificar"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSentTo(null)} className="w-fit">
              Cambiar número
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
