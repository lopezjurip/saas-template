"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";
import { type SignupValues, signupSchema } from "./schemas";

export function SignupForm({ defaultEmail }: { defaultEmail: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: "", email: defaultEmail, password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await signUp(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Formulario inválido");
      else if (res?.data?.email) setSentTo(res.data.email);
    });
  });

  if (sentTo) {
    const mailbox = process.env.NEXT_PUBLIC_DEV_MAILBOX_URL;
    return (
      <div className="flex flex-col gap-3">
        <Alert>
          <AlertDescription>
            Te enviamos un correo a <strong>{sentTo}</strong> para confirmar tu cuenta. Haz clic en el enlace para
            continuar.
          </AlertDescription>
        </Alert>
        {mailbox ? (
          <div className="flex flex-col gap-1.5 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-yellow-900">
            <p className="text-xs font-semibold uppercase tracking-wide">Development only</p>
            <a href={mailbox} target="_blank" rel="noreferrer" className="text-sm underline">
              Abrir bandeja de entrada local
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input
          id="full_name"
          autoComplete="name"
          aria-invalid={!!form.formState.errors.full_name}
          {...form.register("full_name")}
        />
        {form.formState.errors.full_name && (
          <p className="text-destructive text-xs">{form.formState.errors.full_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
