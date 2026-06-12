import { execSync } from "node:child_process";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import pkg from "~/package.json" with { type: "json" };

const envDir = path.resolve(import.meta.dirname, "../..");
console.log(`[next.config.ts] Loading environment variables from ${envDir}`);
/**
 * forceReload=true: Next.js already ran loadEnvConfig(process.cwd()) before evaluating this
 * config, which cached an empty result for apps/platform/. Without forceReload the second call
 * short-circuits on that cache and silently skips the monorepo-root .env files.
 */
loadEnvConfig(envDir, (process.env.NODE_ENV ?? "development") !== "production", console, true);

const NODE_ENV = process.env.NODE_ENV || "development";
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PORT = process.env.PORT || 9000;
const VERSION = pkg["version"];

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_COOKIE_DOMAIN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APEX_HOSTNAME",
];

const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

/**
 * Feature-scoped env vars: missing here doesn't block boot, but the feature module
 * will throw on first import. Warn loudly so misconfig is obvious in `pnpm dev` logs.
 */
const featureEnvVars = ["WEBAUTHN_RELYING_PARTY_ID", "WEBAUTHN_RELYING_PARTY_NAME", "WEBAUTHN_RELYING_PARTY_ORIGIN"];
const missingFeatures = featureEnvVars.filter((v) => !process.env[v]);
if (missingFeatures.length > 0) {
  console.warn(
    `[next.config] Missing WebAuthn env vars: ${missingFeatures.join(", ")}. Passkey flows will fail until set — see .env.example.`,
  );
}

const otelEnvVars = ["OTEL_EXPORTER_OTLP_ENDPOINT", "OTEL_SERVICE_NAME"];
const missingOtel = otelEnvVars.filter((v) => !process.env[v]);
if (missingOtel.length > 0) {
  console.debug(
    `[next.config] Missing OTEL env vars: ${missingOtel.join(", ")}. Traces will not be exported — see .env.example.`,
  );
}

const DEBUG = process.env.DEBUG;

const VERCEL_GIT_COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA;
const VERCEL_GIT_COMMIT_MESSAGE = process.env.VERCEL_GIT_COMMIT_MESSAGE;

/**
 * You can access the server in a local network (tested in MacBook only).
 * Eg: http://lopezjurip-macbook.local:9000/
 */
function LOCAL_HOSTNAME(): string | null {
  try {
    const local = execSync("scutil --get LocalHostName").toString().trim();
    return new URL(`http://${local}.local:${PORT}/`).href;
  } catch (_error) {
    return null;
  }
}

const hostname = NODE_ENV === "development" ? LOCAL_HOSTNAME() : null;

console.log("[next.config.ts] environment: %O", {
  NODE_ENV,
  DEBUG,
  VERSION,
  NEXT_PUBLIC_SUPABASE_URL,
  hostname: hostname,
});

/**
 * Render QR code in the terminal to access the local server in a mobile device (same WiFi network).
 * `qrcode-terminal` is optional — skip silently if not installed.
 */
if (hostname) {
  import("qrcode-terminal")
    .then(({ default: qrcode }) => {
      qrcode.generate(hostname, { small: true }, (str: string) => console.log(str));
    })
    .catch(() => {
      console.debug("[next.config.ts] qrcode-terminal not found, skipping QR code generation for local hostname");
    });
}

const config: NextConfig = {
  allowedDevOrigins: ["lvh.me"],
  typedRoutes: true,
  transpilePackages: [
    "@packages/debug",
    "@packages/graphy",
    "@packages/kapso",
    "@packages/react-email",
    "@packages/react-hooks",
    "@packages/react-pdf",
    "@packages/rosetta",
    "@packages/supabase",
    "@packages/ui-common",
  ],
};

export default config;
