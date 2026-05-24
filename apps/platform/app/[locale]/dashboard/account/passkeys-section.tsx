"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPasskey } from "~/lib/passkeys.client";
import { actionDeletePasskey } from "./actions";

type Passkey = {
  webauthn_credential_id: string;
  webauthn_credential_friendly_name: string | null;
  webauthn_credential_device_type: string;
  webauthn_credential_backup_state: string;
  webauthn_credential_created_at: string;
  webauthn_credential_last_used_at: string | null;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" });

function FORMAT_DATE(value: string | null): string {
  if (!value) return "—";
  return DATE_FORMATTER.format(new Date(value));
}

export function PasskeysSection({ passkeys }: { passkeys: Passkey[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [creating, startCreate] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  const onCreate = () => {
    setError(null);
    startCreate(async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) {
          setError("Tu navegador no soporta passkeys.");
          return;
        }
        await createPasskey();
        router.refresh();
      } catch (e) {
        if (e instanceof Error && e.name === "NotAllowedError") {
          setError("Cancelaste el registro del passkey.");
        } else {
          setError(e instanceof Error ? e.message : "No pudimos crear el passkey.");
        }
      }
    });
  };

  const onDelete = (webauthn_credential_id: string) => {
    setError(null);
    setDeletingId(webauthn_credential_id);
    startDelete(async () => {
      const res = await actionDeletePasskey({ webauthn_credential_id });
      if (res?.serverError) setError(res.serverError);
      else router.refresh();
      setDeletingId(null);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {passkeys.length === 0 ? (
        <p className="text-muted-foreground text-xs">Aún no tienes passkeys registrados.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {passkeys.map((passkey) => {
            const id = passkey["webauthn_credential_id"];
            const isDeleting = deleting && deletingId === id;
            return (
              <li key={id} className="border-border flex items-start justify-between gap-3 rounded-md border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {passkey["webauthn_credential_friendly_name"] ?? "Passkey"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Creado {FORMAT_DATE(passkey["webauthn_credential_created_at"])}
                    {passkey["webauthn_credential_last_used_at"]
                      ? ` · Usado ${FORMAT_DATE(passkey["webauthn_credential_last_used_at"])}`
                      : " · Nunca usado"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {passkey["webauthn_credential_device_type"] === "multi_device"
                      ? "Sincronizado"
                      : "Solo este dispositivo"}
                    {" · "}
                    {passkey["webauthn_credential_backup_state"] === "backed_up" ? "Respaldado" : "Sin respaldo"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(id)}
                  disabled={isDeleting}
                  aria-label="Eliminar passkey"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Button type="button" variant="outline" onClick={onCreate} disabled={creating} className="w-fit">
        {creating ? "Creando…" : "Agregar passkey"}
      </Button>
    </div>
  );
}
