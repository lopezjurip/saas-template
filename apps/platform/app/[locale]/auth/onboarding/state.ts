// Onboarding is non-linear: 6 independent methods, any of which can be done now, later,
// or skipped entirely. The hub renders one card per method showing its current status
// (pending / done / skipped) and a "recommended" star if it matches AUTH_TWEAKS.OB_RECOMMENDED.
// We do NOT redirect users away from /home if onboarding is incomplete — there's just a
// banner there nudging them back. See ../actions.ts for `actionFinishOnboarding`.

import { ROUTE_PATH } from "~/lib/route";

export type OnboardingMethodId = "passkey" | "password" | "phone" | "email" | "document" | "profile";
export type OnboardingMethodStatus = "pending" | "done" | "skipped";

export type OnboardingMethod = {
  id: OnboardingMethodId;
  status: OnboardingMethodStatus;
};

export type OnboardingState = {
  profile_id: string;
  email: string | null;
  phone: string | null;
  profile_name_full: string;
  profile_onboarded_at: string | null;
  methods: Record<OnboardingMethodId, OnboardingMethodStatus>;
};

export const METHOD_ORDER: readonly OnboardingMethodId[] = [
  "passkey",
  "password",
  "phone",
  "email",
  "document",
  "profile",
] as const;

const METHOD_PATHS = {
  passkey: ROUTE_PATH("/[locale]/auth/onboarding/passkey"),
  password: ROUTE_PATH("/[locale]/auth/onboarding/password"),
  phone: ROUTE_PATH("/[locale]/auth/onboarding/phone"),
  email: ROUTE_PATH("/[locale]/auth/onboarding/email"),
  document: ROUTE_PATH("/[locale]/auth/onboarding/document"),
  profile: ROUTE_PATH("/[locale]/auth/onboarding/profile"),
} as const satisfies Record<OnboardingMethodId, string>;

export function ONBOARDING_METHOD_PATH(id: OnboardingMethodId): (typeof METHOD_PATHS)[OnboardingMethodId] {
  return METHOD_PATHS[id];
}

export function COUNT_DONE(methods: OnboardingState["methods"]): number {
  return METHOD_ORDER.filter((id) => methods[id] === "done").length;
}
