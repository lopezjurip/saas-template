"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowUpRight, Building2, Check, Eye, Globe, Hourglass, X } from "lucide-react";
import { useState, useTransition } from "react";
import { actionRespondInvitation } from "~/app/[locale]/a/[agency_slug]/actions";
import { useRosetta } from "~/hooks/use-rosetta";
import { INITIALS_OF } from "~/lib/agencies";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";

export type AffiliateOrg = {
  organization_id: number;
  organization_name: string;
  organization_slug: string | null;
};

export type AffiliateAgency = {
  agency_id: string;
  agency_name: string;
  agency_slug: string | null;
  is_global: boolean;
  orgs: AffiliateOrg[];
};

export type AffiliateInvitation = {
  agency_membership_id: number;
  agency_name: string;
  agency_slug: string | null;
};

export function AffiliateDashboard({
  agencies,
  invitations,
}: {
  agencies: AffiliateAgency[];
  invitations: AffiliateInvitation[];
}) {
  const { t } = useRosetta(LOCALES);

  const empty = agencies.length === 0 && invitations.length === 0;

  return (
    <div className="@container bg-background relative flex min-h-svh w-full flex-col overflow-hidden">
      <header className="border-border bg-background flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 @min-[768px]:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="border-border bg-muted text-foreground inline-flex size-[34px] shrink-0 items-center justify-center rounded-lg border">
            <Building2 size={16} />
          </span>
          <div className="flex min-w-0 flex-col gap-[1px]">
            <span className="text-foreground truncate text-[13.5px] font-semibold tracking-[-0.01em]">
              {t("portal")}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground bg-muted/60 border-border inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium leading-[1.2] tracking-[0.02em]">
                <Eye size={11} /> {t("read_only")}
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1 overflow-auto px-4 py-5 pb-8 @min-[768px]:px-6 @min-[768px]:py-7 @min-[768px]:pb-10">
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-foreground m-0 text-[20px] font-semibold tracking-[-0.02em]">{t("title")}</h1>
            <p className="text-muted-foreground m-0 max-w-[58ch] text-[13px] leading-[1.55] [text-wrap:pretty]">
              {t("subtitle")}
            </p>
          </div>

          {invitations.length > 0 ? (
            <section className="flex flex-col gap-2.5">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
                {t("invitations")}
              </span>
              <div className="flex flex-col gap-2">
                {invitations.map((inv) => (
                  <InvitationRow key={inv.agency_membership_id} invitation={inv} t={t} />
                ))}
              </div>
            </section>
          ) : null}

          {empty ? (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
              <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
                <Building2 size={22} />
              </span>
              <div className="flex max-w-[42ch] flex-col gap-1">
                <span className="text-foreground text-sm font-semibold">{t("empty_title")}</span>
                <span className="text-[12.5px] leading-[1.5] [text-wrap:pretty]">{t("empty_desc")}</span>
              </div>
            </div>
          ) : (
            agencies.map((agency) => <AgencySection key={agency.agency_id} agency={agency} t={t} />)
          )}
        </div>
      </main>
    </div>
  );
}

type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];

