import type { NextConfig } from "next";

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_COOKIE_DOMAIN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_TENANT_HOST",
];

const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const config: NextConfig = {
  transpilePackages: [
    "@packages/debug",
    "@packages/graphy",
    "@packages/kapso",
    "@packages/react-email",
    "@packages/supabase",
    "@packages/ui-common",
  ],
};

export default config;
