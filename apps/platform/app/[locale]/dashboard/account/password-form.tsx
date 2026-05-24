"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { actionSetPassword } from "./actions";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });
type Values = z.infer<typeof schema>;

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!hasPassword);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

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
        setEditing(false);
        router.refresh();
      }
    });
  });

  if (hasPassword && !editing) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs">Tienes una contraseña configurada.</p>
        {success && <p className="text-muted-foreground text-xs">Contraseña actualizada.</p>}
        <Button type="button" variant="outline" onClick={() => setEditing(true)} className="w-fit">
          Cambiar contraseña
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {!hasPassword && (
        <p className="text-muted-foreground text-xs">
          Te permitirá iniciar sesión con tu correo cuando no tengas passkey a mano.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{hasPassword ? "Nueva contraseña" : "Contraseña"}</Label>
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Confirma la contraseña</Label>
        <Input
          id="confirm"
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
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Guardando…" : hasPassword ? "Guardar nueva contraseña" : "Guardar contraseña"}
        </Button>
        {hasPassword && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset({ password: "", confirm: "" });
              setEditing(false);
              setServerError(null);
            }}
            className="w-fit"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
