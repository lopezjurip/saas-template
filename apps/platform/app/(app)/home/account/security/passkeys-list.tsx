"use client";

import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useIntlDateTimeFormat } from "~/hooks/use-intl";
import { useRosetta } from "~/lib/i18n.client";

/** Native Supabase passkey, as returned by `supabase.auth.passkey.list()`. */
type Passkey = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

export function PasskeysList({ passkeys }: { passkeys: Passkey[] }) {
  const router = useRouter();
  const { t } = useRosetta(LOCALES);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const dateFormatter = useIntlDateTimeFormat({ day: "2-digit", month: "short", year: "numeric" });

  function FORMAT_DATE(value: string | null | undefined): string {
    if (!value) return "—";
    return dateFormatter.format(new Date(value));
  }

  function onDelete(id: string) {
    setError(null);
    startDelete(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.passkey.delete({ passkeyId: id });
      if (err) setError(t("error_delete"));
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
          key={p["id"]}
          className="bg-muted/30 grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border px-3.5 py-3"
        >
          <span className="bg-muted text-foreground inline-flex size-9 items-center justify-center rounded-lg" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-foreground text-sm font-medium">{p["friendly_name"] ?? "Passkey"}</span>
            <span className="text-muted-foreground inline-flex flex-wrap items-center gap-1.5 text-xs">
              <span>{t("created", { date: FORMAT_DATE(p["created_at"]) })}</span>
              <span className="opacity-50">·</span>
              <span>{p["last_used_at"] ? t("used", { date: FORMAT_DATE(p["last_used_at"]) }) : t("never_used")}</span>
            </span>
          </div>
          <div className="inline-flex gap-1.5">
            <button
              type="button"
              disabled={deleting}
              className="text-destructive hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-3 text-xs font-medium whitespace-nowrap no-underline disabled:opacity-50"
              onClick={() => onDelete(p["id"])}
            >
              {t("delete")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const LOCALE_ES = {
  created: "Creado {{date}}",
  used: "Usado {{date}}",
  never_used: "Nunca usado",
  delete: "Eliminar",
  error_delete: "No pudimos eliminar el passkey",
};

const LOCALE_EN: typeof LOCALE_ES = {
  created: "Created {{date}}",
  used: "Used {{date}}",
  never_used: "Never used",
  delete: "Delete",
  error_delete: "We couldn't delete the passkey",
};

const LOCALE_PT: typeof LOCALE_ES = {
  created: "Criado {{date}}",
  used: "Usado {{date}}",
  never_used: "Nunca usado",
  delete: "Excluir",
  error_delete: "Não conseguimos excluir o passkey",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
