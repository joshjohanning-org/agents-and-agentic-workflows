---
on:
  schedule: daily
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

safe-outputs:
  create-issue:
    title-prefix: "[repo status] "
    labels: [report]

tools:
  github:
---

# Daily Repo Status Report

Create a daily status report for maintainers of ${{ github.repository }}.

## What to include

- **Recent Activity** -- summarize issues opened/closed, PRs opened/merged/closed,
  and any releases published in the last 24 hours
- **Progress Tracking** -- highlight any milestones approaching their due date and
  track progress on open milestones
- **Key Highlights** -- call out notable contributions, large PRs, or significant
  discussions
- **CI/CD Health** -- summarize the status of recent workflow runs, noting any
  recurring failures
- **Actionable Next Steps** -- list 3-5 specific, prioritized recommendations for
  maintainers

## Style

- Keep the report concise and scannable
- Use bullet points and tables where appropriate
- Link to relevant issues, PRs, and discussions
- Use emoji sparingly for visual indicators (e.g., checkmark for completed, warning for issues)
