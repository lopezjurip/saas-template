import type { NextConfig } from "next";

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_COOKIE_DOMAIN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APEX_HOST",
];

const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

// Feature-scoped env vars: missing here doesn't block boot, but the feature module
// will throw on first import. Warn loudly so misconfig is obvious in `pnpm dev` logs.
const featureEnvVars = ["WEBAUTHN_RELYING_PARTY_ID", "WEBAUTHN_RELYING_PARTY_NAME", "WEBAUTHN_RELYING_PARTY_ORIGIN"];
const missingFeatures = featureEnvVars.filter((v) => !process.env[v]);
if (missingFeatures.length > 0) {
  console.warn(
    `[next.config] Missing WebAuthn env vars: ${missingFeatures.join(", ")}. Passkey flows will fail until set — see .env.example.`,
  );
}

const config: NextConfig = {
  allowedDevOrigins: ["lvh.me", "*.lvh.me"],
  typedRoutes: true,
  transpilePackages: [
    "@packages/debug",
    "@packages/graphy",
    "@packages/kapso",
    "@packages/react-email",
    "@packages/react-pdf",
    "@packages/supabase",
    "@packages/ui-common",
  ],
};

export default config;
