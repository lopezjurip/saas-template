import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { TENANT_COUNT_DONE, TENANT_ONBOARDING_INCOMPLETE, TENANT_STEP_ORDER } from "./state";
import { getTenantOnboardingState } from "./state.server";

/**
 * Soft onboarding nudge on the tenant home. Renders nothing unless the viewer holds
 * `tenant_manage` AND the tenant onboarding is incomplete — it is never a hard gate.
 *
 * @example <TenantOnboardingBanner tenantSlug="acme" organizationId={1} />
 */
export async function TenantOnboardingBanner({
  tenantSlug,
  organizationId,
}: {
  tenantSlug: string;
  organizationId: number;
}) {
  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenantSlug);

  const supabase = await createSupabaseServerClient();
  const { data: canManage } = await supabase.rpc("viewer_has_tenant_permission", {
    tenant_id: tenant["tenantId"],
    permission_id: "tenant_manage",
  });
  if (!canManage) return null;

  const state = await getTenantOnboardingState(tenant["tenantId"]);
  if (!TENANT_ONBOARDING_INCOMPLETE(state)) return null;

  const { t } = await getRosetta(LOCALES);
  const done = TENANT_COUNT_DONE(state.steps);
  const total = TENANT_STEP_ORDER.length;

  return (
    <Link
      href={ROUTE("/t/[tenant_slug]/[organization_id]/onboarding", {
        tenant_slug: tenantSlug,
        organization_id: organizationId,
      })}
      className="bg-muted/35 hover:bg-muted/50 flex w-full flex-col gap-3 rounded-md border border-dashed px-3.5 py-3 transition-colors sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="bg-foreground text-background inline-flex size-7 shrink-0 items-center justify-center rounded-lg">
          <Sparkles size={13} />
        </span>
        <span className="flex min-w-0 flex-col gap-px text-left">
          <span className="text-foreground text-sm font-medium">{t("title")}</span>
          <span className="text-muted-foreground text-xs">{t("progress", { done, total })}</span>
        </span>
      </div>
      <span className="bg-background text-foreground inline-flex h-8 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-3 text-xs font-medium">
        {t("cta")}
        <ArrowRight size={13} />
      </span>
    </Link>
  );
}

const LOCALE_ES = {
  title: "Termina de configurar tu empresa",
  progress: "{{done}} de {{total}} pasos listos",
  cta: "Continuar",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Finish setting up your company",
  progress: "{{done}} of {{total}} steps ready",
  cta: "Continue",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Termine de configurar sua empresa",
  progress: "{{done}} de {{total}} passos prontos",
  cta: "Continuar",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
