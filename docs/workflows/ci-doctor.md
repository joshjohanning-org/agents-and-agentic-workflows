# CI Doctor -- Failure Investigator

**Pattern:** IssueOps
**Trigger:** When a CI workflow run completes with a failure
**Category:** Continuous Quality Hygiene

## What It Does

When a CI workflow fails, this agent:

1. Examines the failed workflow run logs to identify which step(s) failed
2. Extracts relevant error messages
3. Analyzes recent commits and changed files for likely root causes
4. Searches for similar past CI failures
5. Creates an issue (or comments on an existing one) with diagnosis and proposed fix

## Frontmatter Breakdown

```yaml
timeout-minutes: 15              # More time for log analysis

on:
  workflow_run:
    workflows: ["CI"]            # Triggers when the "CI" workflow completes
    types: [completed]

if: github.event.workflow_run.conclusion == 'failure'  # Only on failures

permissions:
  contents: read                 # Read code and commits
  actions: read                  # Read workflow run logs

tools:
  github:
    toolsets: [issues, pull_requests]
  bash: ["gh"]                   # Use the GitHub CLI for log access

safe-outputs:
  create-issue:
    title-prefix: "[ci-doctor] "
    labels: [ci-failure, automated]
  add-comment: {}                # Can comment on existing issues
```

## Key Design Decisions

- **Conditional execution** -- only runs when CI fails, not on every workflow completion
- **Pattern detection** -- searches for similar past failures to identify recurring issues
- **Issue deduplication** -- comments on existing issues rather than creating duplicates
- **Flaky test awareness** -- explicitly flags intermittent failures
- **`gh` CLI access** -- allows reading workflow run logs via the GitHub CLI

## Customization Ideas

- Change `workflows: ["CI"]` to match your actual CI workflow name(s)
- Add instructions to check specific log patterns common in your stack
- Configure to automatically assign CI failures to a rotation team
- Add severity classification based on which tests or stages failed
- Include instructions to propose a fix PR for common failure patterns

## Source

See [.github/workflows/ci-doctor.md](../../.github/workflows/ci-doctor.md)
