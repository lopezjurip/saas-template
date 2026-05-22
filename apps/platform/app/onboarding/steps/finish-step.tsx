import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { finishOnboarding } from "../actions";

export function FinishStep() {
  return (
    <form action={finishOnboarding} className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-sm font-medium">Todo listo</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Ya puedes comenzar a usar Humane. Puedes completar los pasos opcionales más adelante desde tu perfil.
        </p>
      </div>
      <Button type="submit" className="w-full">
        Entrar a Humane
      </Button>
    </form>
  );
}
