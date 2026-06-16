/**
 * Tenant onboarding mirrors the profile onboarding pattern (app/auth/onboarding): an extensible,
 * non-linear list of steps whose status is DERIVED from real state, so it is inherently resumable.
 * Derivable steps (logo set, first member) need no storage. It is a soft nudge — a banner on the
 * tenant home, never a hard gate. Add a step by extending TENANT_STEP_ORDER and its derivation in
 * state.server.ts.
 */

export type TenantOnboardingStepId = "tenant_logo" | "first_member";
export type TenantOnboardingStepStatus = "pending" | "done";

export type TenantOnboardingState = {
  tenant_id: number;
  tenant_onboarded_at: string | null;
  steps: Record<TenantOnboardingStepId, TenantOnboardingStepStatus>;
};

export const TENANT_STEP_ORDER: readonly TenantOnboardingStepId[] = ["tenant_logo", "first_member"] as const;

/** Number of steps the viewer has resolved (done). */
export function TENANT_COUNT_DONE(steps: TenantOnboardingState["steps"]): number {
  return TENANT_STEP_ORDER.filter((id) => steps[id] === "done").length;
}

/** Whether the banner/flow should still nudge: not finished and at least one step unresolved. */
export function TENANT_ONBOARDING_INCOMPLETE(state: TenantOnboardingState): boolean {
  return state.tenant_onboarded_at === null && TENANT_COUNT_DONE(state.steps) < TENANT_STEP_ORDER.length;
}
