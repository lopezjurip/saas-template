import "server-only";

import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { TenantOnboardingState, TenantOnboardingStepStatus } from "./state";

/**
 * Derives the tenant onboarding state. Logo and first-member are read from real state
 * (storage + memberships); billing has no backend yet, so its status comes from the
 * `tenant_onboarding_state` jsonb that the set RPC writes. RLS scopes every read to what the
 * viewer may see — the banner is only rendered to tenant_manage holders anyway.
 *
 * @example const state = await getTenantOnboardingState(1)
 */
export async function getTenantOnboardingState(tenant_id: number): Promise<TenantOnboardingState> {
  const supabase = await createSupabaseServerClient();

  const [logoResult, tenantResult, orgsResult] = await Promise.all([
    supabase
      .from("storage_tenants")
      .select("storage_tenant_id", { count: "exact", head: true })
      .eq("tenant_id", tenant_id)
      .eq("folder", "avatar"),
    supabase
      .from("tenants")
      .select("tenant_onboarded_at, tenant_onboarding_state")
      .eq("tenant_id", tenant_id)
      .maybeSingle(),
    supabase.from("organizations").select("organization_id").eq("tenant_id", tenant_id),
  ]);

  const hasLogo = (logoResult.count ?? 0) > 0;

  const orgIds = orgsResult.data?.map((row) => row["organization_id"]) ?? [];
  let membershipCount = 0;
  if (orgIds.length > 0) {
    const { count } = await supabase
      .from("organization_memberships")
      .select("organization_membership_id", { count: "exact", head: true })
      .in("organization_id", orgIds);
    membershipCount = count ?? 0;
  }
  // Founder is the first membership; anything beyond means a teammate was invited or joined.
  const hasFirstMember = membershipCount > 1;

  const onboardingState = (tenantResult.data?.["tenant_onboarding_state"] ?? {}) as Record<string, string>;
  const billingFlag = onboardingState["billing"];
  const billing: TenantOnboardingStepStatus =
    billingFlag === "done" || billingFlag === "skipped" ? (billingFlag as TenantOnboardingStepStatus) : "pending";

  return {
    tenant_id,
    tenant_onboarded_at: tenantResult.data?.["tenant_onboarded_at"] ?? null,
    steps: {
      tenant_logo: hasLogo ? "done" : "pending",
      first_member: hasFirstMember ? "done" : "pending",
      billing,
    },
  };
}
