"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionSendPhoneOtp, actionVerifyPhoneOtp } from "../actions";

export function PhoneForm({ currentPhone }: { currentPhone: string | null }) {
  const { t } = useRosetta(LOCALES);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const phoneSchema = useMemo(
    () =>
      z.object({
        phone: z
          .string()
          .transform((v) => v.replace(/[\s\-().]/g, ""))
          .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, t("error_phone_format"))),
      }),
    [t],
  );
  type PhoneValues = z.infer<typeof phoneSchema>;

  const codeSchema = useMemo(() => z.object({ token: z.string().regex(/^\d{6}$/, t("error_code_format")) }), [t]);
  type CodeValues = z.infer<typeof codeSchema>;

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
      else if (error instanceof ErrorSafeActionValidation) setServerError(t("error_format_invalid"));
      else setSentTo(values.phone);
    });
  });

  const onVerify = codeForm.handleSubmit((values) => {
    if (!sentTo) return;
    setServerError(null);
    startTransition(async () => {
      const [, error] = await ErrorSafeAction.unwrap(actionVerifyPhoneOtp({ phone: sentTo, token: values.token }));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError(t("error_data_invalid"));
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
          <Label htmlFor="ph_code">{t("label_code_sent", { phone: sentTo })}</Label>
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
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={pending} className="h-9">
            {pending ? t("verifying") : t("verify")}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSendPhone} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ph_new">{t("label_new_number")}</Label>
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
          {pending ? t("sending") : t("send_code")}
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  label_code_sent: "Código enviado a {{phone}}",
  label_new_number: "Nuevo número",
  error_phone_format: "Formato de teléfono inválido",
  error_code_format: "Código de 6 dígitos",
  error_format_invalid: "Formato inválido",
  error_data_invalid: "Datos inválidos",
  cancel: "Cancelar",
  verifying: "Verificando…",
  verify: "Verificar",
  sending: "Enviando…",
  send_code: "Enviar código",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label_code_sent: "Code sent to {{phone}}",
  label_new_number: "New number",
  error_phone_format: "Invalid phone format",
  error_code_format: "6-digit code",
  error_format_invalid: "Invalid format",
  error_data_invalid: "Invalid data",
  cancel: "Cancel",
  verifying: "Verifying…",
  verify: "Verify",
  sending: "Sending…",
  send_code: "Send code",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label_code_sent: "Código enviado para {{phone}}",
  label_new_number: "Novo número",
  error_phone_format: "Formato de telefone inválido",
  error_code_format: "Código de 6 dígitos",
  error_format_invalid: "Formato inválido",
  error_data_invalid: "Dados inválidos",
  cancel: "Cancelar",
  verifying: "Verificando…",
  verify: "Verificar",
  sending: "Enviando…",
  send_code: "Enviar código",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
