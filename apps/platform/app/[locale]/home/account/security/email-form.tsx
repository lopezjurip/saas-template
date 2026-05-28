"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { actionUpdateEmail } from "../actions";

const schema = z.object({ email: z.string().email("Correo inválido") });
type Values = z.infer<typeof schema>;

export function EmailForm({ currentEmail }: { currentEmail: string | null }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: currentEmail ?? "" } });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setPendingEmail(null);
    startTransition(async () => {
      const res = await actionUpdateEmail(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Correo inválido");
      else {
        setPendingEmail(values.email);
        form.reset({ email: values.email });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="acc-form-row">
        <label className="sc-label" htmlFor="new_email">
          Nuevo correo
        </label>
        <input
          id="new_email"
          className="sc-input"
          type="email"
          autoComplete="email"
          placeholder="tu@empresa.cl"
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
            Te enviamos un enlace de confirmación a {currentEmail} y a {pendingEmail}. Hasta que confirmes ambos, tu
            correo sigue siendo {currentEmail}.
          </AlertDescription>
        </Alert>
      )}
      <div className="acc-form-foot">
        <button type="submit" disabled={pending} className="sc-btn sc-btn-primary" style={{ height: 36 }}>
          {pending ? "Enviando…" : "Cambiar correo"}
        </button>
      </div>
    </form>
  );
}
