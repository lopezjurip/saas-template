#!/usr/bin/env node
/**
 * Sets up skills for every agent on install. Two kinds:
 *
 *  1. First-party `my-*` skills — sources live in `skills/` (committed). Symlinked
 *     into `.agents/skills/` (universal store: Codex, Cursor, Copilot, OpenCode, Zed)
 *     and `.claude/skills/` (Claude Code).
 *  2. Third-party skills — not committed (the generated trees are gitignored).
 *     Restored from `skills-lock.json` via the `skills` CLI into `.agents/skills/`.
 *
 * Both generated dirs (`.agents/skills/`, `.claude/skills/`) are gitignored; this
 * script is the single source that materializes them. Also initializes `.env.local`
 * from `.env.example` if it doesn't exist.
 *
 * Usage: pnpm skills-setup (runs automatically via postinstall)
 */

import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const rootDir = resolve(__dirname, "..");
const agentsSkillsDir = join(rootDir, ".agents", "skills");
const claudeSkillsDir = join(rootDir, ".claude", "skills");
const skillsDir = join(rootDir, "skills");
const skillsLockPath = join(rootDir, "skills-lock.json");

const SKILLS = [
  "my-graphql",
  "my-i18n",
  "my-graphql-codegen",
  "my-supabase",
  "my-supabase-codegen",
  "my-supabase-react",
  "my-graphy",
  "my-auth",
  "my-react-pdf",
  "my-react-email",
  "my-permissions",
  "my-proxy",
  "psql",
  "psql-query",
];

const LEGACY_SKILLS = ["my-email", "my-pdf"];

/**
 * Creates a symlink from source to target, removing existing symlinks if needed.
 * @param {string} target - The target path the symlink points to.
 * @param {string} source - The symlink path to create.
 */
async function symlink(target, source) {
  try {
    const stat = await fs.lstat(source);
    if (stat.isSymbolicLink()) {
      await fs.unlink(source);
    } else {
      console.warn(`⚠️  ${source} exists but is not a symlink. Skipping.`);
      return;
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }

  const sourceDir = source.split("/").slice(0, -1).join("/");
  try {
    await fs.mkdir(sourceDir, { recursive: true });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }

  await fs.symlink(target, source);
  console.log(`✓ ${source} → ${target}`);
}

/**
 * Removes a legacy symlink if it exists and is a symbolic link.
 * @param {string} source - The symlink path to remove.
 */
async function removeLegacySymlink(source) {
  try {
    const stat = await fs.lstat(source);
    if (stat.isSymbolicLink()) {
      await fs.unlink(source);
      console.log(`✓ Removed legacy symlink ${source}`);
    } else {
      console.warn(`⚠️  ${source} exists but is not a symlink. Skipping.`);
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

/**
 * Restores third-party skills from `skills-lock.json` via the `skills` CLI.
 *
 * The CLI's `experimental_install` re-clones each skill's source at HEAD and rewrites
 * `skills-lock.json` with freshly computed hashes — so a naive call would churn the
 * committed lock on every install. We snapshot the lock bytes before the call and write
 * them back after, keeping the committed manifest stable. Non-fatal: a registry/network
 * outage logs a warning but never fails the install (first-party `my-*` skills are
 * already wired by the symlink pass above).
 */
async function restoreThirdPartySkills() {
  const cliPath = join(rootDir, "node_modules", "skills", "bin", "cli.mjs");
  try {
    await fs.access(cliPath);
  } catch {
    console.warn("⚠️  skills CLI not installed yet — skipping third-party skill restore.");
    return;
  }

  let lockSnapshot;
  try {
    lockSnapshot = await fs.readFile(skillsLockPath);
  } catch {
    console.warn("⚠️  skills-lock.json missing — skipping third-party skill restore.");
    return;
  }

  console.log("Restoring third-party skills from skills-lock.json...");
  try {
    execFileSync(process.execPath, [cliPath, "experimental_install", "-y"], {
      stdio: "inherit",
      cwd: rootDir,
    });
  } catch (error) {
    console.warn(`⚠️  Third-party skill restore failed (skills still usable once network returns): ${error.message}`);
  } finally {
    // Re-pin to the committed manifest so installs never churn skills-lock.json.
    await fs.writeFile(skillsLockPath, lockSnapshot);
  }

  // The CLI only populates the universal `.agents/skills/` store (read directly by
  // Codex, Cursor, Copilot, OpenCode, Zed). Claude Code reads `.claude/skills/`, so
  // mirror each restored third-party skill there as a symlink into the universal store.
  let names = [];
  try {
    names = Object.keys(JSON.parse(lockSnapshot.toString())["skills"] ?? {});
  } catch {
    return;
  }
  for (const name of names) {
    try {
      await fs.access(join(agentsSkillsDir, name));
    } catch {
      continue; // restore skipped/failed for this skill — nothing to link
    }
    await symlink(`../../.agents/skills/${name}`, join(claudeSkillsDir, name));
  }
}

/**
 * Initializes .env.local from .env.example if it doesn't already exist.
 */
async function initEnv() {
  const envExample = join(rootDir, ".env.example");
  const envLocal = join(rootDir, ".env.local");
  try {
    await fs.access(envLocal);
    console.log("✓ .env.local already exists, skipping copy.");
  } catch {
    await fs.copyFile(envExample, envLocal);
    console.log("✓ Created .env.local from .env.example (update with real values before deploying).");
  }
}

async function main() {
  await initEnv();
  console.log("Setting up custom skills symlinks...");

  try {
    await fs.mkdir(skillsDir, { recursive: true });

    for (const skill of LEGACY_SKILLS) {
      await removeLegacySymlink(join(agentsSkillsDir, skill));
      await removeLegacySymlink(join(claudeSkillsDir, skill));
    }

    for (const skill of SKILLS) {
      const source = join(agentsSkillsDir, skill);
      const target = `../../skills/${skill}`;
      await symlink(target, source);
    }

    for (const skill of SKILLS) {
      const source = join(claudeSkillsDir, skill);
      const target = `../../skills/${skill}`;
      await symlink(target, source);
    }

    await restoreThirdPartySkills();

    console.log("✓ Skills setup complete!");
  } catch (error) {
    console.error("Error setting up skills:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
