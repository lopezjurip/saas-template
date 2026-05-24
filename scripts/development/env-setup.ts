#!/usr/bin/env node
// Writes .env.local for all apps from `supabase status -o env`.
// Run after `pnpm db:start`: pnpm db:env:development

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SUPABASE_DIR = join(ROOT, "packages/supabase");
const TARGET_FILENAME = ".env.development.local";
const TARGET_PATH = join(ROOT, "apps/platform", TARGET_FILENAME);

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

const SUPABASE_URL = env["API_URL"] ?? "http://127.0.0.1:54421";
const SUPABASE_ANON_KEY = env["ANON_KEY"] ?? "";
const SUPABASE_SERVICE_ROLE_KEY = env["SERVICE_ROLE_KEY"] ?? "";

const APEX_HOST = "lvh.me:7003";

const variables: Array<{ key: string; value: string; secret: boolean }> = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", value: SUPABASE_URL, secret: false },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: SUPABASE_ANON_KEY, secret: false },
  { key: "NEXT_PUBLIC_COOKIE_DOMAIN", value: "lvh.me", secret: false },
  { key: "NEXT_PUBLIC_APEX_HOST", value: APEX_HOST, secret: false },
  // Mailpit catch-all inbox — surfaced in dev UIs so signup confirmation emails are easy to open.
  { key: "NEXT_PUBLIC_DEV_MAILBOX_URL", value: "http://localhost:54424", secret: false },
  { key: "SUPABASE_SERVICE_ROLE_KEY", value: SUPABASE_SERVICE_ROLE_KEY, secret: true },
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
