"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useState, useTransition } from "react";
import { actionSignOutOtherDevices } from "../actions";

// TODO: list each active session here once we have a backend view that exposes them.
// Supabase doesn't surface other sessions on the client; we'd need a service-role query
// against `auth.sessions` joined to the current user_id.

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
    <div className="acc-group">
      <div className="acc-todo">
        El listado de sesiones por dispositivo está en construcción. Por ahora puedes cerrar sesión en todos los otros
        dispositivos en un solo paso.
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && !error && <p className="sc-hint">Las otras sesiones se cerraron.</p>}
      <div className="acc-form-foot" style={{ borderTop: 0, paddingTop: 0 }}>
        <button
          type="button"
          onClick={onSignOutOthers}
          disabled={pending}
          className="sc-btn sc-btn-outline"
          style={{ height: 36 }}
        >
          {pending ? "Cerrando…" : "Cerrar las otras sesiones"}
        </button>
      </div>
    </div>
  );
}
