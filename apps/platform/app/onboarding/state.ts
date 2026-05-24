import { createServerClient } from "@packages/supabase/client.server";
import type { Maybe } from "@packages/utils/maybe";
import { redirect } from "next/navigation";

export type StepId = "name" | "phone" | "passkey" | "password";

export type OnboardingState = {
  profile_id: string;
  email: Maybe<string>;
  profile_name_full: string;
  hasName: boolean;
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
  const hasPhone = Boolean(user["phone_confirmed_at"]);

  return {
    profile_id: user.id,
    email: user["email"],
    profile_name_full,
    hasName,
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
 * - `phone`, `passkey`, `password` are skippable. The user may navigate freely
 *   between them via `?step=` query, but if no step is requested we pick the
 *   first one they haven't completed.
 * - `password` is hidden when the user already has a password OR has a passkey.
 */
export function RESOLVE_STEP(state: OnboardingState, requested: string | undefined): StepId | "finish" {
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

export function NEXT_STEP_HREF(current: StepId): string {
  const order: StepId[] = ["name", "phone", "passkey", "password"];
  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return "/onboarding";
  return `/onboarding?step=${order[idx + 1]}`;
}
