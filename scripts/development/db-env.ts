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

const apexHost = "lvh.me:7003";

const publicVars = [
  `NEXT_PUBLIC_SUPABASE_URL=${url}`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
  "NEXT_PUBLIC_COOKIE_DOMAIN=lvh.me",
  `NEXT_PUBLIC_APEX_HOST=${apexHost}`,
  // Mailpit catch-all inbox — surfaced in dev UIs so signup confirmation emails are easy to open.
  "NEXT_PUBLIC_DEV_MAILBOX_URL=http://localhost:54424",
].join("\n");

const serverVars = `${publicVars}\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`;

const files: [string, string][] = [["apps/platform/.env.local", `${serverVars}\n`]];

for (const [rel, content] of files) {
  writeFileSync(join(ROOT, rel), content);
  console.log(`wrote ${rel}`);
}
