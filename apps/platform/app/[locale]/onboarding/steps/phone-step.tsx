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
import { sendPhoneOtp, verifyPhoneOtp } from "./phone-action";

// Strip whitespace, dashes, dots, parens before E.164 validation — users naturally type "+56 9 9051 1003".
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

const NEXT_HREF = NEXT_STEP_HREF("phone");

export function PhoneStep() {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const locale = useLocaleParam();
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

  const onSendPhone = phoneForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await sendPhoneOtp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError(t("invalid_phone"));
      else setSentTo(values.phone);
    });
  });

  const onVerifyCode = codeForm.handleSubmit((values) => {
    if (!sentTo) return;
    setServerError(null);
    startTransition(async () => {
      const res = await verifyPhoneOtp({ phone: sentTo, token: values.token });
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
        <form onSubmit={onSendPhone} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{t("phone_label")}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("phone_placeholder")}
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
            {t("change_phone")}
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
  heading: "Confirma tu teléfono",
  description: "Te lo pediremos para autenticarte y enviarte notificaciones importantes.",
  phone_label: "Número de teléfono",
  phone_placeholder: "+56 9 90511003",
  sending: "Enviando código…",
  send_code: "Enviar código",
  code_sent_to: "Código enviado a {{to}}",
  verifying: "Verificando…",
  verify: "Verificar",
  change_phone: "Cambiar número",
  skip: "Omitir por ahora",
  invalid_phone: "Formato de teléfono inválido",
  invalid_data: "Datos inválidos",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Confirm your phone",
  description: "We'll ask for it to authenticate you and send important notifications.",
  phone_label: "Phone number",
  phone_placeholder: "+1 555 0000000",
  sending: "Sending code…",
  send_code: "Send code",
  code_sent_to: "Code sent to {{to}}",
  verifying: "Verifying…",
  verify: "Verify",
  change_phone: "Change number",
  skip: "Skip for now",
  invalid_phone: "Invalid phone format",
  invalid_data: "Invalid data",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Confirme seu telefone",
  description: "Pediremos para autenticá-lo e enviar notificações importantes.",
  phone_label: "Número de telefone",
  phone_placeholder: "+55 11 900000000",
  sending: "Enviando código…",
  send_code: "Enviar código",
  code_sent_to: "Código enviado para {{to}}",
  verifying: "Verificando…",
  verify: "Verificar",
  change_phone: "Alterar número",
  skip: "Pular por agora",
  invalid_phone: "Formato de telefone inválido",
  invalid_data: "Dados inválidos",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
