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
import { MEMBERS_LOCALES } from "./locales";

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
  const r = useRosetta(MEMBERS_LOCALES);
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
    if (!window.confirm(r.t("pending_cancel_confirm", { email }))) return;
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
    return <p className="text-muted-foreground text-sm">{r.t("pending_empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{r.t("pending_email_column")}</TableHead>
              <TableHead>{r.t("pending_permissions_column")}</TableHead>
              <TableHead>{r.t("pending_sent_column")}</TableHead>
              <TableHead>{r.t("pending_expires_column")}</TableHead>
              <TableHead className="text-right">{r.t("pending_actions_column")}</TableHead>
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
                        <span className="text-muted-foreground text-xs">{r.t("pending_no_permissions")}</span>
                      ) : (
                        slugs.map((slug) => (
                          <Badge key={slug} variant="secondary" className="font-mono text-xs">
                            {slug === "*" ? r.t("pending_full_access") : slug}
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
                      <Badge variant="destructive">{r.t("pending_expired_badge")}</Badge>
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
                      {pendingId === inv["invitation_id"] ? r.t("pending_cancelling") : r.t("pending_cancel")}
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
