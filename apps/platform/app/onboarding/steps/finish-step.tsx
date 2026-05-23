"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { useTransition } from "react";
import { finishOnboarding } from "../actions";

export function FinishStep() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-sm font-medium">Todo listo</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Ya puedes comenzar a usar Humane. Puedes completar los pasos opcionales más adelante desde tu perfil.
        </p>
      </div>
      <Button
        onClick={() => startTransition(() => finishOnboarding().then(() => undefined))}
        disabled={pending}
        className="w-full"
      >
        {pending ? "Entrando…" : "Entrar a Humane"}
      </Button>
    </div>
  );
}
