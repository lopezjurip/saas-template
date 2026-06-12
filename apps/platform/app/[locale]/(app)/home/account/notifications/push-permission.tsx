"use client";

import { usePushPermission } from "~/hooks/use-push-permission";
import { useRosetta } from "~/hooks/use-rosetta";

export function PushPermission() {
  const { permission, requestPermission } = usePushPermission();
  const { t } = useRosetta(LOCALES);

  if (permission === "unsupported") return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {t("section_title")}
        </span>
      </div>
      <div className="flex flex-col overflow-hidden rounded-md border bg-background">
        <div className="grid grid-cols-[1fr_auto] items-start gap-3.5 px-4 py-3.5">
          <div className="flex min-w-0 flex-col gap-[3px]">
            <span className="text-[13.5px] font-medium text-foreground">{t("push_title")}</span>
            <span className="text-pretty text-xs leading-relaxed text-muted-foreground">
              {permission === "granted" && t("granted_desc")}
              {permission === "denied" && t("denied_desc")}
              {permission === "default" && t("default_desc")}
            </span>
          </div>
          {permission === "default" && (
            <button
              type="button"
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
              onClick={requestPermission}
            >
              {t("activate")}
            </button>
          )}
          {permission === "granted" && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">{t("active")}</span>
          )}
          {permission === "denied" && <span className="text-xs font-medium text-muted-foreground">{t("blocked")}</span>}
        </div>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  section_title: "Notificaciones push",
  push_title: "Push en este navegador",
  granted_desc: "Activadas — recibirás notificaciones en este dispositivo.",
  denied_desc: "Bloqueadas — habilítalas desde la configuración del navegador.",
  default_desc: "Recibe notificaciones directamente en este dispositivo.",
  activate: "Activar",
  active: "Activo",
  blocked: "Bloqueado",
};

const LOCALE_EN: typeof LOCALE_ES = {
  section_title: "Push notifications",
  push_title: "Push on this browser",
  granted_desc: "Enabled — you will receive notifications on this device.",
  denied_desc: "Blocked — enable them in your browser settings.",
  default_desc: "Receive notifications directly on this device.",
  activate: "Enable",
  active: "Active",
  blocked: "Blocked",
};

const LOCALE_PT: typeof LOCALE_ES = {
  section_title: "Notificações push",
  push_title: "Push neste navegador",
  granted_desc: "Ativadas — você receberá notificações neste dispositivo.",
  denied_desc: "Bloqueadas — ative-as nas configurações do navegador.",
  default_desc: "Receba notificações diretamente neste dispositivo.",
  activate: "Ativar",
  active: "Ativo",
  blocked: "Bloqueado",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
