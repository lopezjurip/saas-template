"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { BadgeCheck, Ban, Hourglass, type LucideIcon, RefreshCw, ShieldCheck, UserPlus, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { AffiliationState } from "~/lib/agencies";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionUpdateAffiliateMembership } from "../actions";

/** One affiliate row, derived server-side from the membership lifecycle (external data). */
export type TeamAffiliate = {
  agency_membership_id: number;
  profile_id: string;
  state: AffiliationState;
  name: string;
  email: string | null;
  is_self: boolean;
};

type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];

/**
 * Team tab body — lists the agency affiliates with revoke/reactivate controls.
 * Lives in its own file (>80 lines and owns client state via `useTransition`).
 *
 * @example <TeamList agencyId={1} affiliates={affiliates} inviteHref={href} />
 */
export function TeamList({
  agencyId,
  affiliates,
  inviteHref,
}: {
  agencyId: number;
  affiliates: TeamAffiliate[];
  inviteHref: Route;
}) {
  const { t } = useRosetta(LOCALES);
  const active = affiliates.filter((a) => a.state === "accepted").length;

  return (
    <div className="px-4 py-5 pb-8 @3xl:px-6 @3xl:py-6 @3xl:pb-10">
      <div className="mx-auto flex w-full max-w-205 flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground m-0 text-lg font-semibold tracking-tight">{t("team_title")}</h1>
            <p className="text-muted-foreground m-0 max-w-[60ch] text-xs leading-normal text-pretty">
              {t("team_desc")}
            </p>
          </div>
          <Button asChild size="sm" className="h-9 shrink-0">
            <Link href={inviteHref}>
              <UserPlus size={15} strokeWidth={2} /> <span className="hidden @lg:inline">{t("invite")}</span>
            </Link>
          </Button>
        </div>

        {affiliates.length === 0 ? (
          <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
            <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
              <UserPlus size={22} />
            </span>
            <div className="flex max-w-[42ch] flex-col gap-1">
              <span className="text-foreground text-sm font-semibold">{t("team_empty_title")}</span>
              <span className="text-xs leading-normal text-pretty">{t("team_empty_desc")}</span>
            </div>
            <Button asChild size="sm" className="mt-1">
              <Link href={inviteHref}>
                <UserPlus size={14} strokeWidth={2} /> {t("invite")}
              </Link>
            </Button>
          </div>
        ) : (
          <section className="flex flex-col gap-2.5">
            <div className="flex min-h-7 items-center justify-between gap-2.5">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
                {t("team_group")}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {t("team_count", { active, total: affiliates.length })}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {affiliates.map((aff) => (
                <TeamAffiliateRow key={aff.agency_membership_id} agencyId={agencyId} aff={aff} t={t} />
              ))}
            </div>
            <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-xs leading-normal">
              <span className="text-muted-foreground/80 mt-px shrink-0">
                <ShieldCheck size={13} />
              </span>
              <span className="text-pretty">
                {t("team_note_prefix")} <strong className="text-foreground font-medium">{t("tab_access")}</strong>{" "}
                {t("team_note_suffix")}
              </span>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function TeamAffiliateRow({ agencyId, aff, t }: { agencyId: number; aff: TeamAffiliate; t: Translate }) {
  const dim = aff.state === "revoked" || aff.state === "rejected";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(operation: "revoke" | "reactivate") {
    setError(null);
    startTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(
        actionUpdateAffiliateMembership({
          agency_id: agencyId,
          agency_membership_id: aff.agency_membership_id,
          operation,
        }),
      );
      if (err instanceof ErrorSafeActionServer) setError(err.serverError);
    });
  }

  // Revoke an active member; reactivate a revoked one. Pending/rejected/self have no action.
  let action: {
    operation: "revoke" | "reactivate";
    tone: "danger" | "neutral";
    label: string;
    icon: LucideIcon;
  } | null = null;
  if (!aff.is_self) {
    if (aff.state === "accepted")
      action = { operation: "revoke", tone: "danger", label: t("action_revoke"), icon: Ban };
    else if (aff.state === "revoked")
      action = { operation: "reactivate", tone: "neutral", label: t("action_reactivate"), icon: RefreshCw };
  }

  return (
    <div
      className={cn(
        "border-border grid w-full items-center gap-3 rounded-md border px-3.5 py-2.5",
        dim ? "bg-muted/30" : "bg-background",
      )}
      style={{ gridTemplateColumns: "34px 1fr auto auto" }}
    >
      <span
        className={cn(
          "bg-muted text-foreground inline-flex size-8.5 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-[-0.01em]",
          dim && "opacity-60",
        )}
      >
        {INITIALS_OF(aff.name)}
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium",
              dim ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {aff.name}
          </span>
          {aff.is_self ? (
            <span className="bg-foreground text-background shrink-0 rounded-full px-1.5 py-0.5 text-tiny font-semibold uppercase leading-none tracking-[0.04em]">
              {t("self")}
            </span>
          ) : null}
        </span>
        {aff.email ? (
          <span className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap text-xs">
            {error ?? aff.email}
          </span>
        ) : error ? (
          <span className="text-destructive overflow-hidden text-ellipsis whitespace-nowrap text-xs">{error}</span>
        ) : null}
      </span>
      <AffiliationBadge state={aff.state} label={t(`state_${aff.state}`)} />
      {action ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(action.operation)}
          className={cn(
            "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors disabled:opacity-50",
            "bg-background border-border",
            action.tone === "danger"
              ? "text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5"
              : "text-foreground hover:bg-accent",
          )}
        >
          <action.icon size={13.5} /> <span className="hidden @3xl:inline">{action.label}</span>
        </button>
      ) : (
        <span className="text-muted-foreground/70 hidden shrink-0 pr-1 text-xs italic @3xl:inline">
          {aff.state === "rejected" ? t("action_declined") : ""}
        </span>
      )}
    </div>
  );
}

