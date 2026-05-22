import type { Provider } from "@supabase/supabase-js";

export type OAuthProvider = {
  id: Provider;
  label: string;
};

export const OAUTH_PROVIDERS: ReadonlyArray<OAuthProvider> = [
  { id: "google", label: "Google" },
  { id: "azure", label: "Microsoft" },
  { id: "linkedin_oidc", label: "LinkedIn" },
  { id: "github", label: "GitHub" },
  { id: "facebook", label: "Facebook" },
];

export const OAUTH_PROVIDER_IDS = new Set<string>(OAUTH_PROVIDERS.map((p) => p.id));
