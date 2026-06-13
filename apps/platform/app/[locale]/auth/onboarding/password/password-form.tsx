"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingPassword } from "~/hooks/use-onboarding";
import { useRosetta } from "~/lib/i18n.client";

function STRENGTH_SCORE(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export function PasswordForm() {
  const { t } = useRosetta(LOCALES);
  const { setPassword, error, pending } = useOnboardingPassword();
  const [show, setShow] = useState(false);

  const schema = z
    .object({
      password: z.string().min(8, t("password_min")),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
      message: t("passwords_mismatch"),
      path: ["confirm"],
    });
  type Values = z.infer<typeof schema>;

  const strengthLabels = [
    t("strength_weak"),
    t("strength_weak"),
    t("strength_fair"),
    t("strength_good"),
    t("strength_strong"),
  ] as const;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const pw = form.watch("password");
  const strengthBars = STRENGTH_SCORE(pw);
  const strengthLabel = strengthLabels[strengthBars]!;

  const onSubmit = form.handleSubmit(async (values) => {
    await setPassword(values.password);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ob-password">{t("label_new_password")}</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex">
            <Lock size={16} />
          </span>
          <Input
            id="ob-password"
            className="h-10 pl-9 pr-10"
            type={show ? "text" : "password"}
            placeholder="••••••••••"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t("hide") : t("show")}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
        )}
        <div className="mt-0.5 flex items-center gap-2.5">
          <div className="grid h-1 flex-1 grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                data-on={i < strengthBars ? "true" : "false"}
                className="h-full rounded-sm bg-muted data-[on=true]:bg-foreground"
              />
            ))}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{pw ? strengthLabel : t("password_min")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ob-confirm">{t("label_confirm_password")}</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex">
            <Lock size={16} />
          </span>
          <Input
            id="ob-confirm"
            className="h-10 pl-9 pr-10"
            type={show ? "text" : "password"}
            placeholder="••••••••••"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.confirm}
            {...form.register("confirm")}
          />
        </div>
        {form.formState.errors.confirm && (
          <p className="text-destructive text-xs">{form.formState.errors.confirm.message}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="h-10 w-full">
        <span>{pending ? t("saving") : t("save")}</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}

const LOCALE_ES = {
  password_min: "Mínimo 8 caracteres",
  passwords_mismatch: "Las contraseñas no coinciden",
  strength_weak: "Débil",
  strength_fair: "Aceptable",
  strength_good: "Buena",
  strength_strong: "Muy fuerte",
  label_new_password: "Contraseña nueva",
  label_confirm_password: "Confirmar contraseña",
  hide: "Ocultar",
  show: "Mostrar",
  saving: "Guardando…",
  save: "Guardar contraseña",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    password_min: "Minimum 8 characters",
    passwords_mismatch: "Passwords do not match",
    strength_weak: "Weak",
    strength_fair: "Fair",
    strength_good: "Good",
    strength_strong: "Very strong",
    label_new_password: "New password",
    label_confirm_password: "Confirm password",
    hide: "Hide",
    show: "Show",
    saving: "Saving…",
    save: "Save password",
  } satisfies typeof LOCALE_ES,
  pt: {
    password_min: "Mínimo 8 caracteres",
    passwords_mismatch: "As senhas não coincidem",
    strength_weak: "Fraca",
    strength_fair: "Regular",
    strength_good: "Boa",
    strength_strong: "Muito forte",
    label_new_password: "Nova senha",
    label_confirm_password: "Confirmar senha",
    hide: "Ocultar",
    show: "Mostrar",
    saving: "Salvando…",
    save: "Salvar senha",
  } satisfies typeof LOCALE_ES,
};
