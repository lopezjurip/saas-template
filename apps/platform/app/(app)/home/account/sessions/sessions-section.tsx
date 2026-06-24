"use client";

import type { ResultOf } from "@graphql-typed-document-node/core";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { DATETIME, RELATIVE_DATE_FORMAT } from "@packages/utils/date";
import { Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { UAParser } from "ua-parser-js";
import { gql } from "~/generated/graphql";
import { useIntlRelativeTimeFormat } from "~/hooks/use-intl";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionRevokeSession, actionSignOutOtherDevices } from "../actions";

export const SessionsSectionSessionFragment = gql(`
  fragment SessionsSectionSessionFragment on UserSessions {
    id
    userAgent
    ip
    createdAt
    refreshedAt
    notAfter
  }
`);

export type SessionsSectionSessionFragmentType = ResultOf<typeof SessionsSectionSessionFragment>;

type SessionsSectionProps = React.ComponentProps<"div"> & {
  currentSessionId: string | null | undefined;
  sessions: { node: SessionsSectionSessionFragmentType }[];
};

function SessionRow(props: {
  currentSessionId: string | null | undefined;
  onRevoke: (id: string) => void;
  pending: boolean;
  session: SessionsSectionSessionFragmentType;
}) {
  const { t } = useRosetta(LOCALES);
  const relativeTimeFormatter = useIntlRelativeTimeFormat();
  const current = props.session["id"] === props.currentSessionId;
  const parser = new UAParser(props.session["userAgent"] ?? "");
  const browser = parser.getBrowser();
  const device = parser.getDevice();
  const os = parser.getOS();
  const browserLabel = [browser["name"], browser["version"]].filter(Boolean).join(" ") || t("browser_unknown");
  const deviceLabel =
    [device["vendor"], device["model"]].filter(Boolean).join(" ") || os["name"] || t("device_unknown");
  const kind = device["type"] === "mobile" || device["type"] === "tablet" ? "mobile" : "desktop";
  const activeDate = DATETIME(props.session["refreshedAt"] ?? props.session["createdAt"]);
  const lastActive = activeDate
    ? `${t("active_prefix")} ${relativeTimeFormatter.format(...RELATIVE_DATE_FORMAT(activeDate))}`
    : t("activity_unknown");
  const notAfter = DATETIME(props.session["notAfter"]);
  const stale = notAfter ? notAfter.getTime() <= Date.now() : false;

  return (
    <div
      data-current={current ? "true" : "false"}
      className={cn(
        "grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border bg-background px-3.5 py-3",
        "data-[current=true]:border-foreground/45 data-[current=true]:bg-muted/35",
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg bg-muted text-foreground",
          current && "bg-foreground text-background",
        )}
      >
        {kind === "mobile" ? <Smartphone size={16} /> : <Monitor size={16} />}
      </span>
      <div className="flex min-w-0 flex-col gap-0.75">
        <span className="inline-flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
          <span>{deviceLabel}</span>
          {current && (
            <Badge className="bg-foreground text-tiny uppercase tracking-wider text-background">
              {t("current_device")}
            </Badge>
          )}
          {stale && (
            <Badge variant="outline" className="text-tiny">
              {t("inactive")}
            </Badge>
          )}
        </span>
        <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>{browserLabel}</span>
          <span className="opacity-50">·</span>
          <span>{props.session["ip"] ? t("ip_label", { ip: props.session["ip"] }) : t("ip_unknown")}</span>
          <span className="opacity-50">·</span>
          <span>{lastActive}</span>
        </span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        {current ? (
          <Link
            href="/auth/logout"
            className="inline-flex h-7.5 items-center rounded-md px-3 text-xs font-medium text-destructive hover:bg-accent"
          >
            {t("revoke")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => props.onRevoke(props.session["id"]!)}
            disabled={props.pending}
            className="inline-flex h-7.5 items-center rounded-md px-3 text-xs font-medium text-destructive hover:bg-accent disabled:opacity-50"
          >
            {t("revoke")}
          </button>
        )}
      </div>
    </div>
  );
}