/** Inline status pill scoped to the team list. */
function AffiliationBadge({ state, label }: { state: AffiliationState; label: string }) {
  const base =
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-tiny font-medium leading-[1.2] tracking-[0.01em]";
  if (state === "accepted") {
    return (
      <span
        className={cn(
          base,
          "border border-emerald-600/30 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-300",
        )}
      >
        <BadgeCheck size={11} strokeWidth={2.25} /> {label}
      </span>
    );
  }
  if (state === "pending") {
    return (
      <span className={cn(base, "border-border text-muted-foreground border border-dashed bg-transparent")}>
        <Hourglass size={10} /> {label}
      </span>
    );
  }
  if (state === "rejected") {
    return (
      <span className={cn(base, "border-destructive/35 text-destructive bg-destructive/6 border")}>
        <X size={10} strokeWidth={2.5} /> {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        "border-border text-muted-foreground bg-muted/50 decoration-muted-foreground/40 border line-through",
      )}
    >
      {label}
    </span>
  );
}

const LOCALE_ES = {
  tab_access: "Accesos",
  invite: "Afiliar persona",
  self: "Tú",
  team_title: "Equipo de la agencia",
  team_desc: "Las personas de tu firma que llevan la agencia. Invítalas o revoca su acceso.",
  team_group: "Tu equipo",
  team_count: "{{active}} activos · {{total}} total",
  team_note_prefix:
    "Cualquier afiliado activo gestiona al equipo. Cada afiliado lleva la agencia en su sesión y hereda los accesos de la pestaña",
  team_note_suffix: "— nunca puede escribir.",
  team_empty_title: "Aún no afilias a nadie",
  team_empty_desc:
    "Invita a las personas de tu firma por correo. Cuando acepten, se unen a la agencia y heredan sus accesos de solo lectura.",
  state_accepted: "Activo",
  state_pending: "Pendiente",
  state_revoked: "Revocado",
  state_rejected: "Rechazado",
  action_revoke: "Revocar",
  action_reactivate: "Reactivar",
  action_declined: "declinó",
};

const LOCALE_EN: typeof LOCALE_ES = {
  tab_access: "Access",
  invite: "Affiliate a person",
  self: "You",
  team_title: "Agency team",
  team_desc: "The people from your firm who carry the agency. Invite them or revoke their access.",
  team_group: "Your team",
  team_count: "{{active}} active · {{total}} total",
  team_note_prefix:
    "Any active affiliate manages the team. Each affiliate carries the agency in their session and inherits the access from the",
  team_note_suffix: "tab — can never write.",
  team_empty_title: "You haven't affiliated anyone yet",
  team_empty_desc:
    "Invite the people from your firm by email. When they accept, they join the agency and inherit its read-only access.",
  state_accepted: "Active",
  state_pending: "Pending",
  state_revoked: "Revoked",
  state_rejected: "Rejected",
  action_revoke: "Revoke",
  action_reactivate: "Reactivate",
  action_declined: "declined",
};

const LOCALE_PT: typeof LOCALE_ES = {
  tab_access: "Acessos",
  invite: "Afiliar uma pessoa",
  self: "Você",
  team_title: "Equipe da agência",
  team_desc: "As pessoas da sua firma que carregam a agência. Convide-as ou revogue o acesso.",
  team_group: "Sua equipe",
  team_count: "{{active}} ativos · {{total}} total",
  team_note_prefix:
    "Qualquer afiliado ativo gerencia a equipe. Cada afiliado carrega a agência na sessão e herda os acessos da aba",
  team_note_suffix: "— nunca pode escrever.",
  team_empty_title: "Você ainda não afiliou ninguém",
  team_empty_desc:
    "Convide as pessoas da sua firma por e-mail. Quando aceitarem, entram na agência e herdam seus acessos somente leitura.",
  state_accepted: "Ativo",
  state_pending: "Pendente",
  state_revoked: "Revogado",
  state_rejected: "Rejeitado",
  action_revoke: "Revogar",
  action_reactivate: "Reativar",
  action_declined: "recusou",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
