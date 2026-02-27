# Code Simplifier

**Pattern:** DailyOps
**Trigger:** Runs on a weekly schedule (can also be triggered manually)
**Category:** Continuous Code Simplification

## What It Does

On a weekly basis, this agent:

1. Scans the codebase for simplification opportunities
2. Identifies patterns like dead code, duplication, complex conditionals, and long functions
3. Picks the single highest-value simplification
4. Creates a focused, behavior-preserving PR with the change

## Frontmatter Breakdown

```yaml
timeout-minutes: 20

on:
  schedule: weekly             # Runs weekly
  workflow_dispatch:           # Can also be triggered manually

permissions:
  contents: read

tools:
  github:
    toolsets: [pull_requests, issues]
  edit:                        # Can edit files in the workspace
  bash: ["grep", "wc", "find"]  # Basic Unix tools for codebase analysis

safe-outputs:
  create-pull-request:
    title-prefix: "[simplify] "
    labels: [code-quality, automated]
    branch-prefix: "simplify/"
```

## Key Design Decisions

- **One PR per run** -- keeps changes focused and easy to review
- **Behavior-preserving** -- changes must not alter functionality
- **Avoids active work** -- skips files modified in the last 7 days to avoid merge conflicts
- **Prioritized by impact** -- focuses on the most impactful simplification first
- **Unix tools** -- provides basic CLI tools for efficient codebase scanning

## What It Looks For

| Pattern | Example |
|---|---|
| Dead code | Unused imports, unreachable branches, commented-out code |
| Duplicated logic | Copy-pasted code blocks across files |
| Complex conditionals | Deeply nested if/else chains |
| Long functions | Functions exceeding 50 lines |
| Outdated patterns | Deprecated API usage, legacy patterns |

## Customization Ideas

- Change the schedule frequency (daily, biweekly, monthly)
- Adjust the complexity thresholds (e.g., function length limit)
- Focus on specific directories or file types
- Add language-specific simplification patterns
- Exclude certain files or directories from analysis

## Source

See [.github/workflows/code-simplifier.md](../../.github/workflows/code-simplifier.md)
