#!/usr/bin/env node
// Rewrites the project name in the generated `codebase` reference skill.
//
// repomix's local `--skill-generate` has no way to set the project name: it
// always uses `toTitleCase(basename(cwd))` (see repomix `skillUtils.ts`
// `generateProjectName`). In a Conductor worktree the cwd is the ephemeral
// instance name (e.g. "karachi-v2"), so the skill leaks "Karachi V2" into its
// frontmatter description and H1 instead of the real project name.
//
// There is no `--skill-project-name` CLI flag (the `skillProjectName` field is
// wired only for the remote-URL path), so we fix it after generation: read the
// name repomix actually emitted, then replace every occurrence with the
// canonical display name across the skill files.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Canonical display name — must match the AGENTS.md title, not the folder/worktree.
const PROJECT_NAME = "SaaS Template";

const SKILL_DIR = path.resolve(process.cwd(), "skills/codebase");
const SKILL_MD = path.join(SKILL_DIR, "SKILL.md");
const FILES = [
  SKILL_MD,
  path.join(SKILL_DIR, "references/summary.md"),
  path.join(SKILL_DIR, "references/project-structure.md"),
  path.join(SKILL_DIR, "references/files.md"),
  path.join(SKILL_DIR, "references/tech-stacks.md"),
];

// Extract the name repomix generated from the description template
// (`generateSkillDescription` in repomix `skillUtils.ts`).
const skillMd = readFileSync(SKILL_MD, "utf8");
const match = skillMd.match(/Reference codebase for (.+?)\. Use this skill/);
if (!match) {
  console.error(
    "[repomix-skill-rename] could not find the generated project name in SKILL.md — " +
      "the repomix description template likely changed. Aborting so the worktree name " +
      "is not silently committed into the skill.",
  );
  process.exit(1);
}

const generatedName = match[1];
if (generatedName === PROJECT_NAME) {
  console.log(`[repomix-skill-rename] already "${PROJECT_NAME}" — nothing to do`);
  process.exit(0);
}

let changed = 0;
for (const file of FILES) {
  let contents;
  try {
    contents = readFileSync(file, "utf8");
  } catch {
    continue; // references/* set may vary by repomix version
  }
  if (!contents.includes(generatedName)) continue;
  writeFileSync(file, contents.replaceAll(generatedName, PROJECT_NAME));
  changed++;
}

console.log(`[repomix-skill-rename] "${generatedName}" → "${PROJECT_NAME}" in ${changed} file(s)`);
