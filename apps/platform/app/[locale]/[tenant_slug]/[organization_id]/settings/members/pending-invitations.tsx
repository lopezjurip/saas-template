"use client";

import { useGraphyMutation } from "@packages/graphy/react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useLocale } from "~/components/locale-provider";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/hooks/use-rosetta";

const MembersPendingInvitationsCancelMutation = /*#__PURE__*/ gql(`
  mutation MembersPendingInvitationsCancelMutation($membership_id: Int!, $now: Datetime!) {
    updatemembershipsCollection(
      filter: {
        membership_id: { eq: $membership_id }
        profile_id: { is: NULL }
        membership_revoked_at: { is: NULL }
        membership_rejected_at: { is: NULL }
      }
      set: {
        membership_revoked_at: $now
        membership_invite_token: null
      }
    ) {
      affectedCount
    }
  }
`);

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
  edit: "Editar",
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
    edit: "Edit",
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
    edit: "Editar",
    cancelling: "Cancelando…",
    cancel_confirm: "Cancelar o convite para {{email}}?",
  } satisfies typeof LOCALE_ES,
};

interface InvitationRow {
  membership_id: number;
  invitation_email: string | null;
  invitation_phone: string | null;
  invitation_address_level0_id: string | null;
  invitation_document_kind: string | null;
  invitation_document_value: string | null;
  invitation_permission_slugs: (string | null)[];
  invitation_created_at: string;
  invitation_expires_at: string | null;
}

interface Props {
  invitations: InvitationRow[];
  editHrefBase: string;
}

function INVITATION_LABEL(inv: InvitationRow): string {
  if (inv["invitation_email"]) return inv["invitation_email"];
  if (inv["invitation_phone"]) return inv["invitation_phone"];
  if (inv["invitation_document_value"]) {
    const country = inv["invitation_address_level0_id"] ?? "";
    return `${country} · ${inv["invitation_document_value"]}`;
  }
  return "—";
}

export function PendingInvitations({ invitations, editHrefBase }: Props) {
  const { t } = useRosetta(LOCALES);
  const locale = useLocale();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [, cancelInvitation] = useGraphyMutation(MembersPendingInvitationsCancelMutation);
  const [optimisticInvitations, removeOptimistic] = useOptimistic(
    invitations,
    (state: InvitationRow[], membership_id: number) => state.filter((i) => i["membership_id"] !== membership_id),
  );

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }),
    [locale],
  );

  function cancel(inv: InvitationRow) {
    if (!window.confirm(t("cancel_confirm", { email: INVITATION_LABEL(inv) }))) return;
    setError(null);
    setPendingId(inv["membership_id"]);
    startTransition(async () => {
      removeOptimistic(inv["membership_id"]);
      const { error: err } = await cancelInvitation({
        membership_id: inv["membership_id"],
        now: new Date().toISOString(),
      });
      setPendingId(null);
      if (err) setError("No pudimos cancelar la invitación");
      router.refresh();
    });
  }

  if (optimisticInvitations.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("email_column")}</TableHead>
              <TableHead>{t("permissions_column")}</TableHead>
              <TableHead>{t("sent_column")}</TableHead>
              <TableHead>{t("expires_column")}</TableHead>
              <TableHead className="text-right">{t("actions_column")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticInvitations.map((inv) => {
              const slugs = (inv["invitation_permission_slugs"] ?? []).filter(
                (s): s is string => typeof s === "string",
              );
              const isExpired =
                !!inv["invitation_expires_at"] && new Date(inv["invitation_expires_at"]).getTime() < Date.now();
              return (
                <TableRow key={inv["membership_id"]}>
                  <TableCell className="text-sm">{INVITATION_LABEL(inv)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {slugs.length === 0 ? (
                        <span className="text-muted-foreground text-xs">{t("no_permissions")}</span>
                      ) : (
                        slugs.map((slug) => (
                          <Badge key={slug} variant="secondary" className="font-mono text-xs">
                            {slug === "*" ? t("full_access") : slug}
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
                      <Badge variant="destructive">{t("expired_badge")}</Badge>
                    ) : inv["invitation_expires_at"] ? (
                      <span className="text-muted-foreground">
                        {dateFormatter.format(new Date(inv["invitation_expires_at"]))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`${editHrefBase}/${inv["membership_id"]}/edit`}>{t("edit")}</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={pendingId === inv["membership_id"]}
                        onClick={() => cancel(inv)}
                      >
                        {pendingId === inv["membership_id"] ? t("cancelling") : t("cancel")}
                      </Button>
                    </div>
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
