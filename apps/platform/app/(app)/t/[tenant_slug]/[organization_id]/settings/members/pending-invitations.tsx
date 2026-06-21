"use client";

import { useGraphyMutation } from "@packages/graphy/react";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { FileText, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { gql } from "~/generated/graphql";
import { FilterIs } from "~/generated/graphql/graphql";
import { useIntlDateTimeFormat } from "~/hooks/use-intl";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";

const MembersPendingInvitationsCancelMutation = /*#__PURE__*/ gql(`
  mutation MembersPendingInvitationsCancelMutation($filter: OrganizationMembershipsFilter!, $set: OrganizationMembershipsUpdateInput!, $atMost: Int! = 1000) {
    updateOrganizationMembershipsCollection(filter: $filter, set: $set, atMost: $atMost) {
      affectedCount
    }
  }
`);

interface InvitationRow {
  organization_membership_id: number;
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
  locale: string;
  tenantSlug: string;
  organizationId: number;
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

function CHANNEL_OF(inv: InvitationRow): "email" | "phone" | "document" {
  if (inv["invitation_phone"]) return "phone";
  if (inv["invitation_document_value"]) return "document";
  return "email";
}

export function PendingInvitations({ invitations, locale, tenantSlug, organizationId }: Props) {
  const { t } = useRosetta(LOCALES);
  const dateFormatter = useIntlDateTimeFormat({ day: "2-digit", month: "short" });
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [, cancelInvitation] = useGraphyMutation(MembersPendingInvitationsCancelMutation);
  const [optimisticInvitations, removeOptimistic] = useOptimistic(
    invitations,
    (state: InvitationRow[], organization_membership_id: number) =>
      state.filter((i) => i["organization_membership_id"] !== organization_membership_id),
  );

  function cancel(inv: InvitationRow) {
    if (!window.confirm(t("cancel_confirm", { email: INVITATION_LABEL(inv) }))) return;
    setError(null);
    setPendingId(inv["organization_membership_id"]);
    startTransition(async () => {
      removeOptimistic(inv["organization_membership_id"]);
      const { error: err } = await cancelInvitation({
        filter: {
          organizationMembershipId: { eq: inv["organization_membership_id"] },
          profileId: { is: FilterIs.Null },
          organizationMembershipRevokedAt: { is: FilterIs.Null },
          organizationMembershipRejectedAt: { is: FilterIs.Null },
        },
        set: {
          organizationMembershipRevokedAt: new Date().toISOString(),
          organizationMembershipInviteToken: null,
        },
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
      {optimisticInvitations.map((inv) => {
        const slugs = (inv["invitation_permission_slugs"] ?? []).filter((s): s is string => typeof s === "string");
        const hasWildcard = slugs.includes("*");
        const permCount = slugs.filter((s) => s !== "*").length;
        const channel = CHANNEL_OF(inv);
        const ChannelIcon = channel === "phone" ? Phone : channel === "document" ? FileText : Mail;
        const expiresAt = inv["invitation_expires_at"] ? new Date(inv["invitation_expires_at"]).getTime() : null;
        const isExpired = expiresAt !== null && expiresAt < Date.now();
        const daysLeft = expiresAt !== null ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 86_400_000)) : null;

        return (
          <div
            key={inv["organization_membership_id"]}
            className="group border-border bg-muted/30 hover:border-foreground/25 grid grid-cols-[36px_1fr_auto_auto] items-center gap-3 rounded-md border px-3.5 py-3 transition-[background,border-color]"
          >
            <span className="bg-muted text-muted-foreground border-border inline-flex size-9 shrink-0 items-center justify-center rounded-full border">
              <ChannelIcon size={15} />
            </span>
            <Link
              href={ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit", {
                tenant_slug: tenantSlug,
                organization_id: organizationId,
                organization_membership_id: inv["organization_membership_id"],
              })}
              className="flex min-w-0 flex-col gap-0.5 outline-none focus-visible:underline"
            >
              <span className="text-foreground truncate text-sm font-medium">{INVITATION_LABEL(inv)}</span>
              <span className="text-muted-foreground inline-flex min-w-0 items-center gap-1.5 truncate text-xs">
                <span className="truncate">{dateFormatter.format(new Date(inv["invitation_created_at"]))}</span>
                {daysLeft !== null && !isExpired ? (
                  <>
                    <span className="shrink-0 opacity-50">·</span>
                    <span className="shrink-0">{t("expires_in_days", { days: daysLeft })}</span>
                  </>
                ) : null}
              </span>
            </Link>
            {isExpired ? (
              <Badge variant="outline" className="border-destructive/35 bg-destructive/10 text-destructive">
                {t("expired_badge")}
              </Badge>
            ) : hasWildcard ? (
              <Badge>{t("full_access")}</Badge>
            ) : permCount === 0 ? (
              <Badge variant="outline" className="text-muted-foreground">
                {t("no_permissions")}
              </Badge>
            ) : (
              <Badge variant="secondary">{t("permissions_count", { count: permCount })}</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-[30px] shrink-0"
              disabled={pendingId === inv["organization_membership_id"]}
              onClick={() => cancel(inv)}
              aria-label={t("cancel")}
              title={t("cancel")}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

const LOCALE_ES = {
  empty: "No hay invitaciones pendientes.",
  no_permissions: "sin permisos",
  full_access: "Acceso completo",
  permissions_count: "{{count}} permisos",
  expired_badge: "expirada",
  expires_in_days: "expira en {{days}} d",
  cancel: "Cancelar invitación",
  cancelling: "Cancelando…",
  cancel_confirm: "¿Cancelar la invitación a {{email}}?",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    empty: "No pending invitations.",
    no_permissions: "no permissions",
    full_access: "Full access",
    permissions_count: "{{count}} permissions",
    expired_badge: "expired",
    expires_in_days: "expires in {{days}}d",
    cancel: "Cancel invitation",
    cancelling: "Cancelling…",
    cancel_confirm: "Cancel the invitation to {{email}}?",
  } satisfies typeof LOCALE_ES,
  pt: {
    empty: "Não há convites pendentes.",
    no_permissions: "sem permissões",
    full_access: "Acesso completo",
    permissions_count: "{{count}} permissões",
    expired_badge: "expirado",
    expires_in_days: "expira em {{days}} d",
    cancel: "Cancelar convite",
    cancelling: "Cancelando…",
    cancel_confirm: "Cancelar o convite para {{email}}?",
  } satisfies typeof LOCALE_ES,
};
