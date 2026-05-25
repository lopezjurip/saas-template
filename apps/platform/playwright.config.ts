import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Hydrate process.env from the monorepo root env files before specs evaluate.
// Specs reach createServiceRoleClient() (via the fixture), which reads NEXT_PUBLIC_SUPABASE_URL
// and SUPABASE_SERVICE_ROLE_KEY at module init. Playwright doesn't run our Next config, so we
// load these ourselves. Tiny parser, no dependency on @next/env (which is ESM-only and blows
// up Playwright's CJS transpile of this config).
//
// Precedence (highest first), matching Next: shell > .env.local > .env.development.local.
// Existing entries are never overwritten, so the first source to set a key wins.
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

// Match the dev script's port resolution (apps/platform/package.json `dev`):
// `--port ${PORT:-7003}`. Conductor assigns PORT per parallel instance, so the
// E2E suite must read the same env var.
const PORT = process.env["PORT"] ?? "7003";
const APEX = process.env["NEXT_PUBLIC_APEX_HOSTNAME"] ?? "lvh.me";
const BASE_URL = `https://${APEX}:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: 1,
  reporter: process.env["CI"] ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    // The dev cert is self-signed (mkcert) and the cert authority isn't installed in
    // Playwright's Chromium. Without this, every navigation fails with ERR_CERT_AUTHORITY_INVALID.
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
