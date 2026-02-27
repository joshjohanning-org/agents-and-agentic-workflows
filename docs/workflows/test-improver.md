# Test Coverage Improver

**Pattern:** DailyOps
**Trigger:** Runs on a weekly schedule (can also be triggered manually)
**Category:** Continuous Test Improvement

## What It Does

On a weekly basis, this agent:

1. Examines the test framework and conventions used in the project
2. Identifies areas with low or missing test coverage
3. Prioritizes by risk -- focuses on code paths most likely to have bugs
4. Writes focused tests following existing patterns
5. Creates a PR with the new tests

## Frontmatter Breakdown

```yaml
timeout-minutes: 20

on:
  schedule: weekly
  workflow_dispatch:

permissions:
  contents: read

tools:
  github:
    toolsets: [pull_requests]
  edit:                              # Can create/edit test files
  bash: ["grep", "wc", "find",
         "node", "python"]          # Runtimes for test analysis

safe-outputs:
  create-pull-request:
    title-prefix: "[test] "
    labels: [testing, automated]
    branch-prefix: "test-improve/"
```

## Key Design Decisions

- **One test suite per PR** -- keeps changes focused and easy to review
- **Follows existing conventions** -- matches the test framework and style already in use
- **No production code changes** -- only adds test files, never modifies application code
- **Meaningful tests only** -- avoids trivial assertions that do not catch real bugs
- **Runtime tools** -- provides Node.js and Python for test framework analysis

## What It Looks For

| Gap | Description |
|---|---|
| Untested code paths | Functions or modules with no test coverage |
| Missing edge cases | Null inputs, empty arrays, boundary values, error conditions |
| Missing integration tests | Untested interaction points between components |
| Brittle tests | Tests relying on implementation details rather than behavior |

## Customization Ideas

- Focus on specific directories or modules
- Set minimum coverage thresholds
- Add language/framework-specific testing guidelines
- Configure to also check for test quality (not just coverage)
- Add instructions for specific assertion libraries or patterns

## Source

See [.github/workflows/test-improver.md](../../.github/workflows/test-improver.md)
