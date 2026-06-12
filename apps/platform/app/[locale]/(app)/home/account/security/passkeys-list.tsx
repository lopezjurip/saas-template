"use client";

import { createBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
type PasskeyListItem = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" });
function FORMAT_DATE(value: string | null | undefined): string {
  if (!value) return "—";
  return DATE_FORMATTER.format(new Date(value));
}

export function PasskeysList({ passkeys }: { passkeys: PasskeyListItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  function onDelete(id: string) {
    setError(null);
    startDelete(async () => {
      const supabase = createBrowserClient();
      const { error: err } = await supabase.auth.passkey.delete({ passkeyId: id });
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
          key={p.id}
          className="bg-muted/30 grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border px-3.5 py-3"
        >
          <span className="bg-muted text-foreground inline-flex size-9 items-center justify-center rounded-[9px]" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-foreground text-sm font-medium">
              {p.friendly_name ?? "Passkey"}
            </span>
            <span className="text-muted-foreground inline-flex flex-wrap items-center gap-1.5 text-xs">
              <span>Creado {FORMAT_DATE(p.created_at)}</span>
              <span className="opacity-50">·</span>
              <span>
                {p.last_used_at
                  ? `Usado ${FORMAT_DATE(p.last_used_at)}`
                  : "Nunca usado"}
              </span>
            </span>
          </div>
          <div className="inline-flex gap-1.5">
            <button
              type="button"
              disabled={deleting}
              className="text-destructive hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-3 text-[12.5px] font-medium whitespace-nowrap no-underline disabled:opacity-50"
              onClick={() => onDelete(p.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
