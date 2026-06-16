import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { OnboardingChecklist } from "./onboarding-checklist";
import { getTenantOnboardingState } from "./state.server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function TenantOnboardingPage(props: PageProps<"/t/[tenant_slug]/[organization_id]/onboarding">) {
  const { tenant_slug, organization_id } = await props.params;

  const {
    data: { tenant },
  } = await getViewerTenantBySlugAssert(tenant_slug);

  const supabase = await createSupabaseServerClient();
  const { data: canManage } = await supabase.rpc("viewer_has_tenant_permission", {
    tenant_id: tenant["tenantId"],
    permission_id: "tenant_manage",
  });
  if (!canManage) notFound();

  const state = await getTenantOnboardingState(tenant["tenantId"]);

  return (
    <main className="bg-muted dark:bg-background h-full flex-1 overflow-y-auto">
      <OnboardingChecklist
        tenantId={tenant["tenantId"]}
        tenantSlug={tenant_slug}
        organizationId={Number(organization_id)}
        steps={state.steps}
      />
    </main>
  );
}

const LOCALE_ES = { page_title: "Configura tu empresa" };
const LOCALE_EN: typeof LOCALE_ES = { page_title: "Set up your company" };
const LOCALE_PT: typeof LOCALE_ES = { page_title: "Configure sua empresa" };
const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