function InvitationRow({ invitation, t }: { invitation: AffiliateInvitation; t: Translate }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function respond(response: "accept" | "reject") {
    setError(null);
    startTransition(async () => {
      const [, err] = await ErrorSafeAction.unwrap(
        actionRespondInvitation({ agency_membership_id: invitation.agency_membership_id, response }),
      );
      if (err instanceof ErrorSafeActionServer) setError(err.serverError);
    });
  }

  return (
    <div className="border-border bg-background flex flex-col gap-2.5 rounded-lg border px-3.5 py-3">
      <div className="flex items-center gap-3">
        <span className="border-border bg-muted text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-[12.5px] font-semibold">
          {INITIALS_OF(invitation.agency_name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-foreground truncate text-[13.5px] font-semibold tracking-[-0.01em]">
            {invitation.agency_name}
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11.5px]">
            <Hourglass size={11} /> {t("invitation_pending")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" disabled={pending} onClick={() => respond("reject")}>
            <X size={14} /> <span className="hidden @min-[520px]:inline">{t("reject")}</span>
          </Button>
          <Button size="sm" disabled={pending} onClick={() => respond("accept")}>
            <Check size={14} /> <span className="hidden @min-[520px]:inline">{t("accept")}</span>
          </Button>
        </div>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function AgencySection({ agency, t }: { agency: AffiliateAgency; t: Translate }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center justify-between gap-2.5">
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em]">
          {agency.agency_name}
        </span>
        {agency.is_global ? (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-600/30 bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-semibold leading-[1.2] tracking-[0.01em] text-emerald-700 dark:text-emerald-300">
            <Globe size={11} strokeWidth={2.25} /> {t("scope_global")}
          </span>
        ) : (
          <span className="text-muted-foreground text-[11.5px] tabular-nums">{agency.orgs.length}</span>
        )}
      </div>

      {agency.is_global ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-500/[0.06] px-3.5 py-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Globe size={17} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-foreground text-[13.5px] font-semibold">{t("global_title")}</span>
            <span className="text-muted-foreground text-[12px] leading-[1.45] [text-wrap:pretty]">
              {t("global_desc")}
            </span>
          </div>
        </div>
      ) : agency.orgs.length === 0 ? (
        <p className="text-muted-foreground px-1 text-[12.5px]">{t("agency_no_orgs")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 @min-[768px]:grid-cols-2">
          {agency.orgs.map((org) => (
            <OrgAccessCard key={org.organization_id} org={org} accessLabel={t("read_access")} />
          ))}
        </div>
      )}
    </section>
  );
}

function OrgAccessCard({ org, accessLabel }: { org: AffiliateOrg; accessLabel: string }) {
  return (
    <div className={cn("border-border bg-background flex h-full flex-col gap-3 rounded-xl border p-4")}>
      <div className="flex items-start justify-between gap-2">
        <span className="bg-muted text-foreground border-border inline-flex size-11 items-center justify-center rounded-lg border text-[14px] font-semibold tracking-[-0.01em]">
          {INITIALS_OF(org.organization_name)}
        </span>
        <span className="text-muted-foreground/50 mt-1">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-foreground truncate text-[14.5px] font-semibold tracking-[-0.01em]">
          {org.organization_name}
        </span>
        {org.organization_slug ? (
          <code className="text-muted-foreground/80 truncate font-mono text-[11.5px]">{org.organization_slug}</code>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="border-border text-foreground bg-background inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium leading-[1.3]">
          <Eye size={10.5} /> {accessLabel}
        </span>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  portal: "Portal de afiliados",
  read_only: "Solo lectura",
  title: "Tus agencias y organizaciones",
  subtitle:
    "Las agencias en las que participas y las organizaciones que te dieron acceso a través de ellas. Tu acceso es siempre de solo lectura.",
  invitations: "Invitaciones pendientes",
  invitation_pending: "Te invitaron a esta agencia",
  accept: "Aceptar",
  reject: "Rechazar",
  scope_global: "Acceso global",
  read_access: "Acceso de lectura",
  global_title: "Todas las organizaciones",
  global_desc: "Acceso global de solo lectura a cualquier organización de la plataforma — actuales y futuras.",
  agency_no_orgs: "Ninguna organización le ha dado acceso a esta agencia todavía.",
  empty_title: "Sin agencias ni accesos",
  empty_desc:
    "Todavía no participas en ninguna agencia activa. Cuando aceptes una invitación, tus agencias y sus accesos aparecerán aquí.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  portal: "Affiliate portal",
  read_only: "Read only",
  title: "Your agencies and organizations",
  subtitle:
    "The agencies you take part in and the organizations that gave you access through them. Your access is always read-only.",
  invitations: "Pending invitations",
  invitation_pending: "You were invited to this agency",
  accept: "Accept",
  reject: "Reject",
  scope_global: "Global access",
  read_access: "Read access",
  global_title: "All organizations",
  global_desc: "Global read-only access to any organization on the platform — current and future.",
  agency_no_orgs: "No organization has given this agency access yet.",
  empty_title: "No agencies or access",
  empty_desc:
    "You don't take part in any active agency yet. When you accept an invitation, your agencies and their access will appear here.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  portal: "Portal de afiliados",
  read_only: "Somente leitura",
  title: "Suas agências e organizações",
  subtitle:
    "As agências das quais você participa e as organizações que lhe deram acesso por meio delas. Seu acesso é sempre somente leitura.",
  invitations: "Convites pendentes",
  invitation_pending: "Você foi convidado para esta agência",
  accept: "Aceitar",
  reject: "Recusar",
  scope_global: "Acesso global",
  read_access: "Acesso de leitura",
  global_title: "Todas as organizações",
  global_desc: "Acesso global somente leitura a qualquer organização da plataforma — atuais e futuras.",
  agency_no_orgs: "Nenhuma organização deu acesso a esta agência ainda.",
  empty_title: "Sem agências ou acessos",
  empty_desc:
    "Você ainda não participa de nenhuma agência ativa. Quando aceitar um convite, suas agências e seus acessos aparecerão aqui.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
