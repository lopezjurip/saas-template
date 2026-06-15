"use client";

import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { useRosetta } from "~/lib/i18n.client";
import { actionRevokeApiKey } from "./actions";

type ApiKey = {
  api_key_id: number;
  api_key_name: string;
  api_key_prefix: string;
  api_key_created_at: string;
  api_key_last_used_at: string | null;
  api_key_revoked_at: string | null;
};

export function ApiKeyList({ keys }: { keys: ApiKey[] }) {
  const { t } = useRosetta(LOCALES);

  if (keys.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y rounded-md border">
      {keys.map((k) => (
        <div key={k["api_key_id"]} className="flex items-center gap-3 px-3.5 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{k["api_key_name"]}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {k["api_key_prefix"]}•••••••••••••••••••••••
            </span>
            <span className="text-xs text-muted-foreground">
              {t("created")} {new Date(k["api_key_created_at"]).toLocaleDateString()}
              {k["api_key_last_used_at"] && (
                <>
                  {" · "}
                  {t("last_used")} {new Date(k["api_key_last_used_at"]).toLocaleDateString()}
                </>
              )}
            </span>
          </div>
          <form action={actionRevokeApiKey}>
            <input type="hidden" name="api_key_id" value={k["api_key_id"]} />
            <ButtonSpinner
              type="submit"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive hover:text-destructive"
              pendingChildren={<span>{t("revoking")}</span>}
            >
              {t("revoke")}
            </ButtonSpinner>
          </form>
        </div>
      ))}
    </div>
  );
}

const LOCALE_ES = {
  empty: "Aún no tienes claves de API.",
  created: "Creada el",
  last_used: "Último uso:",
  revoke: "Revocar",
  revoking: "Revocando…",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    empty: "No API keys yet.",
    created: "Created",
    last_used: "Last used:",
    revoke: "Revoke",
    revoking: "Revoking…",
  } satisfies typeof LOCALE_ES,
  pt: {
    empty: "Nenhuma chave de API ainda.",
    created: "Criada em",
    last_used: "Último uso:",
    revoke: "Revogar",
    revoking: "Revogando…",
  } satisfies typeof LOCALE_ES,
};
