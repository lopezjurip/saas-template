#!/usr/bin/env node
/**
 * Materializes skills into the agent stores on install — no network, no cloning.
 *
 * Sources are committed: first-party `my-*` + `codebase` in `skills/`, vendored
 * third-party in `skills-third-party/`. Each is symlinked into both agent stores
 * (`.agents/skills/` for Codex/Cursor/Copilot/OpenCode/Zed, `.claude/skills/` for
 * Claude Code), which stay gitignored. Also seeds `.env.local` from `.env.example`.
 *
 * We vendor third-party skills (committed) instead of `skills experimental_install`
 * because that clones every repo serially — slow. Refresh them with the `skills`
 * CLI and copy the result back into `skills-third-party/` (see AGENTS.md).
 *
 * TODO: once `skills install` is stable (no `experimental_` prefix) and clones in
 * parallel / fast enough, reconsider dropping the vendored `skills-third-party/`
 * and restoring third-party from `skills-lock.json` at install instead.
 *
 * Usage: pnpm skills:install (runs automatically via postinstall)
 */

import { promises as fs } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(import.meta.url), "..", "..");
const SOURCES = ["skills", "skills-third-party"];
const STORES = [".agents/skills", ".claude/skills"];

// Seed .env.local once — never clobber an existing one.
const envLocal = join(rootDir, ".env.local");
try {
  await fs.access(envLocal);
} catch {
  await fs.copyFile(join(rootDir, ".env.example"), envLocal);
  console.log("✓ Created .env.local from .env.example");
}

let linked = 0;
for (const store of STORES) {
  const storeAbs = join(rootDir, store);
  await fs.mkdir(storeAbs, { recursive: true });
  for (const src of SOURCES) {
    const srcAbs = join(rootDir, src);
    let names;
    try {
      names = await fs.readdir(srcAbs);
    } catch {
      continue; // source dir may not exist (e.g. no third-party yet)
    }
    for (const name of names) {
      if (name.startsWith(".")) continue;
      const link = join(storeAbs, name);
      await fs.rm(link, { recursive: true, force: true }); // replace stale symlink or copy
      await fs.symlink(relative(storeAbs, join(srcAbs, name)), link);
      linked++;
    }
  }
}

// ponytail: cheap self-check — a broken target means the symlink web is wrong.
for (const store of STORES) {
  for (const name of await fs.readdir(join(rootDir, store))) {
    await fs.access(join(rootDir, store, name, "SKILL.md"));
  }
}

console.log(`✓ Skills setup complete (${linked} symlinks)`);
