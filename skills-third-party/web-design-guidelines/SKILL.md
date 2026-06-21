---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---
# Web Interface Guidelines

Review files for Web Interface Guidelines compliance.

## How It Works

1. Fetch guidelines from source URL below
2. Read specified files (or prompt for files/pattern)
3. Check against all rules in fetched guidelines
4. Output findings in terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to get latest rules. Fetched content has all rules + output format instructions.

## Usage

When user provides file or pattern:
1. Fetch guidelines from source URL above
2. Read specified files
3. Apply all rules from fetched guidelines
4. Output findings in format specified by guidelines

If no files, ask user which to review.