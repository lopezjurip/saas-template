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
- Files matching these patterns are excluded: packages/supabase/src/types.ts, **/generated/**, pnpm-lock.yaml, .context/**, skills/codebase/**, **/*.test.ts, **/*.test.tsx, **/*.spec.ts, **/*.test.sql, apps/platform/tests/**, **/*.pem, **/certificates/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Long base64 data strings (e.g., data:image/png;base64,...) have been truncated to reduce token count
- Files are sorted by Git change count (files with more changes are at the bottom)

## Statistics

479 files | 14,771 lines

| Language | Files | Lines |
|----------|------:|------:|
| TypeScript (TSX) | 196 | 2,910 |
| TypeScript | 187 | 2,512 |
| JSON | 40 | 869 |
| Markdown | 28 | 3,053 |
| JavaScript | 4 | 12 |
| HTML | 4 | 35 |
| JSONC | 3 | 133 |
| No Extension | 3 | 66 |
| Shell | 3 | 124 |
| TOML | 2 | 333 |
| Other | 9 | 4,724 |

**Largest files:**
- `packages/supabase/supabase/migrations/00000000000000_schema.sql` (3,608 lines)
- `packages/supabase/supabase/seed.sql` (845 lines)
- `AGENTS.md` (566 lines)
- `docs/notifications-system-plan.md` (437 lines)
- `packages/supabase/supabase/config.toml` (327 lines)
- `skills/my-graphql/SKILL.md` (255 lines)
- `skills/my-supabase/SKILL.md` (188 lines)
- `packages/intl/src/intl.ts` (161 lines)
- `skills/my-graphy/SKILL.md` (141 lines)
- `skills/psql-query/SKILL.md` (138 lines)