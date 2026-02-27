# Release Notes Generator

**Pattern:** IssueOps + Safe Inputs
**Trigger:** When a new release is created (or manually)
**Category:** Continuous Reporting
**Dynamic Features:** Custom MCP tools via `safe-inputs`

## What Makes This Dynamic

This workflow defines **three custom MCP tools inline** using `safe-inputs`. These are mini-programs (JavaScript and shell scripts) that the agent can call like any other tool. They run as isolated processes with controlled secret access:

| Custom Tool | Language | What It Does |
|---|---|---|
| `get-commits-since-tag` | Shell | Fetches commits between two git tags via the GitHub API |
| `get-pr-details` | Shell | Gets merged PRs with labels and review info |
| `categorize-commit` | JavaScript | Parses conventional commit messages into categories |

The agent orchestrates these tools dynamically -- it decides which ones to call, in what order, and how to combine the results. This is fundamentally different from a traditional YAML workflow, where you would have to hardcode every step.

## How Safe Inputs Work

```yaml
safe-inputs:
  categorize-commit:
    description: "Parse a conventional commit message into category"
    inputs:
      message:
        type: string
        required: true
    script: |  # JavaScript runs in an isolated process
      const patterns = [
        { regex: /^feat/, category: 'Features' },
        { regex: /^fix/, category: 'Bug Fixes' },
        // ...
      ];
      const match = patterns.find(p => p.regex.test(message));
      return { category: match ? match.category : 'Other' };
```

The agent sees `categorize-commit` as a tool it can call with a `message` parameter. The JavaScript runs in an isolated process -- not inside the agent. The agent only gets the return value. This provides:

- **Secret isolation** -- only env vars you specify are available
- **Process isolation** -- runs separately from the agent
- **Output sanitization** -- large outputs are saved to files

## Source

See [.github/workflows/release-notes-generator.md](../../.github/workflows/release-notes-generator.md)
