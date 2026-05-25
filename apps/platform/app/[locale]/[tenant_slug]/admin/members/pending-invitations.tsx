"use client";

import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui-common/shadcn/components/ui/table";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useLocale } from "~/components/locale-provider";
import { useRosetta } from "~/hooks/use-rosetta";
import { actionCancelInvitation } from "./actions";

const LOCALE_ES = {
  empty: "No hay invitaciones pendientes.",
  email_column: "Correo",
  permissions_column: "Permisos",
  sent_column: "Enviada",
  expires_column: "Expira",
  actions_column: "Acciones",
  no_permissions: "sin permisos",
  full_access: "acceso completo",
  expired_badge: "expirada",
  cancel: "Cancelar",
  cancelling: "Cancelando…",
  cancel_confirm: "¿Cancelar la invitación a {{email}}?",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    empty: "No pending invitations.",
    email_column: "Email",
    permissions_column: "Permissions",
    sent_column: "Sent",
    expires_column: "Expires",
    actions_column: "Actions",
    no_permissions: "no permissions",
    full_access: "full access",
    expired_badge: "expired",
    cancel: "Cancel",
    cancelling: "Cancelling…",
    cancel_confirm: "Cancel the invitation to {{email}}?",
  } satisfies typeof LOCALE_ES,
  pt: {
    empty: "Não há convites pendentes.",
    email_column: "E-mail",
    permissions_column: "Permissões",
    sent_column: "Enviado",
    expires_column: "Expira",
    actions_column: "Ações",
    no_permissions: "sem permissões",
    full_access: "acesso completo",
    expired_badge: "expirado",
    cancel: "Cancelar",
    cancelling: "Cancelando…",
    cancel_confirm: "Cancelar o convite para {{email}}?",
  } satisfies typeof LOCALE_ES,
};

interface InvitationRow {
  invitation_id: string;
  invitation_email: string;
  invitation_permission_slugs: (string | null)[];
  invitation_created_at: string;
  invitation_expires_at: string;
}

interface Props {
  invitations: InvitationRow[];
}

export function PendingInvitations({ invitations }: Props) {
  const r = useRosetta(LOCALES);
  const locale = useLocale();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticInvitations, removeOptimistic] = useOptimistic(
    invitations,
    (state: InvitationRow[], invitation_id: string) => state.filter((i) => i["invitation_id"] !== invitation_id),
  );

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }),
    [locale],
  );

  const cancel = (invitation_id: string, email: string) => {
    if (!window.confirm(r.t("cancel_confirm", { email }))) return;
    setError(null);
    setPendingId(invitation_id);
    startTransition(async () => {
      removeOptimistic(invitation_id);
      const res = await actionCancelInvitation({ invitation_id });
      setPendingId(null);
      if (res?.serverError) {
        setError(res.serverError);
      }
      router.refresh();
    });
  };

  if (optimisticInvitations.length === 0) {
    return <p className="text-muted-foreground text-sm">{r.t("empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{r.t("email_column")}</TableHead>
              <TableHead>{r.t("permissions_column")}</TableHead>
              <TableHead>{r.t("sent_column")}</TableHead>
              <TableHead>{r.t("expires_column")}</TableHead>
              <TableHead className="text-right">{r.t("actions_column")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticInvitations.map((inv) => {
              const slugs = (inv["invitation_permission_slugs"] ?? []).filter(
                (s): s is string => typeof s === "string",
              );
              const isExpired = new Date(inv["invitation_expires_at"]).getTime() < Date.now();
              return (
                <TableRow key={inv["invitation_id"]}>
                  <TableCell className="text-sm">{inv["invitation_email"]}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {slugs.length === 0 ? (
                        <span className="text-muted-foreground text-xs">{r.t("no_permissions")}</span>
                      ) : (
                        slugs.map((slug) => (
                          <Badge key={slug} variant="secondary" className="font-mono text-xs">
                            {slug === "*" ? r.t("full_access") : slug}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {dateFormatter.format(new Date(inv["invitation_created_at"]))}
                  </TableCell>
                  <TableCell className="text-xs">
                    {isExpired ? (
                      <Badge variant="destructive">{r.t("expired_badge")}</Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        {dateFormatter.format(new Date(inv["invitation_expires_at"]))}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={pendingId === inv["invitation_id"]}
                      onClick={() => cancel(inv["invitation_id"], inv["invitation_email"])}
                    >
                      {pendingId === inv["invitation_id"] ? r.t("cancelling") : r.t("cancel")}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
