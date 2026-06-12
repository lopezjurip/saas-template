"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRosetta } from "~/hooks/use-rosetta";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionUpdateEmail } from "../actions";

export function EmailForm({ currentEmail }: { currentEmail: string | null }) {
  const { t } = useRosetta(LOCALES);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const schema = useMemo(() => z.object({ email: z.string().email(t("error_email_invalid")) }), [t]);
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: currentEmail ?? "" } });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setPendingEmail(null);
    startTransition(async () => {
      // void action → no data on success → ErrorSafeActionEmpty is the success shape.
      const [, error] = await ErrorSafeAction.unwrap(actionUpdateEmail(values));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError(t("error_email_invalid"));
      else {
        setPendingEmail(values.email);
        form.reset({ email: values.email });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new_email">{t("label_email")}</Label>
        <Input
          id="new_email"
          type="email"
          autoComplete="email"
          placeholder={t("placeholder_email")}
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
        )}
      </div>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      {pendingEmail && !serverError && (
        <Alert>
          <AlertDescription>
            {t("confirm_sent", { current: currentEmail ?? "", pending: pendingEmail })}
          </AlertDescription>
        </Alert>
      )}
      <div className="mt-1 flex justify-end gap-2 border-t pt-2">
        <Button type="submit" disabled={pending} className="h-9">
          {pending ? t("sending") : t("change_email")}
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  label_email: "Nuevo correo",
  placeholder_email: "tu@empresa.cl",
  error_email_invalid: "Correo inválido",
  confirm_sent:
    "Te enviamos un enlace de confirmación a {{current}} y a {{pending}}. Hasta que confirmes ambos, tu correo sigue siendo {{current}}.",
  sending: "Enviando…",
  change_email: "Cambiar correo",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label_email: "New email",
  placeholder_email: "you@company.com",
  error_email_invalid: "Invalid email",
  confirm_sent:
    "We sent a confirmation link to {{current}} and {{pending}}. Until you confirm both, your email remains {{current}}.",
  sending: "Sending…",
  change_email: "Change email",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label_email: "Novo e-mail",
  placeholder_email: "voce@empresa.com",
  error_email_invalid: "E-mail inválido",
  confirm_sent:
    "Enviamos um link de confirmação para {{current}} e {{pending}}. Até confirmar ambos, seu e-mail continua sendo {{current}}.",
  sending: "Enviando…",
  change_email: "Alterar e-mail",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
