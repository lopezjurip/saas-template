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
import { actionSetPassword } from "../actions";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useRosetta(LOCALES);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, t("error_min_chars")),
          confirm: z.string(),
        })
        .refine((d) => d.password === d.confirm, { message: t("error_mismatch"), path: ["confirm"] }),
    [t],
  );
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      // void action → no data on success → ErrorSafeActionEmpty is the success shape.
      const [, error] = await ErrorSafeAction.unwrap(actionSetPassword({ password: values.password }));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError(t("error_invalid"));
      else {
        setSuccess(true);
        form.reset({ password: "", confirm: "" });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pw_new">{hasPassword ? t("label_new_password") : t("label_password")}</Label>
        <Input
          id="pw_new"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pw_confirm">{t("label_confirm")}</Label>
        <Input
          id="pw_confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={!!form.formState.errors.confirm}
          {...form.register("confirm")}
        />
        {form.formState.errors.confirm && (
          <p className="text-destructive text-xs">{form.formState.errors.confirm.message}</p>
        )}
      </div>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      {success && !serverError && <p className="text-muted-foreground text-xs">{t("saved")}</p>}
      <div className="mt-1 flex justify-end gap-2 border-t pt-2">
        <Button type="submit" disabled={pending} className="h-9">
          {pending ? t("saving") : hasPassword ? t("change_password") : t("create_password")}
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  label_new_password: "Nueva contraseña",
  label_password: "Contraseña",
  label_confirm: "Confirmar",
  error_min_chars: "Mínimo 8 caracteres",
  error_mismatch: "Las contraseñas no coinciden",
  error_invalid: "Contraseña inválida",
  error_save: "No pudimos guardar la contraseña",
  saved: "Guardado.",
  saving: "Guardando…",
  change_password: "Cambiar contraseña",
  create_password: "Crear contraseña",
};

const LOCALE_EN: typeof LOCALE_ES = {
  label_new_password: "New password",
  label_password: "Password",
  label_confirm: "Confirm",
  error_min_chars: "Minimum 8 characters",
  error_mismatch: "Passwords do not match",
  error_invalid: "Invalid password",
  error_save: "We couldn't save the password",
  saved: "Saved.",
  saving: "Saving…",
  change_password: "Change password",
  create_password: "Create password",
};

const LOCALE_PT: typeof LOCALE_ES = {
  label_new_password: "Nova senha",
  label_password: "Senha",
  label_confirm: "Confirmar",
  error_min_chars: "Mínimo 8 caracteres",
  error_mismatch: "As senhas não coincidem",
  error_invalid: "Senha inválida",
  error_save: "Não conseguimos salvar a senha",
  saved: "Salvo.",
  saving: "Salvando…",
  change_password: "Alterar senha",
  create_password: "Criar senha",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
