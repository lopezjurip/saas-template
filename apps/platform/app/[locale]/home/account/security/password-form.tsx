"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { actionSetPassword } from "../actions";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });
type Values = z.infer<typeof schema>;

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await actionSetPassword({ password: values.password });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Contraseña inválida");
      else {
        setSuccess(true);
        form.reset({ password: "", confirm: "" });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="acc-form-row">
        <label className="sc-label" htmlFor="pw_new">
          {hasPassword ? "Nueva contraseña" : "Contraseña"}
        </label>
        <input
          id="pw_new"
          className="sc-input"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
        )}
      </div>
      <div className="acc-form-row">
        <label className="sc-label" htmlFor="pw_confirm">
          Confirmar
        </label>
        <input
          id="pw_confirm"
          className="sc-input"
          type="password"
          autoComplete="new-password"
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
      {success && !serverError && <p className="text-muted-foreground text-xs">Guardado.</p>}
      <div className="acc-form-foot">
        <button type="submit" disabled={pending} className="sc-btn sc-btn-primary" style={{ height: 36 }}>
          {pending ? "Guardando…" : hasPassword ? "Cambiar contraseña" : "Crear contraseña"}
        </button>
      </div>
    </form>
  );
}
