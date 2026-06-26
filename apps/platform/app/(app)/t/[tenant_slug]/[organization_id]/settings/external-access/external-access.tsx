"use client";

import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { Ban, Building2, Eye, Globe, Lock, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";

const ExternalAccessGrantMutation = /*#__PURE__*/ gql(`
  mutation ExternalAccessGrantMutation($organization_id: Int!, $agency_id: Int!) {
    grant: viewerGrantAgencyAccess(organizationId: $organization_id, agencyId: $agency_id) {
      permissionGrantId
    }
  }
`);

const ExternalAccessRevokeMutation = /*#__PURE__*/ gql(`
  mutation ExternalAccessRevokeMutation($organization_id: Int!, $agency_id: Int!) {
    revoke: viewerRevokeAgencyAccess(organizationId: $organization_id, agencyId: $agency_id) {
      permissionGrantId
    }
  }
`);

export type ExternalAccessAgency = {
  agency_id: number;
  agency_name: string;
  agency_slug: string;
  active_affiliates: number;
  is_global: boolean;
};

export function ExternalAccess({
  organizationId,
  organizationName,
  withAccess,
  available,
}: {
  organizationId: number;
  organizationName: string;
  withAccess: ExternalAccessAgency[];
  available: ExternalAccessAgency[];
}) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [, grantAccess] = useGraphyMutation(ExternalAccessGrantMutation);
  const [pending, startTransition] = useTransition();

  function grant() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const { error: mutError } = await grantAccess({
        organization_id: organizationId,
        agency_id: Number(selected),
      });
      if (mutError) {
        const msg = mutError.message ?? "";
        if (msg.includes("no_permission")) setError(t("no_permission"));
        else if (msg.includes("already_granted")) setError(t("already_granted"));
        else if (msg.includes("agency_not_found")) setError(t("agency_not_found"));
        else setError(t("grant_failed"));
        return;
      }
      setSelected("");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
          {organizationName} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">
          {t("subtitle", { org: organizationName })}
        </p>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          {t("grant_heading")}
        </span>
        {available.length === 0 ? (
          <p className="text-muted-foreground px-1 text-xs">{t("grant_empty")}</p>
        ) : (
          <div className="flex flex-col gap-2 @min-[520px]:flex-row @min-[520px]:items-center">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t("grant_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {available.map((a) => (
                  <SelectItem key={a.agency_id} value={String(a.agency_id)}>
                    {a.agency_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="h-9 shrink-0" onClick={grant} disabled={!selected || pending}>
              <Plus size={15} strokeWidth={2} /> {t("grant_access")}
            </Button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            {t("with_access")}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">{withAccess.length}</span>
        </div>
        {withAccess.length === 0 ? (
          <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
            <span className="bg-muted text-muted-foreground inline-flex size-11 items-center justify-center rounded-full">
              <Building2 size={22} />
            </span>
            <div className="flex max-w-[42ch] flex-col gap-1">
              <span className="text-foreground text-sm font-semibold">{t("none_title")}</span>
              <span className="text-xs leading-normal text-pretty">{t("none_desc", { org: organizationName })}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {withAccess.map((agency) => (
              <AgencyAccessCard
                key={agency.agency_id}
                organizationId={organizationId}
                agency={agency}
                orgName={organizationName}
                t={t}
              />
            ))}
          </div>
        )}
        <p className="text-muted-foreground mt-0.5 flex items-start gap-1.5 px-1 text-xs leading-normal">
          <span className="text-muted-foreground/80 mt-px shrink-0">
            <Eye size={13} />
          </span>
          <span className="text-pretty">{t("read_only_note")}</span>
        </p>
      </section>
    </div>
  );
}

type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];

function AgencyAccessCard({
  organizationId,
  agency,
  orgName,
  t,
}: {
  organizationId: number;
  agency: ExternalAccessAgency;
  orgName: string;
  t: Translate;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [, revokeAccess] = useGraphyMutation(ExternalAccessRevokeMutation);

  function revoke() {
    setError(null);
    startTransition(async () => {
      const { error: mutError } = await revokeAccess({
        organization_id: organizationId,
        agency_id: agency.agency_id,
      });
      if (mutError) {
        const msg = mutError.message ?? "";
        if (msg.includes("no_permission")) setError(t("no_permission"));
        else setError(t("revoke_failed"));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="border-border bg-background flex flex-col gap-3 rounded-lg border px-3.5 py-3">
      <div className="flex items-start gap-3">
        <span className="border-border bg-muted text-foreground inline-flex size-10 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold">
          {INITIALS_OF(agency.agency_name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-foreground text-sm font-semibold">{agency.agency_name}</span>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            {agency.is_global ? (
              <>
                <Globe size={12} /> {t("global_managed")}
              </>
            ) : (
              <>
                <Users size={12} /> {t("readers", { count: agency.active_affiliates, org: orgName })}
              </>
            )}
          </span>
        </div>
        {agency.is_global ? (
          <span className="text-muted-foreground/70 border-border inline-flex shrink-0 items-center gap-1 self-center rounded-md border border-dashed px-2 py-1 text-xs">
            <Lock size={11} /> {t("platform")}
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={revoke}
            className="text-destructive hover:bg-destructive/6 hover:border-destructive/40 shrink-0 self-center"
          >
            <Ban size={13} /> {t("revoke")}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 pl-[52px]">
        <span
          className={cn(
            "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium leading-[1.3]",
            agency.is_global
              ? "border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "border-border text-foreground bg-background border",
          )}
        >
          <Eye size={10.5} /> {t("read_access")}
        </span>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

const LOCALE_ES = {
  eyebrow: "Ajustes",
  title: "Acceso externo",
  subtitle:
    "Agencias externas — firmas auditoras, entes fiscalizadores o soporte — con acceso de solo lectura a {{org}}. Tú controlas qué pueden ver; nunca pueden modificar nada.",
  grant_heading: "Dar acceso a una agencia",
  grant_placeholder: "Selecciona una agencia",
  grant_access: "Dar acceso",
  grant_empty: "No hay agencias disponibles para dar acceso.",
  with_access: "Agencias con acceso",
  none_title: "Sin agencias con acceso",
  none_desc: "Ninguna agencia externa puede leer {{org}} todavía. Dale acceso a una arriba.",
  global_managed: "Acceso global · gestionado por la plataforma",
  readers: "{{count}} afiliados pueden leer {{org}}",
  platform: "Plataforma",
  revoke: "Revocar",
  read_access: "Acceso de lectura",
  read_only_note: "Todo el acceso externo es de solo lectura. Las agencias nunca pueden modificar nada.",
  no_permission: "No tienes permiso para administrar el acceso externo de esta organización",
  agency_not_found: "Agencia no encontrada",
  already_granted: "Esa agencia ya tiene acceso a esta organización",
  grant_failed: "No pudimos otorgar el acceso",
  revoke_failed: "No pudimos revocar el acceso",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Settings",
  title: "External access",
  subtitle:
    "External agencies — audit firms, regulators or support — with read-only access to {{org}}. You control what they can see; they can never modify anything.",
  grant_heading: "Grant access to an agency",
  grant_placeholder: "Select an agency",
  grant_access: "Grant access",
  grant_empty: "There are no agencies available to grant access to.",
  with_access: "Agencies with access",
  none_title: "No agencies with access",
  none_desc: "No external agency can read {{org}} yet. Grant access to one above.",
  global_managed: "Global access · managed by the platform",
  readers: "{{count}} affiliates can read {{org}}",
  platform: "Platform",
  revoke: "Revoke",
  read_access: "Read access",
  read_only_note: "All external access is read-only. Agencies can never modify anything.",
  no_permission: "You don't have permission to manage external access for this organization",
  agency_not_found: "Agency not found",
  already_granted: "That agency already has access to this organization",
  grant_failed: "We couldn't grant access",
  revoke_failed: "We couldn't revoke access",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Configurações",
  title: "Acesso externo",
  subtitle:
    "Agências externas — firmas de auditoria, órgãos fiscais ou suporte — com acesso somente leitura a {{org}}. Você controla o que podem ver; nunca podem modificar nada.",
  grant_heading: "Dar acesso a uma agência",
  grant_placeholder: "Selecione uma agência",
  grant_access: "Dar acesso",
  grant_empty: "Não há agências disponíveis para dar acesso.",
  with_access: "Agências com acesso",
  none_title: "Sem agências com acesso",
  none_desc: "Nenhuma agência externa pode ler {{org}} ainda. Dê acesso a uma acima.",
  global_managed: "Acesso global · gerenciado pela plataforma",
  readers: "{{count}} afiliados podem ler {{org}}",
  platform: "Plataforma",
  revoke: "Revogar",
  read_access: "Acesso de leitura",
  read_only_note: "Todo acesso externo é somente leitura. As agências nunca podem modificar nada.",
  no_permission: "Você não tem permissão para administrar o acesso externo desta organização",
  agency_not_found: "Agência não encontrada",
  already_granted: "Essa agência já tem acesso a esta organização",
  grant_failed: "Não conseguimos conceder o acesso",
  revoke_failed: "Não conseguimos revogar o acesso",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