export function SessionsSection({ className, currentSessionId, sessions, ...props }: SessionsSectionProps) {
  const router = useRouter();
  const { t } = useRosetta(LOCALES);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const others = currentSessionId
    ? sessions.filter(({ ["node"]: session }) => session["id"] !== currentSessionId).length
    : 0;

  function onRevoke(id: string) {
    setError(null);
    startTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(actionRevokeSession({ sessionId: id }));
      if (err instanceof ErrorSafeActionServer) {
        setError(err.serverError);
        return;
      }
      router.refresh();
    });
  }

  function onSignOutOthers() {
    setError(null);
    startTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(actionSignOutOtherDevices());
      if (err instanceof ErrorSafeActionServer) {
        setError(err.serverError);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className={cn("flex flex-col gap-3.5", className)} {...props}>
      <div className="flex flex-col gap-2">
        {sessions.length === 0 && (
          <div className="rounded-md border bg-background px-3.5 py-3 text-sm text-muted-foreground">
            {t("no_sessions")}
          </div>
        )}
        {sessions.map((edge) => {
          const session = edge["node"];
          return (
            <SessionRow
              key={session["id"]}
              session={session}
              currentSessionId={currentSessionId}
              pending={pending}
              onRevoke={onRevoke}
            />
          );
        })}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {others > 0 && (
        <div className="-mt-1 flex items-center justify-between gap-3.5">
          <span className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground text-pretty">
            {t("revoke_notice")}
          </span>
          <Button type="button" variant="outline" onClick={onSignOutOthers} disabled={pending} className="h-9">
            {pending ? t("closing_others") : t("sign_out_others")}
          </Button>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  browser_unknown: "Navegador desconocido",
  device_unknown: "Dispositivo desconocido",
  active_prefix: "Activo",
  activity_unknown: "Actividad reciente desconocida",
  current_device: "Este dispositivo",
  inactive: "Inactivo",
  ip_unknown: "IP desconocida",
  revoke: "Cerrar",
  no_sessions: "No encontramos sesiones activas para esta cuenta.",
  revoke_notice: "Cerrar una sesión impide nuevos accesos, pero el token activo puede tardar hasta 1 hora en expirar.",
  sign_out_others: "Cerrar las otras sesiones",
  closing_others: "Cerrando…",
  ip_label: "IP {{ip}}",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    browser_unknown: "Unknown browser",
    device_unknown: "Unknown device",
    active_prefix: "Active",
    activity_unknown: "Unknown recent activity",
    current_device: "This device",
    inactive: "Inactive",
    ip_unknown: "Unknown IP",
    revoke: "Sign out",
    no_sessions: "We couldn't find any active sessions for this account.",
    revoke_notice: "Signing out a session prevents new access, but the active token can take up to 1 hour to expire.",
    sign_out_others: "Sign out other sessions",
    closing_others: "Signing out…",
    ip_label: "IP {{ip}}",
  } satisfies typeof LOCALE_ES,
  pt: {
    browser_unknown: "Navegador desconhecido",
    device_unknown: "Dispositivo desconhecido",
    active_prefix: "Ativo",
    activity_unknown: "Atividade recente desconhecida",
    current_device: "Este dispositivo",
    inactive: "Inativo",
    ip_unknown: "IP desconhecido",
    revoke: "Encerrar",
    no_sessions: "Não encontramos sessões ativas para esta conta.",
    revoke_notice: "Encerrar uma sessão impede novos acessos, mas o token ativo pode levar até 1 hora para expirar.",
    sign_out_others: "Encerrar outras sessões",
    closing_others: "Encerrando…",
    ip_label: "IP {{ip}}",
  } satisfies typeof LOCALE_ES,
};
