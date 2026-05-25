import type { Maybe } from "@packages/utils/maybe";

export type StepId = "name" | "email" | "phone" | "passkey" | "password";

export type OnboardingState = {
  profile_id: string;
  email: Maybe<string>;
  phone: Maybe<string>;
  profile_name_full: string;
  hasName: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasPasskey: boolean;
  hasPassword: boolean;
  profile_onboarded_at: Maybe<string>;
};

/**
 * Computes the canonical step the user should be on, given a requested step.
 *
 * Rules:
 * - `name` is required; missing name always wins.
 * - `email`, `phone`, `passkey`, `password` are skippable. The user may navigate freely
 *   between them via `?step=` query. We fall back to the first uncompleted suggestion
 *   when no step is requested (or when the requested step is already done).
 * - `email` and `phone` are cross-channel suggestions: signups happen via one or the other,
 *   so one is always missing at first. We suggest the missing one first.
 * - `password` is hidden when the user already has a password OR has a passkey.
 */
export function RESOLVE_STEP(state: OnboardingState, requested: string | undefined): StepId | "finish" {
  if (!state.hasName) return "name";

  const validSteps: StepId[] = ["name", "email", "phone", "passkey", "password"];
  const requestedStep = requested as StepId | undefined;
  if (requestedStep && validSteps.includes(requestedStep)) {
    const alreadyDone =
      (requestedStep === "email" && state.hasEmail) ||
      (requestedStep === "phone" && state.hasPhone) ||
      (requestedStep === "password" && (state.hasPassword || state.hasPasskey)) ||
      (requestedStep === "passkey" && state.hasPasskey);
    if (!alreadyDone) return requestedStep;
  }

  if (!state.hasEmail) return "email";
  if (!state.hasPhone) return "phone";
  if (!state.hasPasskey && !state.hasPassword) return "passkey";
  return "finish";
}

export function NEXT_STEP_HREF(current: StepId): string {
  const order: StepId[] = ["name", "email", "phone", "passkey", "password"];
  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return "/onboarding";
  return `/onboarding?step=${order[idx + 1]}`;
}
