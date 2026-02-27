---
timeout-minutes: 20

on:
  schedule: weekly
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

tools:
  github:
    toolsets: [pull_requests, issues]
  edit:
  bash: ["grep", "wc", "find"]

safe-outputs:
  create-pull-request:
    title-prefix: "[simplify] "
    labels: [code-quality, automated]
---

# Code Simplifier

Analyze the codebase of ${{ github.repository }} and identify opportunities
for simplification and improvement.

## What to Look For

1. **Dead code** -- Unused functions, variables, imports, or files that can be
   safely removed
2. **Duplicated logic** -- Similar code blocks that could be refactored into
   shared functions or utilities
3. **Complex conditionals** -- Deeply nested if/else chains that could be
   simplified with early returns, guard clauses, or pattern matching
4. **Long functions** -- Functions exceeding 50 lines that could be broken
   into smaller, focused functions
5. **Outdated patterns** -- Code using deprecated APIs or patterns that have
   simpler modern alternatives

## Constraints

- Make only ONE focused simplification per pull request
- Each change must be safe and behavior-preserving (no functional changes)
- Do not refactor code that has been modified in the last 7 days (to avoid
  conflicts with active work)
- Limit changes to a single file or closely related set of files
- Include a clear explanation of why the simplification improves the code

## Process

1. Scan the codebase for the patterns listed above
2. Prioritize changes by impact (most impactful simplifications first)
3. Pick the single highest-value simplification
4. Create a focused PR with the change and a clear description
