---
name: pr-create-quick
description: Stage all, Haiku writes commit message, push, create PR, squash-merge. Zero questions, max speed.
---

# /pr-create-quick

Delegate the entire flow below to a Haiku agent (fastest model) in a single `Agent` call. Do NOT do any of the git/gh work yourself — just spawn the agent and relay its final output (the PR URL) back to the user.

## Spawn the agent

Call `Agent` with:

- `subagent_type`: `"general-purpose"`
- `model`: `"haiku"`
- `description`: `"Quick stage + commit + PR + merge"`
- `prompt`: the block below, verbatim

---

You are executing `/pr-create-quick`. The user has already authorized this entire flow by invoking the command. Do NOT ask any questions. Do NOT confirm. Run end-to-end and finish with the PR URL.

### Step 1 — Snapshot state (parallel Bash calls in one message)

- `git status --short`
- `git rev-parse --abbrev-ref HEAD`
- `git log --oneline -10`
- `git remote get-url origin`

If `git status --short` is empty, print `nothing to commit` and exit.

### Step 2 — Stage everything

```bash
git add -A
```

### Step 3 — Inspect the diff, ignoring generated/lock files

Run both in parallel:

```bash
git diff --cached --stat -- . ':!*.lock' ':!pnpm-lock.yaml' ':!**/types.ts' ':!packages/supabase/src/types.ts' ':!**/*.graphql' ':!**/*.graphql.ts' ':!**/*.generated.*'
git diff --cached -- . ':!*.lock' ':!pnpm-lock.yaml' ':!**/types.ts' ':!packages/supabase/src/types.ts' ':!**/*.graphql' ':!**/*.graphql.ts' ':!**/*.generated.*' | head -c 60000
```

### Step 4 — Safety check

Get staged file list: `git diff --cached --name-only`. If any path matches `.env`, `*credentials*`, `*.pem`, `id_rsa`, `*.p12`, abort with a one-line error naming the file. Do NOT continue.

### Step 5 — Compose

From the diff and recent commits, produce:

- **commit_subject**: Conventional Commits `type(scope): description`, one short line. Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`. Match the project's existing style (see `git log --oneline -10`). Chilean Spanish OK but prefer English for the subject to match repo style.
- **branch_name**: kebab-case derived from the subject, max 50 chars, no special chars. Example: `feat-pr-create-quick-slash-command`.
- **pr_title**: same as `commit_subject` (or shorter if it exceeds 70 chars).
- **pr_body_bullets**: 1–3 bullets covering the WHY (not WHAT — diff shows what).

### Step 6 — Branch

If current branch is `main` (or `master`), create a new branch:

```bash
git checkout -b <branch_name>
```

Otherwise stay on the current branch.

### Step 7 — Commit (use HEREDOC, never `--no-verify`, never `--amend`)

```bash
git commit -m "$(cat <<'EOF'
<commit_subject>

Co-Authored-By: Claude Haiku <noreply@anthropic.com>
EOF
)"
```

If a pre-commit hook auto-formats and fails, run `git add -A` then retry the commit ONCE as a new commit. If it still fails, abort and print the hook output.

### Step 8 — Push

```bash
git push -u origin HEAD
```

### Step 9 — Create or reuse PR

Check first: `gh pr view --json url -q .url 2>/dev/null`

- If a URL comes back, capture it as `<pr_url>` and skip to Step 10.
- Otherwise create:

```bash
gh pr create --title "<pr_title>" --body "$(cat <<'EOF'
## Summary
- <bullet 1>
- <bullet 2>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

The command prints the new PR URL — capture it as `<pr_url>`.

### Step 10 — Squash-merge

Squash-merge the PR and delete the branch (matches the repo's `subject (#N)` history style):

```bash
gh pr merge <pr_url> --squash --delete-branch
```

If the merge fails because checks are still running, retry once with `--auto`:

```bash
gh pr merge <pr_url> --squash --delete-branch --auto
```

If it still fails (e.g. conflicts, required review missing, branch protection), abort and print the `gh` error output — do NOT force, do NOT bypass.

After a successful merge, sync the local repo so the user lands on an up-to-date `main`:

```bash
git checkout main && git pull --ff-only
```

### Step 11 — Output

Print ONLY the PR URL on the final line. Nothing else.

### Hard rules

- NEVER ask questions.
- NEVER use `--no-verify`, `--no-gpg-sign`, `--amend`, or `--force` / `-f`.
- NEVER force-push.
- NEVER use `--admin` to bypass branch protection on merge.
- NEVER commit secrets — abort if detected (Step 4).
- Do NOT run tests, builds, linters, or formatters. Hooks handle that.
- Do NOT create empty commits.
- Do NOT push to `main` directly — always branch first if on `main`.

---

After the agent returns, relay only its final line (the PR URL) plus a one-sentence summary of what was committed. Nothing else.
