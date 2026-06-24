This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed, content has been compressed (code blocks are separated by ⋮---- delimiter).

# Summary

## Purpose

This is a reference codebase organized into multiple files for AI consumption.
It is designed to be easily searchable using grep and other text-based tools.

## File Structure

This skill contains the following reference files:

| File | Contents |
|------|----------|
| `project-structure.md` | Directory tree with line counts per file |
| `files.md` | All file contents (search with `## File: <path>`) |
| `tech-stacks.md` | Languages, frameworks, and dependencies per package (search with `## Tech Stack: <path>`) |
| `summary.md` | This file - purpose and format explanation |

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: packages/supabase/src/types.ts, **/generated/**, pnpm-lock.yaml, .context/**, skills/codebase/**, skills-third-party/**, **/*.test.ts, **/*.test.tsx, **/*.spec.ts, **/*.test.sql, apps/platform/tests/**, **/*.pem, **/certificates/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Long base64 data strings (e.g., data:image/png;base64,...) have been truncated to reduce token count
- Files are sorted by Git change count (files with more changes are at the bottom)

## Statistics

513 files | 16,234 lines

| Language | Files | Lines |
|----------|------:|------:|
| TypeScript (TSX) | 218 | 3,174 |
| TypeScript | 196 | 2,705 |
| JSON | 39 | 1,047 |
| Markdown | 30 | 3,310 |
| Shell | 5 | 197 |
| No Extension | 4 | 81 |
| HTML | 4 | 35 |
| JavaScript (ESM) | 3 | 44 |
| JSONC | 3 | 141 |
| TOML | 3 | 361 |
| Other | 8 | 5,139 |

**Largest files:**
- `packages/supabase/supabase/migrations/00000000000000_schema.sql` (4,209 lines)
- `packages/supabase/supabase/seed.sql` (855 lines)
- `docs/notifications-system-plan.md` (437 lines)
- `skills/my-graphql/SKILL.md` (376 lines)
- `packages/supabase/supabase/config.toml` (348 lines)
- `skills/my-supabase/SKILL.md` (340 lines)
- `AGENTS.md` (249 lines)
- `skills/my-conventions/SKILL.md` (212 lines)
- `skills-lock.json` (184 lines)
- `packages/intl/src/intl.ts` (163 lines)