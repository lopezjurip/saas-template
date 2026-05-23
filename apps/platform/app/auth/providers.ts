import type { Provider } from "@supabase/supabase-js";

export const OAUTH_PROVIDER_IDS = ["google", "azure", "linkedin_oidc", "github", "facebook"] as const satisfies readonly Provider[];

export type OAuthProviderId = (typeof OAUTH_PROVIDER_IDS)[number];

export const OAUTH_PROVIDERS: ReadonlyArray<{ id: OAuthProviderId; label: string }> = [
  { id: "google", label: "Google" },
  { id: "azure", label: "Microsoft" },
  { id: "linkedin_oidc", label: "LinkedIn" },
  { id: "github", label: "GitHub" },
  { id: "facebook", label: "Facebook" },
];

export function isOAuthProvider(value: string): value is OAuthProviderId {
  return (OAUTH_PROVIDER_IDS as readonly string[]).includes(value);
}
