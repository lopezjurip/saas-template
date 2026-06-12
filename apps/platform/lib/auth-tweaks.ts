/**
 * Single source of truth for the UI knobs that came from the Claude design "Tweaks" panel.
 * Change a value here and the auth/onboarding/home surfaces follow — no plumbing required.
 */

export type SectionOrder = "oauth-first" | "local-first";
export type ObProgressKind = "chips" | "bar";
export type Density = "compact" | "regular" | "comfy";
export type Step1Variant = "selector" | "smart";
export type RecommendedMethod = "passkey" | "password" | "phone" | "email" | "document" | "profile" | "none";

export const AUTH_TWEAKS = {
  SECTION_ORDER: "oauth-first" as SectionOrder,
  STEP1_VARIANT: "smart" as Step1Variant,
  CAPTCHA: false,
  DENSITY: "regular" as Density,
  OB_PROGRESS: "chips" as ObProgressKind,
  OB_RECOMMENDED: "passkey" as RecommendedMethod,
} as const;
