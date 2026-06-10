#!/usr/bin/env node

import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const rootDir = resolve(__dirname, "..");
const agentsSkillsDir = join(rootDir, ".agents", "skills");
const claudeSkillsDir = join(rootDir, ".claude", "skills");
const skillsDir = join(rootDir, "skills");

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
];

const LEGACY_SKILLS = ["my-email", "my-pdf"];

async function symlink(target, source) {
  try {
    const stat = await fs.lstat(source);
    if (stat.isSymbolicLink()) {
      // Remove old symlink
      await fs.unlink(source);
    } else {
      // Don't remove directories — log warning
      console.warn(`⚠️  ${source} exists but is not a symlink. Skipping.`);
      return;
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }

  // Create parent if needed
  const sourceDir = source.split("/").slice(0, -1).join("/");
  try {
    await fs.mkdir(sourceDir, { recursive: true });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }

  await fs.symlink(target, source);
  console.log(`✓ ${source} → ${target}`);
}

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
    // Create /skills directory if needed
    await fs.mkdir(skillsDir, { recursive: true });

    for (const skill of LEGACY_SKILLS) {
      await removeLegacySymlink(join(agentsSkillsDir, skill));
      await removeLegacySymlink(join(claudeSkillsDir, skill));
    }

    // Set up symlinks in .agents/skills/
    for (const skill of SKILLS) {
      const source = join(agentsSkillsDir, skill);
      const target = `../../skills/${skill}`;
      await symlink(target, source);
    }

    // Set up symlinks in .claude/skills/
    for (const skill of SKILLS) {
      const source = join(claudeSkillsDir, skill);
      const target = `../../skills/${skill}`;
      await symlink(target, source);
    }

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
