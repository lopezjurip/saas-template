import { createServerClient } from "@packages/supabase/client.server";
import type { Maybe } from "@packages/utils/maybe";
import { redirect } from "next/navigation";

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

  const { count: passkeyCount } = await supabase
    .from("webauthn_credentials")
    .select("webauthn_credential_id", { head: true, count: "exact" })
    .eq("profile_id", user.id);
  const hasPasskey = (passkeyCount ?? 0) > 0;

  const hasPassword = (user["identities"] ?? []).some((i) => i["provider"] === "email");
  const profile_name_full = profile?.["profile_name_full"] || "";
  const hasName = profile_name_full.trim().length >= 2;
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);

  return {
    profile_id: user.id,
    email: user["email"],
    phone: user["phone"],
    profile_name_full,
    hasName,
    hasEmail,
    hasPhone,
    hasPasskey,
    hasPassword,
    profile_onboarded_at: profile?.["profile_onboarded_at"],
  };
}

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
