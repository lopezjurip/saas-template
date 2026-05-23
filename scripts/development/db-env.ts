#!/usr/bin/env node
// Writes .env.local for all apps from `supabase status -o env`.
// Run after `pnpm db:start`: pnpm db:env:development

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SUPABASE_DIR = join(ROOT, "packages/supabase");

let raw: string;
try {
  raw = execSync("pnpm supabase status -o env", { cwd: SUPABASE_DIR, encoding: "utf-8" });
} catch {
  console.error("Failed to get supabase status. Is the DB running? Try: pnpm db:start");
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

const url = env.API_URL ?? "http://127.0.0.1:54421";
const anonKey = env.ANON_KEY ?? "";
const serviceRoleKey = env.SERVICE_ROLE_KEY ?? "";

const publicVars = [
  `NEXT_PUBLIC_SUPABASE_URL=${url}`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
  `NEXT_PUBLIC_COOKIE_DOMAIN=lvh.me`,
].join("\n");

const serverVars = `${publicVars}\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`;

const tenantHost = "lvh.me:7002";
const platformUrl = "http://platform.lvh.me:7003";

const files: [string, string][] = [
  // landing: public vars only — no service role, no auth imports per isolation rules
  ["apps/landing/.env.local", `${publicVars}\n`],
  ["apps/platform/.env.local", `${serverVars}\nNEXT_PUBLIC_TENANT_HOST=${tenantHost}\n`],
  ["apps/tenant/.env.local", `${serverVars}\nNEXT_PUBLIC_TENANT_HOST=${tenantHost}\nNEXT_PUBLIC_PLATFORM_URL=${platformUrl}\n`],
];

for (const [rel, content] of files) {
  writeFileSync(join(ROOT, rel), content);
  console.log(`wrote ${rel}`);
}
