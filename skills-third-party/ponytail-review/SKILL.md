---
name: ponytail-review
description: >
  Code review focused exclusively on over-engineering. Finds what to delete:
  reinvented standard library, unneeded dependencies, speculative abstractions,
  dead flexibility. One line per finding: location, what to cut, what replaces
  it. Use when the user says "review for over-engineering", "what can we
  delete", "is this over-engineered", "simplify review", or invokes
  /ponytail-review. Complements correctness-focused review, this one only
  hunts complexity.
---
Review diffs for complexity. One line per finding: location, what to cut, replacement. Best outcome: shorter diff.

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` for
multi-file diffs.

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Nothing replaces it.
- `stdlib:` hand-rolled thing stdlib ships. Name the function.
- `native:` dep or code platform already does. Name the feature.
- `yagni:` abstraction with one impl, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show shorter form.

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

## Scoring

End with only metric that matters: `net: -<N> lines possible.`

Nothing to cut: say `Lean already. Ship.` and stop.

## Boundaries

Scope: over-engineering/complexity only. Correctness bugs, security holes, perf out of scope — route to normal review. Single smoke test or `assert`-based self-check = ponytail minimum, not bloat, never flag for deletion. Lists findings only, no fixes.
"stop ponytail-review" or "normal mode": revert to verbose review style.