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
import { useOptimistic, useState, useTransition } from "react";
import { actionCancelInvitation } from "./actions";

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

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function FORMAT_DATE(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function PendingInvitations({ invitations }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticInvitations, removeOptimistic] = useOptimistic(
    invitations,
    (state: InvitationRow[], invitation_id: string) => state.filter((i) => i["invitation_id"] !== invitation_id),
  );

  const cancel = (invitation_id: string, email: string) => {
    if (!window.confirm(`¿Cancelar la invitación a ${email}?`)) return;
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
    return <p className="text-muted-foreground text-sm">No hay invitaciones pendientes.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correo</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead>Enviada</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
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
                        <span className="text-muted-foreground text-xs">sin permisos</span>
                      ) : (
                        slugs.map((slug) => (
                          <Badge key={slug} variant="secondary" className="font-mono text-xs">
                            {slug === "*" ? "acceso completo" : slug}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {FORMAT_DATE(inv["invitation_created_at"])}
                  </TableCell>
                  <TableCell className="text-xs">
                    {isExpired ? (
                      <Badge variant="destructive">expirada</Badge>
                    ) : (
                      <span className="text-muted-foreground">{FORMAT_DATE(inv["invitation_expires_at"])}</span>
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
                      {pendingId === inv["invitation_id"] ? "Cancelando…" : "Cancelar"}
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
