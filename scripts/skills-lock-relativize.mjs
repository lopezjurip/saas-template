#!/usr/bin/env node
/**
 * Relativizes local `source` paths in `skills-lock.json`.
 *
 * The `skills` CLI resolves local paths to absolute ones (`parseSource` calls
 * `resolve()`), so `skills add`/`experimental_install` churn the committed lock
 * with a machine-specific path (different per Conductor workspace). Run this
 * after them to rewrite every `sourceType: "local"` entry back to repo-relative.
 *
 * Usage: node scripts/skills-lock-relativize.mjs
 */

import { promises as fs } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(import.meta.url), "..", "..");
const skillsLockPath = resolve(rootDir, "skills-lock.json");

const lock = JSON.parse(await fs.readFile(skillsLockPath, "utf8"));

for (const entry of Object.values(lock["skills"] ?? {})) {
  if (entry["sourceType"] !== "local") continue;
  const rel = relative(rootDir, resolve(rootDir, entry["source"]));
  entry["source"] = rel.startsWith(".") ? rel : `./${rel}`;
}

await fs.writeFile(skillsLockPath, `${JSON.stringify(lock, null, 2)}\n`);
console.log("✓ skills-lock.json local sources relativized");
