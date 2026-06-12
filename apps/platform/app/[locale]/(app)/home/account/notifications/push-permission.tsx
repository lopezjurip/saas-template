"use client";
import { usePushPermission } from "~/hooks/use-push-permission";

export function PushPermission() {
  const { permission, requestPermission } = usePushPermission();

  if (permission === "unsupported") return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Notificaciones push
        </span>
      </div>
      <div className="flex flex-col overflow-hidden rounded-md border bg-background">
        <div className="grid grid-cols-[1fr_auto] items-start gap-3.5 px-4 py-3.5">
          <div className="flex min-w-0 flex-col gap-[3px]">
            <span className="text-[13.5px] font-medium text-foreground">Push en este navegador</span>
            <span className="text-pretty text-xs leading-relaxed text-muted-foreground">
              {permission === "granted" && "Activadas — recibirás notificaciones en este dispositivo."}
              {permission === "denied" && "Bloqueadas — habilítalas desde la configuración del navegador."}
              {permission === "default" && "Recibe notificaciones directamente en este dispositivo."}
            </span>
          </div>
          {permission === "default" && (
            <button
              type="button"
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
              onClick={requestPermission}
            >
              Activar
            </button>
          )}
          {permission === "granted" && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Activo</span>
          )}
          {permission === "denied" && <span className="text-xs font-medium text-muted-foreground">Bloqueado</span>}
        </div>
      </div>
    </div>
  );
}
