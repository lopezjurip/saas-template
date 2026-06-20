import os from "node:os";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import pkg from "~/package.json" with { type: "json" };

const NODE_ENV = process.env["NODE_ENV"] || "development";

const env_dir = path.resolve(import.meta.dirname, "../..");
console.log(`[next.config.ts] Loading environment variables from ${env_dir}`);
/**
 * forceReload=true: Next.js already ran loadEnvConfig(process.cwd()) before evaluating this
 * config, which cached an empty result for apps/platform/. Without forceReload the second call
 * short-circuits on that cache and silently skips the monorepo-root .env files.
 */
loadEnvConfig(env_dir, NODE_ENV !== "production", console, true);

const NEXT_PUBLIC_SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const PORT = process.env["PORT"] || 9000;
/**
 * `next dev --experimental-https` sets the `__NEXT_EXPERIMENTAL_HTTPS` env var on that worker.
 */
const PROTOCOL = process.env["__NEXT_EXPERIMENTAL_HTTPS"] ? "https" : "http"; // for auth passkeys in development.
const VERSION = pkg["version"];

const DEBUG = process.env["DEBUG"];
const VERCEL_GIT_COMMIT_SHA = process.env["VERCEL_GIT_COMMIT_SHA"];
const VERCEL_GIT_COMMIT_MESSAGE = process.env["VERCEL_GIT_COMMIT_MESSAGE"];

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

const otelEnvVars = ["OTEL_EXPORTER_OTLP_ENDPOINT", "OTEL_SERVICE_NAME"];
const missingOtel = otelEnvVars.filter((v) => !process.env[v]);
if (missingOtel.length > 0) {
  console.debug(
    `[next.config] Missing OTEL env vars: ${missingOtel.join(", ")}. Traces will not be exported — see .env.example.`,
  );
}

/**
 * Builds the local-network URL so the server is reachable from other devices on the same WiFi.
 * Uses os.hostname() — on macOS this returns the `.local` name.
 * @example LOCAL_HOSTNAME() // "http://lopezjurip-macbook.local:9000/"
 */
function LOCAL_HOSTNAME(): string | null {
  try {
    return new URL(`${PROTOCOL}://${os.hostname()}:${PORT}/`).href;
  } catch {
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
  localhost: `${PROTOCOL}://localhost:${PORT}`,
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
  // On exe.dev the dev server is reached via https://<vm>.exe.xyz:<port>; the host must be
  // allow-listed (env-setup.ts writes NEXT_PUBLIC_APEX_HOSTNAME=<vm>.exe.xyz there). Defaults to lvh.me.
  allowedDevOrigins: [process.env["NEXT_PUBLIC_APEX_HOSTNAME"] ?? "lvh.me"],
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
