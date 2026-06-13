import type { Provider } from "@supabase/supabase-js";
import { AppleMark, FacebookMark, GitHubMark, GoogleMark, LinkedInMark, MicrosoftMark } from "./_components/auth-icons";

/**
 * Unified OAuth catalog. Order = render order on /auth. The first three are "main"
 * (big buttons), the rest collapse into the "Más opciones" 4-up icon grid.
 *
 * `enabled` reflects whether the provider is wired in supabase/config.toml; flip via
 * SUPABASE_AUTH_EXTERNAL_<PROVIDER>_* envs. Hiding disabled providers from the UI
 * would mask the admin's intent — leaving them rendered lets the runtime surface a
 * clear "provider not configured" error if someone clicks before the env is set.
 */
type MarkComponent = (props: { size?: number; className?: string }) => React.JSX.Element;

/**
 * Tuple form is required for `z.enum(...)` consumers in action schemas.
 */
export const OAUTH_PROVIDER_IDS = [
  "google",
  "apple",
  "azure",
  "github",
  "linkedin_oidc",
  "facebook",
] as const satisfies readonly Provider[];

export type OAuthProviderId = (typeof OAUTH_PROVIDER_IDS)[number];

export type OAuthProvider = {
  id: OAuthProviderId;
  label: string;
  Mark: MarkComponent;
  tier: "main" | "more";
};

export const OAUTH_PROVIDERS: ReadonlyArray<OAuthProvider> = [
  { id: "google", label: "Google", Mark: GoogleMark, tier: "main" },
  { id: "apple", label: "Apple", Mark: AppleMark, tier: "main" },
  { id: "azure", label: "Microsoft", Mark: MicrosoftMark, tier: "main" },
  { id: "github", label: "GitHub", Mark: GitHubMark, tier: "more" },
  { id: "linkedin_oidc", label: "LinkedIn", Mark: LinkedInMark, tier: "more" },
  { id: "facebook", label: "Facebook", Mark: FacebookMark, tier: "more" },
];

export const MAIN_OAUTH = OAUTH_PROVIDERS.filter((p) => p.tier === "main");
export const MORE_OAUTH = OAUTH_PROVIDERS.filter((p) => p.tier === "more");

export function isOAuthProvider(value: string): value is OAuthProviderId {
  return (OAUTH_PROVIDER_IDS as readonly string[]).includes(value);
}
