import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";

export type StepId = "name" | "phone" | "passkey" | "password";

export type OnboardingState = {
  userId: string;
  email: string | null;
  fullName: string;
  hasName: boolean;
  hasPhone: boolean;
  hasPasskey: boolean;
  hasPassword: boolean;
  onboardedAt: string | null;
};

export async function loadOnboardingState(): Promise<OnboardingState> {
  const supabase = await createServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_name_full, profile_onboarded_at")
    .eq("profile_id", user.id)
    .maybeSingle();

  const factors = await supabase.auth.mfa.listFactors();
  const hasPasskey = (factors.data?.all ?? []).some(
    (f) => (f.factor_type as string) === "webauthn" && f.status === "verified",
  );

  const hasPassword = (user.identities ?? []).some((i) => i.provider === "email");
  const fullName = profile?.profile_name_full ?? (user.user_metadata?.full_name as string | undefined) ?? "";
  const hasName = fullName.trim().length >= 2;
  const hasPhone = Boolean(user.phone_confirmed_at);

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName,
    hasName,
    hasPhone,
    hasPasskey,
    hasPassword,
    onboardedAt: profile?.profile_onboarded_at ?? null,
  };
}

/**
 * Computes the canonical step the user should be on, given a requested step.
 *
 * Rules:
 * - `name` is required; missing name always wins.
 * - `phone`, `passkey`, `password` are skippable. The user may navigate freely
 *   between them via `?step=` query, but if no step is requested we pick the
 *   first one they haven't completed.
 * - `password` is hidden when the user already has a password OR has a passkey.
 */
export function resolveStep(state: OnboardingState, requested: string | undefined): StepId | "finish" {
  if (!state.hasName) return "name";

  const requestedStep = requested as StepId | undefined;
  if (requestedStep && (["name", "phone", "passkey", "password"] as StepId[]).includes(requestedStep)) {
    if (requestedStep === "password" && (state.hasPassword || state.hasPasskey)) {
      return "finish";
    }
    return requestedStep;
  }

  if (!state.hasPhone) return "phone";
  if (!state.hasPasskey && !state.hasPassword) return "passkey";
  return "finish";
}

export function nextStepHref(current: StepId): string {
  const order: StepId[] = ["name", "phone", "passkey", "password"];
  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return "/onboarding";
  return `/onboarding?step=${order[idx + 1]}`;
}
