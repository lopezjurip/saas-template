"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { usePushPermission } from "~/hooks/use-push-permission";
import { useRosetta } from "~/lib/i18n.client";

/**
 * Push notification opt-in / opt-out panel.
 *
 * Requests Notification permission, registers service worker subscription
 * via PushManager, and persists to profile_push_subscriptions.
 * Shows disabled state when NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.
 */
export function PushPermission() {
  const { permission, subscribed, loading, requestPermission, unsubscribe } = usePushPermission();
  const { t } = useRosetta(LOCALES);

  // Hide entirely if browser doesn't support push at all
  if (permission === "unsupported") return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("section_title")}
        </span>
      </div>
      <div className="flex flex-col overflow-hidden rounded-md border bg-background">
        <div className="grid grid-cols-[1fr_auto] items-start gap-3.5 px-4 py-3.5">
          <div className="flex min-w-0 flex-col gap-[3px]">
            <span className="text-sm font-medium text-foreground">{t("push_title")}</span>
            <span className="text-pretty text-xs leading-relaxed text-muted-foreground">
              {permission === "no_vapid" && t("no_vapid_desc")}
              {permission === "granted" && subscribed && t("granted_desc")}
              {permission === "granted" && !subscribed && t("granted_no_sub_desc")}
              {permission === "denied" && t("denied_desc")}
              {permission === "default" && t("default_desc")}
            </span>
          </div>
          <div className="flex items-center">
            {permission === "no_vapid" && (
              <span className="text-xs font-medium text-muted-foreground">{t("unavailable")}</span>
            )}
            {permission === "default" && (
              <Button size="sm" onClick={requestPermission} disabled={loading}>
                {t("activate")}
              </Button>
            )}
            {permission === "granted" && subscribed && (
              <Button size="sm" variant="outline" onClick={unsubscribe} disabled={loading}>
                {t("deactivate")}
              </Button>
            )}
            {permission === "granted" && !subscribed && (
              <Button size="sm" onClick={requestPermission} disabled={loading}>
                {t("subscribe")}
              </Button>
            )}
            {permission === "denied" && (
              <span className="text-xs font-medium text-muted-foreground">{t("blocked")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  section_title: "Notificaciones push",
  push_title: "Push en este navegador",
  no_vapid_desc: "Push no está disponible en este entorno.",
  granted_desc: "Activadas — recibirás notificaciones en este dispositivo.",
  granted_no_sub_desc: "Permiso concedido pero sin suscripción activa. Haz clic para activar.",
  denied_desc: "Bloqueadas — habilítalas desde la configuración del navegador.",
  default_desc: "Recibe notificaciones directamente en este dispositivo.",
  activate: "Activar",
  subscribe: "Activar",
  deactivate: "Desactivar",
  active: "Activo",
  blocked: "Bloqueado",
  unavailable: "No disponible",
};

const LOCALE_EN: typeof LOCALE_ES = {
  section_title: "Push notifications",
  push_title: "Push on this browser",
  no_vapid_desc: "Push is not available in this environment.",
  granted_desc: "Enabled — you will receive notifications on this device.",
  granted_no_sub_desc: "Permission granted but no active subscription. Click to enable.",
  denied_desc: "Blocked — enable them in your browser settings.",
  default_desc: "Receive notifications directly on this device.",
  activate: "Enable",
  subscribe: "Enable",
  deactivate: "Disable",
  active: "Active",
  blocked: "Blocked",
  unavailable: "Unavailable",
};

const LOCALE_PT: typeof LOCALE_ES = {
  section_title: "Notificações push",
  push_title: "Push neste navegador",
  no_vapid_desc: "Push não está disponível neste ambiente.",
  granted_desc: "Ativadas — você receberá notificações neste dispositivo.",
  granted_no_sub_desc: "Permissão concedida mas sem assinatura ativa. Clique para ativar.",
  denied_desc: "Bloqueadas — ative-as nas configurações do navegador.",
  default_desc: "Receba notificações diretamente neste dispositivo.",
  activate: "Ativar",
  subscribe: "Ativar",
  deactivate: "Desativar",
  active: "Ativo",
  blocked: "Bloqueado",
  unavailable: "Indisponível",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
