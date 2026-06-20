---
name: my-pr-quick
description: Use when the user wants a fast PR (e.g. /pr-quick, "haz un PR rápido") and you must NOT burn tokens reading full diffs.
---

# PR Quick

**Rule: never read full diffs or files.** Use only `git status --short` + `git diff --stat` — that's enough to write the commit and PR.

```bash
git status --short && git diff --stat && git branch --show-current
# if on main: git checkout -b <type>/<kebab-desc>
git add -A
git commit -m "$(cat <<'EOF'
feat(scope): imperative summary

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
git push -u origin HEAD
gh pr create --title "<commit subject>" --body "$(cat <<'EOF'
## Summary
- one bullet per change (from --stat)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Paste the PR URL. Done.

Red flag: about to run full `git diff` or `Read` a file → stop, use `--stat`.
