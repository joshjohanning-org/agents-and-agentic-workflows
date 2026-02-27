# Issue Triage Agent

**Pattern:** IssueOps
**Trigger:** When a new issue is opened or reopened
**Category:** Continuous Triage

## What It Does

When a new issue is opened in the repository, this workflow:

1. Analyzes the issue title and body
2. Researches the codebase for relevant context
3. Applies an appropriate label from the allowed set
4. Posts a comment explaining why the label was chosen and how the issue might be addressed

## Frontmatter Breakdown

```yaml
timeout-minutes: 5        # Quick analysis - 5 minute limit

on:
  issues:
    types: [opened, reopened]  # Triggers on new and reopened issues

permissions:
  issues: read             # Read-only access to issues

tools:
  github:
    toolsets: [issues, labels]  # Can read issues and labels

safe-outputs:
  add-labels:              # Can add labels from this allowed list
    allowed: [bug, feature, enhancement, documentation,
              question, help-wanted, good-first-issue]
  add-comment: {}          # Can add comments to issues
```

## Key Design Decisions

- **Read-only permissions** -- the agent cannot modify issues directly. It uses safe outputs for any write operations.
- **Allowed label list** -- the agent can only apply labels from a predefined set, preventing it from creating arbitrary labels.
- **Skip already-labeled issues** -- avoids re-triaging issues that have already been handled.
- **Skip assigned issues** -- respects human assignment decisions.

## Customization Ideas

- Add more labels to the allowed list for your project's specific categories
- Modify the instructions to include project-specific triage criteria
- Add language-specific guidance (e.g., "issues mentioning 'API' should be labeled 'api'")
- Include instructions to assign issues to specific team members based on topic areas

## Source

See [.github/workflows/issue-triage-agent.md](../../.github/workflows/issue-triage-agent.md)
