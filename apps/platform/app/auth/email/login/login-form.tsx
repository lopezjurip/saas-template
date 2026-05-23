"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { sendMagicLink, signInWithPassword } from "./actions";
import { type LoginValues, loginSchema } from "./schemas";

export function LoginForm({ defaultEmail }: { defaultEmail: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [magicPending, startMagicTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setMagicSent(false);
    startTransition(async () => {
      const res = await signInWithPassword(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Formulario inválido");
    });
  });

  const onMagicLink = () => {
    setServerError(null);
    setMagicSent(false);
    startMagicTransition(async () => {
      const email = form.getValues("email");
      const res = await sendMagicLink({ email });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Correo inválido");
      else if (res?.data) setMagicSent(true);
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
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

      {magicSent && (
        <Alert>
          <AlertDescription>Te enviamos un enlace mágico. Revisa tu correo.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={pending || magicPending} className="w-full">
          {pending ? "Iniciando…" : "Iniciar sesión"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onMagicLink}
          disabled={pending || magicPending}
          className="w-full"
        >
          {magicPending ? "Enviando…" : "Enviarme un enlace mágico"}
        </Button>
      </div>
    </form>
  );
}
