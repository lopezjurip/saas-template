"use client";

import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { gql } from "~/generated/graphql";

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

const SecurityPasskeysListDeleteMutation = /*#__PURE__*/ gql(`
  mutation SecurityPasskeysListDeleteMutation($webauthn_credential_id: UUID!) {
    deleteFromwebauthn_credentialsCollection(
      filter: { webauthn_credential_id: { eq: $webauthn_credential_id } }
    ) {
      affectedCount
    }
  }
`);

export function PasskeysList({ passkeys }: { passkeys: Passkey[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const [, deletePasskey] = useGraphyMutation(SecurityPasskeysListDeleteMutation);

  const onDelete = (id: string) => {
    setError(null);
    startDelete(async () => {
      const { error: err } = await deletePasskey({ webauthn_credential_id: id });
      if (err) setError("No pudimos eliminar el passkey");
      else router.refresh();
    });
  };

  if (passkeys.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {passkeys.map((p) => (
        <div
          key={p["webauthn_credential_id"]}
          className="acc-row"
          style={{ background: "color-mix(in oklab, var(--muted) 30%, transparent)" }}
        >
          <span className="acc-row-icon" />
          <div className="acc-row-body">
            <span className="acc-row-title">{p["webauthn_credential_friendly_name"] ?? "Passkey"}</span>
            <span className="acc-row-sub">
              <span>Creado {FORMAT_DATE(p["webauthn_credential_created_at"])}</span>
              <span className="sep">·</span>
              <span>
                {p["webauthn_credential_last_used_at"]
                  ? `Usado ${FORMAT_DATE(p["webauthn_credential_last_used_at"])}`
                  : "Nunca usado"}
              </span>
            </span>
          </div>
          <div className="acc-row-actions">
            <button
              type="button"
              disabled={deleting}
              className="acc-row-btn ghost danger"
              onClick={() => onDelete(p["webauthn_credential_id"])}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
