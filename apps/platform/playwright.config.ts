import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * Load environment variables from monorepo root `.env.*` files.
 *
 * Playwright runs E2E fixtures that call `createSupabaseServiceRoleClient()`, which reads
 * `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` at module init.
 * Playwright doesn't execute Next.js config, so we hydrate `process.env` manually
 * using a tiny parser (no dependency on `@next/env` which is ESM-only).
 *
 * Precedence (highest first), matching Next: shell > .env.local > .env.development.local.
 * Existing entries are never overwritten; first source to set a key wins.
 */
const repoRoot = path.resolve(__dirname, "../..");
for (const envFile of [".env.local", ".env.development.local"]) {
  const envPath = path.join(repoRoot, envFile);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const rawValue = match[2];
    if (!key || rawValue === undefined) continue;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

/**
 * Base URL for E2E tests, resolved from environment variables.
 * Conductor assigns `PORT` per parallel instance; E2E suite must read the same value.
 * Matches dev script port resolution in `apps/platform/package.json` (`--port ${PORT:-7003}`).
 */
const PORT = process.env["PORT"] ?? "7003";
const APEX = process.env["NEXT_PUBLIC_APEX_HOSTNAME"] ?? "lvh.me";
const BASE_URL = `https://${APEX}:${PORT}`;

/**
 * Playwright E2E test configuration.
 *
 * - Disables parallel execution (`fullyParallel: false`, `workers: 1`) to avoid race conditions in tests.
 * - Self-signed dev cert (mkcert) requires `ignoreHTTPSErrors: true` since Chromium lacks the CA.
 * - In CI: enables `forbidOnly`, retries, and GitHub reporter for PR integration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: 1,
  reporter: process.env["CI"] ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
