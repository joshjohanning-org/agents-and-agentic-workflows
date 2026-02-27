# ChatOps Helper

**Pattern:** ChatOps
**Trigger:** When a comment containing `/agent` is posted on an issue
**Category:** Interactive / On-Demand

## What It Does

Responds to `/agent` commands posted in issue comments:

| Command | What It Does |
|---|---|
| `/agent summarize` | Summarizes the current issue/PR with key discussion points and blockers |
| `/agent label` | Analyzes issue content and suggests/applies appropriate labels |
| `/agent related` | Finds and lists the top 5 related issues/PRs |
| `/agent help` | Lists all available commands |
| `/agent status` | Provides a quick repository health check |

## Frontmatter Breakdown

```yaml
timeout-minutes: 10

on:
  issue_comment:
    types: [created]                  # Triggers on new comments

if: contains(github.event.comment.body, '/agent')  # Only when comment has /agent

permissions:
  contents: read
  issues: read
  pull-requests: read

tools:
  github:
    toolsets: [issues, pull_requests, labels]
  bash: ["gh"]

safe-outputs:
  add-comment: {}                      # Can reply with comments
  add-labels:                          # Can apply labels from allowed list
    allowed: [bug, feature, enhancement, documentation, question,
              help-wanted, good-first-issue, priority-high,
              priority-medium, priority-low]
```

## Key Design Decisions

- **Command prefix** -- uses `/agent` as the trigger prefix to avoid accidental activation
- **Conditional trigger** -- the `if` condition filters out comments that do not contain the command prefix
- **Always responds** -- posts a reply even for unrecognized commands
- **Read-only data access** -- can read issues, PRs, and content but only writes via safe outputs

## Customization Ideas

- Add custom commands for your project (e.g., `/agent deploy-check`, `/agent changelog`)
- Change the command prefix (e.g., `/bot`, `/copilot`, `/assist`)
- Add role-based commands (certain commands only for maintainers)
- Include project-specific status checks
- Add commands that interact with external systems via MCP tools

## Source

See [.github/workflows/chatops-helper.md](../../.github/workflows/chatops-helper.md)
