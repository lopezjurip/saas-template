"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { DevMailboxNotice } from "~/components/dev-mailbox-notice";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { signInWithPasskey } from "~/lib/passkeys.client";
import { sendMagicLink, signInWithPassword } from "./actions";
import { type LoginValues, loginSchema } from "./schemas";

export function LoginForm({ defaultEmail, hasPasskey }: { defaultEmail: string; hasPasskey: boolean }) {
  const locale = useLocaleParam();
  const [serverError, setServerError] = useState<string | null>(null);
  const [magicSentTo, setMagicSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [magicPending, startMagicTransition] = useTransition();
  const [passkeyPending, startPasskeyTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: "" },
  });

  const anyPending = pending || magicPending || passkeyPending;

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setMagicSentTo(null);
    startTransition(async () => {
      const res = await signInWithPassword(values);
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Formulario inválido");
    });
  });

  const onMagicLink = () => {
    setServerError(null);
    setMagicSentTo(null);
    startMagicTransition(async () => {
      const email = form.getValues("email");
      const res = await sendMagicLink({ email });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError("Correo inválido");
      else if (res?.data?.sentTo) setMagicSentTo(res.data.sentTo);
    });
  };

  const onPasskey = () => {
    setServerError(null);
    setMagicSentTo(null);
    startPasskeyTransition(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setServerError("Tu navegador no soporta passkeys.");
          return;
        }
        await signInWithPasskey(form.getValues("email"));
        // Hard navigation guarantees the new session cookies are sent on the next request —
        // a client-side router.push can race ahead of the cookie write.
        window.location.href = `/${locale}/dashboard`;
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setServerError("Cancelaste el inicio de sesión con passkey.");
        } else {
          setServerError(e instanceof Error ? e.message : "Error inesperado");
        }
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {hasPasskey && (
        <>
          <Button type="button" onClick={onPasskey} disabled={anyPending} className="w-full">
            {passkeyPending ? "Verificando passkey…" : "Iniciar sesión con passkey"}
          </Button>
          <div className="relative">
            <Separator />
            <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase">
              o
            </span>
          </div>
        </>
      )}

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

      {magicSentTo && (
        <>
          <Alert>
            <AlertDescription>Te enviamos un enlace mágico. Revisa tu correo.</AlertDescription>
          </Alert>
          <DevMailboxNotice email={magicSentTo} />
        </>
      )}

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={anyPending} variant={hasPasskey ? "outline" : "default"} className="w-full">
          {pending ? "Iniciando…" : "Iniciar sesión"}
        </Button>
        <Button type="button" variant="outline" onClick={onMagicLink} disabled={anyPending} className="w-full">
          {magicPending ? "Enviando…" : "Enviarme un enlace mágico"}
        </Button>
      </div>
    </form>
  );
}
