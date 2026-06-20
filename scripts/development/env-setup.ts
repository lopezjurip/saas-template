#!/usr/bin/env node
/**
 * Writes .env.development.local for all apps from `supabase status -o env`.
 * Configures environment variables for local development, including Supabase credentials,
 * WebAuthn settings, and Claude Code integration.
 *
 * Usage: Run after `pnpm db:start`: pnpm db:env:development
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SUPABASE_DIR = join(ROOT, "packages/supabase");
const TARGET_FILENAME = ".env.development.local";
const TARGET_PATH = join(ROOT, TARGET_FILENAME);
// apps/platform reads env via @next/env loadEnvConfig — must live in the app dir
const PLATFORM_ENV_PATH = join(ROOT, "apps/platform", TARGET_FILENAME);
const CLAUDE_SETTINGS_DIR = join(ROOT, ".claude");
const CLAUDE_SETTINGS_PATH = join(CLAUDE_SETTINGS_DIR, "settings.local.json");

let raw: string;
try {
  raw = execSync("pnpm supabase status -o env", { cwd: SUPABASE_DIR, encoding: "utf-8" });
} catch {
  console.warn("Failed to get supabase status. Is the DB running? will run: pnpm db:start");
  raw = execSync("pnpm db:start -o env", { cwd: SUPABASE_DIR, encoding: "utf-8" });
  process.exit(1);
}

const env: Record<string, string> = Object.fromEntries(
  raw
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const SUPABASE_ANON_KEY = env["ANON_KEY"] ?? "";
const SUPABASE_SERVICE_ROLE_KEY = env["SERVICE_ROLE_KEY"] ?? "";
const DATABASE_URL = env["DB_URL"] ?? "";

// When running on an exe.dev VM, browser-facing URLs must use the VM's public host
// `<vm>.exe.xyz` (TLS terminated by exe.dev's proxy, ports forwarded in 3000-9999) instead
// of `127.0.0.1`/lvh.me. Set by exe-dev-setup.sh. Server-only URLs (DATABASE_URL) stay local
// because the app runs ON the VM. See scripts/development/exe-dev-setup.sh.
const EXE_HOST = process.env["EXE_HOST"];

/** Rewrite a local `http://127.0.0.1:<port>` URL to the public `https://<exe-host>:<port>`. No-op locally. */
function publicUrl(localUrl: string): string {
  if (!EXE_HOST) return localUrl;
  try {
    const u = new URL(localUrl);
    return `https://${EXE_HOST}${u.port ? `:${u.port}` : ""}`;
  } catch {
    return localUrl;
  }
}

const SUPABASE_URL = publicUrl(env["API_URL"] ?? "http://127.0.0.1:54421");
const APEX_HOSTNAME = EXE_HOST ?? "lvh.me";

/** Environment variables for local development, including public and secret values. */
const variables: Array<{ key: string; value: string; secret: boolean }> = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", value: SUPABASE_URL, secret: false },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: SUPABASE_ANON_KEY, secret: false },
  { key: "NEXT_PUBLIC_COOKIE_DOMAIN", value: APEX_HOSTNAME, secret: false },
  { key: "NEXT_PUBLIC_APEX_HOSTNAME", value: APEX_HOSTNAME, secret: false },
  {
    key: "NEXT_PUBLIC_DEV_MAILBOX_URL",
    value: publicUrl(env["INBUCKET_URL"] ?? "http://localhost:54424"),
    secret: false,
  },
  { key: "SUPABASE_SERVICE_ROLE_KEY", value: SUPABASE_SERVICE_ROLE_KEY, secret: true },
  { key: "DATABASE_URL", value: DATABASE_URL, secret: true },
];

const content = variables
  .map(({ key, value, secret }) => {
    const display = value.length === 0 ? "(empty)" : secret ? "********" : value;
    console.log(`  - setting "${key}"=${display}`);
    return `${key}=${value}`;
  })
  .join("\n");

writeFileSync(TARGET_PATH, `${content}\n`);
console.log(`wrote ${TARGET_FILENAME}`);

// Mirror into apps/platform so graphql-codegen (via @next/env loadEnvConfig) picks up dynamic ports.
// apps/platform/.env.local has default fallback values; this .env.development.local overrides them.
writeFileSync(PLATFORM_ENV_PATH, `${content}\n`);
console.log(`wrote apps/platform/${TARGET_FILENAME}`);

/**
 * Injects DATABASE_URL into .claude/settings.local.json so Claude Code tool calls
 * see it as a regular env var — no need to source .env files per shell. Merges
 * into any existing settings (permissions, etc.) and preserves unrelated keys.
 */
if (DATABASE_URL.length > 0) {
  mkdirSync(CLAUDE_SETTINGS_DIR, { recursive: true });
  let settings: Record<string, unknown> = {};
  if (existsSync(CLAUDE_SETTINGS_PATH)) {
    try {
      settings = JSON.parse(readFileSync(CLAUDE_SETTINGS_PATH, "utf-8"));
    } catch {
      console.warn(`could not parse ${CLAUDE_SETTINGS_PATH} — overwriting`);
    }
  }
  const envBlock = (settings["env"] as Record<string, string> | undefined) ?? {};
  envBlock["DATABASE_URL"] = DATABASE_URL.replace(/^"(.*)"$/, "$1");
  settings["env"] = envBlock;
  writeFileSync(CLAUDE_SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`);
  console.log("wrote DATABASE_URL into .claude/settings.local.json (restart Claude to pick it up)");
}

console.log("✅ done env.setup.ts");
