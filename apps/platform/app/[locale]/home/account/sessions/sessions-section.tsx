"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Monitor, Smartphone } from "lucide-react";
import { useState, useTransition } from "react";
import { actionSignOutOtherDevices } from "../actions";

type SessionRow = {
  id: string;
  kind: "desktop" | "mobile";
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current?: boolean;
  stale?: boolean;
};

const SESSIONS = /*#__PURE__*/ [
  {
    id: "this",
    kind: "desktop",
    device: "MacBook Pro",
    browser: "Chrome 122",
    location: "Santiago, Chile",
    lastActive: "Ahora",
    current: true,
  },
  {
    id: "iphone",
    kind: "mobile",
    device: "iPhone 15",
    browser: "Safari · iOS",
    location: "Santiago, Chile",
    lastActive: "Hace 12 min",
  },
  {
    id: "linux",
    kind: "desktop",
    device: "Workstation",
    browser: "Firefox · Ubuntu",
    location: "Buenos Aires, Argentina",
    lastActive: "Hace 9 días",
  },
  {
    id: "old",
    kind: "desktop",
    device: "PC personal",
    browser: "Edge · Windows",
    location: "Madrid, España",
    lastActive: "Hace 32 días",
    stale: true,
  },
] satisfies SessionRow[];

export function SessionsSection() {
  const [sessions, setSessions] = useState<SessionRow[]>(SESSIONS);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const others = sessions.filter((s) => !s.current).length;

  function onRevoke(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function onSignOutOthers() {
    setError(null);
    startTransition(async () => {
      const res = await actionSignOutOtherDevices();
      if (res?.serverError) {
        setError(res.serverError);
        return;
      }
      setSessions((prev) => prev.filter((s) => s.current));
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            data-current={s.current ? "true" : "false"}
            className={cn(
              "grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border bg-background px-3.5 py-3",
              "data-[current=true]:border-foreground/45 data-[current=true]:bg-muted/35",
            )}
          >
            <span
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-[9px] bg-muted text-foreground",
                s.current && "bg-foreground text-background",
              )}
            >
              {s.kind === "mobile" ? <Smartphone size={16} /> : <Monitor size={16} />}
            </span>
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="inline-flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                <span>{s.device}</span>
                {s.current && (
                  <Badge className="bg-foreground text-[10px] uppercase tracking-[0.04em] text-background">
                    Este dispositivo
                  </Badge>
                )}
                {s.stale && (
                  <Badge variant="outline" className="text-[10.5px]">
                    Inactivo
                  </Badge>
                )}
              </span>
              <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>{s.browser}</span>
                <span className="opacity-50">·</span>
                <span>{s.location}</span>
                <span className="opacity-50">·</span>
                <span>{s.lastActive}</span>
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              {!s.current && (
                <button
                  type="button"
                  onClick={() => onRevoke(s.id)}
                  className="inline-flex h-[30px] items-center rounded-md px-3 text-[12.5px] font-medium text-destructive hover:bg-accent"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {others > 0 && (
        <div className="-mt-1 flex items-center justify-between gap-3.5">
          <span className="max-w-[36ch] text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
            Si pierdes un dispositivo, cerrarlo desde aquí invalida su sesión al instante.
          </span>
          <Button type="button" variant="outline" onClick={onSignOutOthers} disabled={pending} className="h-9">
            {pending ? "Cerrando…" : `Cerrar las otras ${others} sesion${others === 1 ? "" : "es"}`}
          </Button>
        </div>
      )}
    </div>
  );
}
