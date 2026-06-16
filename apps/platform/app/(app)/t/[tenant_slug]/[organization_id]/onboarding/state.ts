/**
 * Tenant onboarding mirrors the profile onboarding pattern (app/auth/onboarding): an extensible,
 * non-linear list of steps whose status is DERIVED from real state wherever possible, so it is
 * inherently resumable. Derivable steps (logo set, first member) need no storage; non-derivable
 * steps (billing) record their status in `tenants.tenant_onboarding_state`. It is a soft nudge —
 * a banner on the tenant home, never a hard gate. Add a step by extending TENANT_STEP_ORDER and
 * its derivation in state.server.ts.
 */

export type TenantOnboardingStepId = "tenant_logo" | "first_member" | "billing";
export type TenantOnboardingStepStatus = "pending" | "done" | "skipped";

export type TenantOnboardingState = {
  tenant_id: number;
  tenant_onboarded_at: string | null;
  steps: Record<TenantOnboardingStepId, TenantOnboardingStepStatus>;
};

export const TENANT_STEP_ORDER: readonly TenantOnboardingStepId[] = ["tenant_logo", "first_member", "billing"] as const;

/** Steps that the viewer has acted on (done) or explicitly dismissed (skipped) both count as resolved. */
export function TENANT_COUNT_DONE(steps: TenantOnboardingState["steps"]): number {
  return TENANT_STEP_ORDER.filter((id) => steps[id] === "done" || steps[id] === "skipped").length;
}

/** Whether the banner/flow should still nudge: not finished and at least one step unresolved. */
export function TENANT_ONBOARDING_INCOMPLETE(state: TenantOnboardingState): boolean {
  return state.tenant_onboarded_at === null && TENANT_COUNT_DONE(state.steps) < TENANT_STEP_ORDER.length;
}
