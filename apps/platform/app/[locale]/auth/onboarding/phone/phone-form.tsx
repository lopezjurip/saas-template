"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingPhoneOtp } from "~/hooks/use-onboarding";

const phoneSchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-().]/g, ""))
    .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Usa formato internacional, e.g. +56 9 12345678")),
});
type PhoneValues = z.infer<typeof phoneSchema>;

const codeSchema = z.object({ token: z.string().regex(/^\d{6}$/, "Código de 6 dígitos") });
type CodeValues = z.infer<typeof codeSchema>;

export function PhoneForm({ defaultPhone }: { defaultPhone: string }) {
  const { sendPhoneOtp, verifyPhoneOtp, error, pending } = useOnboardingPhoneOtp();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: defaultPhone ? `+${defaultPhone.replace(/^\+/, "")}` : "" },
  });
  const codeForm = useForm<CodeValues>({ resolver: zodResolver(codeSchema), defaultValues: { token: "" } });

  const onSendPhone = phoneForm.handleSubmit(async (values) => {
    const res = await sendPhoneOtp(values.phone);
    if (!res?.serverError) {
      setSentTo(values.phone);
    }
  });

  const onVerifyCode = codeForm.handleSubmit(async (values) => {
    if (!sentTo) return;
    await verifyPhoneOtp(sentTo, values.token);
  });

  if (sentTo) {
    return (
      <form onSubmit={onVerifyCode} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone-code">Código enviado a {sentTo}</Label>
          <Input
            id="phone-code"
            className="h-10"
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
          Cambiar número
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSendPhone} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone-number">Número de teléfono</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex">
            <Phone size={16} />
          </span>
          <Input
            id="phone-number"
            className="h-10 pl-9"
            type="tel"
            placeholder="+56 9 1234 5678"
            autoComplete="tel"
            aria-invalid={!!phoneForm.formState.errors.phone}
            {...phoneForm.register("phone")}
          />
        </div>
        {phoneForm.formState.errors.phone && (
          <p className="text-destructive text-xs">{phoneForm.formState.errors.phone.message}</p>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="h-10 w-full">
        <span>{pending ? "Enviando…" : "Enviar código"}</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
