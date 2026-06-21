---
name: ponytail-audit
description: >
  Whole-repo audit for over-engineering. Like ponytail-review, but scans the
  entire codebase instead of a diff: a ranked list of what to delete, simplify,
  or replace with stdlib/native equivalents. Use when the user says "audit this
  codebase", "audit for over-engineering", "what can I delete from this repo",
  "find bloat", "ponytail-audit", or "/ponytail-audit". One-shot report, does
  not apply fixes.
---
ponytail-review, repo-wide. Scan whole tree, not diff. Rank biggest cut first.

## Tags

Same as ponytail-review:

- `delete:` dead code, unused flexibility, speculative feature. Replace: nothing.
- `stdlib:` hand-rolled thing stdlib ships. Name function.
- `native:` dep or code platform already does. Name feature.
- `yagni:` abstraction w/ one impl, config nobody sets, layer w/ one caller.
- `shrink:` same logic, fewer lines. Show shorter form.

## Hunt

Deps stdlib/platform ships, single-impl interfaces, factories w/ one product, delegate-only wrappers, files exporting one thing, dead flags/config, hand-rolled stdlib.

## Output

One line per finding, ranked: `<tag> <what to cut>. <replacement>. [path]`. End: `net: -<N> lines, -<M> deps possible.` Nothing to cut: `Lean already. Ship.`

## Boundaries

Scope: over-engineering + complexity only. Bugs, security, perf out of scope → normal review. Lists findings, applies nothing. One-shot.
"stop ponytail-audit" or "normal mode" to revert.