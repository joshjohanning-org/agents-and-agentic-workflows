# Daily Repo Status Report

**Pattern:** DailyOps
**Trigger:** Runs on a daily schedule (can also be triggered manually)
**Category:** Continuous Reporting

## What It Does

Creates a daily status report issue for repository maintainers that includes:

- Recent activity summary (issues, PRs, releases in the last 24 hours)
- Milestone progress tracking
- Key highlights and notable contributions
- CI/CD health overview
- Actionable next steps and recommendations

## Frontmatter Breakdown

```yaml
on:
  schedule: daily            # Runs daily on a schedule
  workflow_dispatch:         # Can also be triggered manually

permissions:
  contents: read             # Read repo contents
  issues: read               # Read issues
  pull-requests: read        # Read pull requests

safe-outputs:
  create-issue:              # Creates a new issue for each report
    title-prefix: "[repo status] "  # Issues are prefixed for easy filtering
    labels: [report]         # Auto-labeled as "report"

tools:
  github:                    # Full GitHub toolset for data gathering
```

## Key Design Decisions

- **Creates issues** (not comments) -- each report is a standalone, searchable issue
- **Title prefix** -- all reports start with `[repo status]` for easy filtering and cleanup
- **Report label** -- issues are automatically labeled for organization
- **Manual trigger** -- `workflow_dispatch` allows on-demand report generation
- **Read-only** -- the agent only reads data; the only write operation is creating the report issue

## Customization Ideas

- Change `schedule: daily` to `schedule: weekly` for less frequent reports
- Add specific areas of focus to the "What to include" section
- Request reports in a specific format (e.g., executive summary style)
- Add project-specific metrics like deployment frequency or bug fix velocity
- Focus on specific teams' contributions or specific components

## Source

See [.github/workflows/daily-repo-status.md](../../.github/workflows/daily-repo-status.md)
