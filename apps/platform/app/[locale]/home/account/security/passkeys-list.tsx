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
    deleteFromprofile_webauthn_credentialsCollection(
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

  function onDelete(id: string) {
    setError(null);
    startDelete(async () => {
      const { error: err } = await deletePasskey({ webauthn_credential_id: id });
      if (err) setError("No pudimos eliminar el passkey");
      else router.refresh();
    });
  }

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
          className="bg-muted/30 grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border px-3.5 py-3"
        >
          <span className="bg-muted text-foreground inline-flex size-9 items-center justify-center rounded-[9px]" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-foreground text-sm font-medium">
              {p["webauthn_credential_friendly_name"] ?? "Passkey"}
            </span>
            <span className="text-muted-foreground inline-flex flex-wrap items-center gap-1.5 text-xs">
              <span>Creado {FORMAT_DATE(p["webauthn_credential_created_at"])}</span>
              <span className="opacity-50">·</span>
              <span>
                {p["webauthn_credential_last_used_at"]
                  ? `Usado ${FORMAT_DATE(p["webauthn_credential_last_used_at"])}`
                  : "Nunca usado"}
              </span>
            </span>
          </div>
          <div className="inline-flex gap-1.5">
            <button
              type="button"
              disabled={deleting}
              className="text-destructive hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-3 text-[12.5px] font-medium whitespace-nowrap no-underline disabled:opacity-50"
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
