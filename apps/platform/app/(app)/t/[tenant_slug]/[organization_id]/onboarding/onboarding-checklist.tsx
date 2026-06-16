"use client";

import { useGraphyMutation } from "@packages/graphy/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, ImageIcon, type LucideIcon, UserPlus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import {
  TENANT_COUNT_DONE,
  TENANT_STEP_ORDER,
  type TenantOnboardingStepId,
  type TenantOnboardingStepStatus,
} from "./state";

const FinishTenantOnboardingMutation = /*#__PURE__*/ gql(`
  mutation FinishTenantOnboardingMutation($tenant_id: Int!) {
    tenant: viewerTenantOnboardingFinish(tenantId: $tenant_id) {
      tenantId
      tenantOnboardedAt
    }
  }
`);

const STEP_ICON: Record<TenantOnboardingStepId, LucideIcon> = {
  tenant_logo: ImageIcon,
  first_member: UserPlus,
};

/**
 * Resumable tenant onboarding checklist. Every step is derivable: it deep-links to the relevant
 * settings page and flips to done on its own. "Dismiss" stamps tenant_onboarded_at via
 * viewer_tenant_onboarding_finish so the banner stops.
 *
 * @example <OnboardingChecklist tenantId={1} tenantSlug="acme" organizationId={1} steps={steps} />
 */
export function OnboardingChecklist({
  tenantId,
  tenantSlug,
  organizationId,
  steps,
}: {
  tenantId: number;
  tenantSlug: string;
  organizationId: number;
  steps: Record<TenantOnboardingStepId, TenantOnboardingStepStatus>;
}) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [finishState, finishOnboarding] = useGraphyMutation(FinishTenantOnboardingMutation);
  const pending = finishState.isValidating;

  const params = { tenant_slug: tenantSlug, organization_id: organizationId };
  const STEP_HREF: Record<TenantOnboardingStepId, Route> = {
    tenant_logo: ROUTE("/t/[tenant_slug]/[organization_id]/settings/tenant/general", params),
    first_member: ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/new", params),
  };

  const done = TENANT_COUNT_DONE(steps);
  const total = TENANT_STEP_ORDER.length;

  async function onDismiss() {
    setError(null);
    const { data, error: mutationError } = await finishOnboarding({ tenant_id: tenantId });
    if (mutationError || !data?.["tenant"]) {
      setError(t("action_failed"));
      return;
    }
    router.push(ROUTE("/t/[tenant_slug]/[organization_id]", params));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">{t("eyebrow")}</span>
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 text-sm leading-[1.55] text-pretty">
          {t("subtitle")} · {t("progress", { done, total })}
        </p>
      </header>

      <ol className="border-border bg-background flex flex-col overflow-hidden rounded-xl border">
        {TENANT_STEP_ORDER.map((id, index) => {
          const status = steps[id];
          const isDone = status === "done";
          const Icon = STEP_ICON[id];
          return (
            <li
              key={id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-3.5 px-4 py-3.5",
                index > 0 && "border-border border-t",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                  isDone
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
              </span>
              <div className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
                  {t(`${id}_title`)}
                </span>
                <span className="text-muted-foreground text-xs leading-[1.45] text-pretty">{t(`${id}_desc`)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {!isDone ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={STEP_HREF[id]}>
                      {t("go")}
                      <ArrowRight size={14} />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href={ROUTE("/t/[tenant_slug]/[organization_id]", params)}>{t("back")}</Link>
        </Button>
        <Button variant="outline" disabled={pending} onClick={onDismiss}>
          {t("dismiss")}
        </Button>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  eyebrow: "Empresa",
  title: "Configura tu empresa",
  subtitle: "Unos pasos para dejar lista la empresa",
  progress: "{{done}} de {{total}} listos",
  tenant_logo_title: "Sube el logo de la empresa",
  tenant_logo_desc: "Aparece en el cambiador y en la cabecera. Una imagen cuadrada funciona mejor.",
  first_member_title: "Invita a tu primer miembro",
  first_member_desc: "Suma a alguien de tu equipo a la organización.",
  go: "Ir",
  back: "Volver",
  dismiss: "Listo, no mostrar más",
  action_failed: "No pudimos guardar. Intenta de nuevo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Company",
  title: "Set up your company",
  subtitle: "A few steps to get the company ready",
  progress: "{{done}} of {{total}} ready",
  tenant_logo_title: "Upload the company logo",
  tenant_logo_desc: "Shows in the switcher and the header. A square image works best.",
  first_member_title: "Invite your first member",
  first_member_desc: "Add someone from your team to the organization.",
  go: "Go",
  back: "Back",
  dismiss: "Done, stop showing this",
  action_failed: "We couldn't save. Try again.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Empresa",
  title: "Configure sua empresa",
  subtitle: "Alguns passos para deixar a empresa pronta",
  progress: "{{done}} de {{total}} prontos",
  tenant_logo_title: "Envie o logo da empresa",
  tenant_logo_desc: "Aparece no alternador e no cabeçalho. Uma imagem quadrada funciona melhor.",
  first_member_title: "Convide seu primeiro membro",
  first_member_desc: "Adicione alguém da sua equipe à organização.",
  go: "Ir",
  back: "Voltar",
  dismiss: "Pronto, não mostrar mais",
  action_failed: "Não foi possível salvar. Tente novamente.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
