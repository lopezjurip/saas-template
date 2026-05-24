"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { useState, useTransition } from "react";
import { actionSignOutOtherDevices } from "./actions";

export function SessionsSection() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSignOutOthers = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await actionSignOutOtherDevices();
      if (res?.serverError) setError(res.serverError);
      else setSuccess(true);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs">
        Si perdiste un dispositivo o crees que alguien más está usando tu cuenta, cierra todas las otras sesiones.
      </p>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && !error && <p className="text-muted-foreground text-xs">Las otras sesiones fueron cerradas.</p>}
      <Button type="button" variant="outline" onClick={onSignOutOthers} disabled={pending} className="w-fit">
        {pending ? "Cerrando…" : "Cerrar otras sesiones"}
      </Button>
    </div>
  );
}
