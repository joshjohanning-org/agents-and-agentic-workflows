# Documentation Sync Agent

**Pattern:** IssueOps
**Trigger:** When a pull request is merged
**Category:** Continuous Documentation

## What It Does

After a PR is merged, this agent:

1. Analyzes the changes in the merged PR
2. Checks if any documentation needs to be updated
3. If meaningful doc updates are needed, creates a focused PR with the changes
4. If uncertain, adds a comment to the original PR noting what might need review

## Frontmatter Breakdown

```yaml
timeout-minutes: 10

on:
  pull_request:
    types: [closed]                   # Triggers when PR is closed

if: github.event.pull_request.merged == true  # Only when merged (not just closed)

permissions:
  contents: read
  pull-requests: read

tools:
  github:
    toolsets: [pull_requests, issues]
  edit:                                # Can edit files in the workspace

safe-outputs:
  create-pull-request:
    title-prefix: "[doc-sync] "        # Doc PRs are clearly prefixed
    labels: [documentation, automated]
    branch-prefix: "doc-sync/"         # Branches are organized under doc-sync/
```

## Key Design Decisions

- **Merged PRs only** -- does not trigger on closed-but-unmerged PRs
- **PR creation** -- uses safe outputs to create documentation PRs that require human review
- **Branch naming** -- uses `doc-sync/` prefix for easy identification and cleanup
- **Conservative approach** -- errs on the side of not creating PRs for trivial changes
- **File editing** -- the `edit` tool lets the agent modify documentation files

## Documentation Checks

The agent examines:
- README files
- API documentation
- Code comments and docstrings
- Configuration documentation
- Architecture documentation

## Customization Ideas

- Add specific documentation directories to prioritize
- Include style guide rules for your documentation
- Configure to also update changelogs
- Add language-specific documentation conventions
- Include instructions for updating code examples in docs

## Source

See [.github/workflows/doc-sync.md](../../.github/workflows/doc-sync.md)
