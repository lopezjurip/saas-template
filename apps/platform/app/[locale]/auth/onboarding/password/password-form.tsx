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
      <div className="flex flex-col gap-2">
        <Label htmlFor="ob-password">Contraseña nueva</Label>
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
            aria-label={show ? "Ocultar" : "Mostrar"}
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
                data-on={i < strength.bars ? "true" : "false"}
                className="h-full rounded-sm bg-muted data-[on=true]:bg-foreground"
              />
            ))}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{pw ? strength.label : "Mínimo 8 caracteres"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ob-confirm">Confirmar contraseña</Label>
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
        <span>{pending ? "Guardando…" : "Guardar contraseña"}</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
