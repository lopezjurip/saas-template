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
import { setPassword } from "./password-action";

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

export function PasswordStep() {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const locale = useLocaleParam();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await setPassword({ password: values.password });
      if (res?.serverError) setServerError(res.serverError);
      else if (res?.validationErrors) setServerError(t("invalid_password"));
      else router.push(`/${locale}/onboarding`);
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">{t("heading")}</h2>
        <p className="text-muted-foreground mt-1 text-xs">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password_label")}</Label>
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
        <Label htmlFor="confirm">{t("confirm_label")}</Label>
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

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("saving") : t("save_password")}
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link href={`/${locale}/onboarding`}>{t("skip")}</Link>
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  heading: "Crea una contraseña",
  description: "Para iniciar sesión con tu correo cuando no tengas passkey.",
  password_label: "Contraseña",
  confirm_label: "Confirma tu contraseña",
  saving: "Guardando…",
  save_password: "Guardar contraseña",
  skip: "Omitir por ahora",
  invalid_password: "Contraseña inválida",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Create a password",
  description: "To sign in with your email when you don't have a passkey.",
  password_label: "Password",
  confirm_label: "Confirm your password",
  saving: "Saving…",
  save_password: "Save password",
  skip: "Skip for now",
  invalid_password: "Invalid password",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Crie uma senha",
  description: "Para entrar com seu e-mail quando não tiver um passkey.",
  password_label: "Senha",
  confirm_label: "Confirme sua senha",
  saving: "Salvando…",
  save_password: "Salvar senha",
  skip: "Pular por agora",
  invalid_password: "Senha inválida",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
