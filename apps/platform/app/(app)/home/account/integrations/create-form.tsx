"use client";

import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Check, Copy } from "lucide-react";
import { useActionState, useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { actionCreateApiKeyTyped } from "./actions";

export function CreateApiKeyForm() {
  const { t } = useRosetta(LOCALES);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [, dispatch, pending] = useActionState(async (_prev: unknown, formData: FormData) => {
    const result = await actionCreateApiKeyTyped({
      api_key_name: String(formData.get("api_key_name") ?? ""),
    });
    if (result?.data) {
      setSecret(result.data["api_key_secret"]);
    }
    return result;
  }, null);

  async function copySecret() {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={dispatch} className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="api-key-name" className="text-xs">
            {t("name_label")}
          </Label>
          <Input
            id="api-key-name"
            name="api_key_name"
            placeholder={t("name_placeholder")}
            className="h-9 text-sm"
            maxLength={128}
          />
        </div>
        <ButtonSpinner type="submit" size="sm" className="h-9 shrink-0" pendingChildren={<span>{t("creating")}</span>}>
          {t("create_button")}
        </ButtonSpinner>
      </form>

      {secret && (
        <div className="flex flex-col gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/8 p-3.5">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{t("secret_warning")}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-background px-2 py-1.5 font-mono text-xs">{secret}</code>
            <button
              type="button"
              onClick={copySecret}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  name_label: "Nombre de la clave",
  name_placeholder: "Mi agente",
  create_button: "Crear clave",
  creating: "Creando…",
  secret_warning: "Guarda esta clave ahora — no se volverá a mostrar.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    name_label: "Key name",
    name_placeholder: "My agent",
    create_button: "Create key",
    creating: "Creating…",
    secret_warning: "Copy this key now — it won't be shown again.",
  } satisfies typeof LOCALE_ES,
  pt: {
    name_label: "Nome da chave",
    name_placeholder: "Meu agente",
    create_button: "Criar chave",
    creating: "Criando…",
    secret_warning: "Salve esta chave agora — ela não será exibida novamente.",
  } satisfies typeof LOCALE_ES,
};
