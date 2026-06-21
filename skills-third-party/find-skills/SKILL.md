---
name: find-skills
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.
---
# Find Skills

Skill helps discover + install skills from open agent skills ecosystem.

## When to Use This Skill

Use when user:

- Asks "how do I do X" where X might be common task with existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is specialized capability
- Wants to extend agent capabilities
- Wants to search for tools, templates, or workflows
- Needs help with specific domain (design, testing, deployment, etc.)

## What is the Skills CLI?

`npx skills` = package manager for open agent skills ecosystem. Skills = modular packages extending agent capabilities with knowledge, workflows, tools.

**Key commands:**

- `npx skills find [query]` - Search for skills interactively or by keyword
- `npx skills add <package>` - Install a skill from GitHub or other sources
- `npx skills check` - Check for skill updates
- `npx skills update` - Update all installed skills

**Browse skills at:** https://skills.sh/

## How to Help Users Find Skills

### Step 1: Understand What They Need

Identify:

1. Domain (e.g., React, testing, design, deployment)
2. Specific task (e.g., writing tests, creating animations, reviewing PRs)
3. Whether common enough for skill to exist

### Step 2: Check the Leaderboard First

Check [skills.sh leaderboard](https://skills.sh/) before CLI search. Ranks by total installs.

Top web dev skills:
- `vercel-labs/agent-skills` — React, Next.js, web design (100K+ installs each)
- `anthropics/skills` — Frontend design, document processing (100K+ installs)

### Step 3: Search for Skills

If leaderboard doesn't cover need, run find:

```bash
npx skills find [query]
```

Examples:
- "how do I make my React app faster?" → `npx skills find react performance`
- "can you help me with PR reviews?" → `npx skills find pr review`
- "I need to create a changelog" → `npx skills find changelog`

### Step 4: Verify Quality Before Recommending

Don't recommend based solely on search results. Verify:

1. **Install count** — Prefer 1K+ installs. Cautious under 100.
2. **Source reputation** — Official sources (`vercel-labs`, `anthropics`, `microsoft`) more trustworthy than unknown authors.
3. **GitHub stars** — Check source repo. Skill from repo with <100 stars = skeptical.

### Step 5: Present Options to the User

Present found skills with:

1. Skill name + what it does
2. Install count + source
3. Install command
4. Link to skills.sh

Example response:

```
I found a skill that might help! The "react-best-practices" skill provides
React and Next.js performance optimization guidelines from Vercel Engineering.
(185K installs)

To install it:
npx skills add vercel-labs/agent-skills@react-best-practices

Learn more: https://skills.sh/vercel-labs/agent-skills/react-best-practices
```

### Step 6: Offer to Install

If user wants to proceed, install:

```bash
npx skills add <owner/repo@skill> -g -y
```

`-g` = global (user-level), `-y` = skip confirmation.

## Common Skill Categories

| Category        | Example Queries                          |
| --------------- | ---------------------------------------- |
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing         | testing, jest, playwright, e2e           |
| DevOps          | deploy, docker, kubernetes, ci-cd        |
| Documentation   | docs, readme, changelog, api-docs        |
| Code Quality    | review, lint, refactor, best-practices   |
| Design          | ui, ux, design-system, accessibility     |
| Productivity    | workflow, automation, git                |

## Tips for Effective Searches

1. **Use specific keywords**: "react testing" better than "testing"
2. **Try alternative terms**: If "deploy" fails, try "deployment" or "ci-cd"
3. **Check popular sources**: Most skills from `vercel-labs/agent-skills` or `ComposioHQ/awesome-claude-skills`

## When No Skills Are Found

If no skills exist:

1. Acknowledge no skill found
2. Offer to help directly with general capabilities
3. Suggest user create own skill with `npx skills init`

Example:

```
I searched for skills related to "xyz" but didn't find any matches.
I can still help you with this task directly! Would you like me to proceed?

If this is something you do often, you could create your own skill:
npx skills init my-xyz-skill
```