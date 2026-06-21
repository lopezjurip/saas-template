---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---
# Karpathy Guidelines

Guidelines to reduce LLM coding mistakes, from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876).

**Tradeoff:** Bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**No assume. No hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If simpler approach exists, say so. Push back when warranted.
- If unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Min code that solves problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" not requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite.

Ask: "Would senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what must. Clean only own mess.**

Editing existing code:
- Don't "improve" adjacent code, comments, formatting.
- Don't refactor what isn't broken.
- Match existing style.
- If notice unrelated dead code, mention — don't delete.

When changes create orphans:
- Remove imports/variables/functions YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

Test: Every changed line trace directly to user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria → loop independently. Weak criteria ("make it work") → constant clarification.