"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingPassword } from "~/hooks/use-onboarding";

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

function STRENGTH(pw: string): { bars: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Débil", "Débil", "Aceptable", "Buena", "Muy fuerte"];
  return { bars: score, label: labels[score]! };
}

export function PasswordForm() {
  const { setPassword, error, pending } = useOnboardingPassword();
  const [show, setShow] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const pw = form.watch("password");
  const strength = STRENGTH(pw);

  const onSubmit = form.handleSubmit(async (values) => {
    await setPassword(values.password);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="sc-password-group">
        <label className="sc-label" htmlFor="ob-password">
          Contraseña nueva
        </label>
        <div className="sc-input-icon-wrap sc-password-input-wrap">
          <span className="sc-input-icon">
            <Lock size={16} />
          </span>
          <input
            id="ob-password"
            className="sc-input"
            type={show ? "text" : "password"}
            placeholder="••••••••••"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <button
            type="button"
            className="sc-eye"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar" : "Mostrar"}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
        )}
        <div className="ob-strength">
          <div className="ob-strength-bars">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} data-on={i < strength.bars ? "true" : "false"} />
            ))}
          </div>
          <span className="ob-strength-label">{pw ? strength.label : "Mínimo 8 caracteres"}</span>
        </div>
      </div>

      <div className="sc-password-group">
        <label className="sc-label" htmlFor="ob-confirm">
          Confirmar contraseña
        </label>
        <div className="sc-input-icon-wrap sc-password-input-wrap">
          <span className="sc-input-icon">
            <Lock size={16} />
          </span>
          <input
            id="ob-confirm"
            className="sc-input"
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

      <button type="submit" disabled={pending} className="sc-btn sc-btn-primary sc-btn-block">
        <span>{pending ? "Guardando…" : "Guardar contraseña"}</span>
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
