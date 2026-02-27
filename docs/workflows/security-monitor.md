# Security Advisory Monitor

**Pattern:** DailyOps + External MCP Server + Safe Inputs
**Trigger:** Daily schedule (or manually)
**Category:** Continuous Quality Hygiene
**Dynamic Features:** External MCP server (DeepWiki) + custom MCP tools via `safe-inputs`

## What Makes This Dynamic

This workflow combines **two types of dynamic tool access**:

### 1. External MCP Server (DeepWiki)

```yaml
mcp-servers:
  deepwiki:
    url: "https://mcp.deepwiki.com/sse"
    allowed:
      - read_wiki_structure
      - read_wiki_contents
      - ask_question
```

The agent can call `ask_question` on DeepWiki to research vulnerabilities -- for example, asking "What is CVE-2026-1234 and how do I fix it in Node.js 20?" The MCP server is a remote HTTP service that the agent connects to via the Model Context Protocol standard.

The `allowed` field restricts which tools the agent can use from this MCP server, and the `network.allowed` field ensures the agent can only reach `mcp.deepwiki.com` (plus defaults).

### 2. Custom Safe-Input Tools

| Custom Tool | What It Does |
|---|---|
| `check-dependabot-alerts` | Fetches open Dependabot alerts via the GitHub API |
| `check-code-scanning-alerts` | Fetches code scanning findings (CodeQL, etc.) |
| `check-secret-scanning-alerts` | Checks for exposed secret alerts |

These shell scripts run in isolation and return structured JSON to the agent.

### The Agent Orchestrates Everything

The agent:
1. Calls the safe-input tools to gather raw security data
2. Analyzes severity and patterns
3. For critical vulnerabilities, calls the DeepWiki MCP to research fixes
4. Synthesizes everything into an actionable security report

No traditional YAML workflow could do this -- the agent reasons about what to research, adapts its analysis based on what it finds, and generates a human-readable report with specific remediation steps.

## Source

See [.github/workflows/security-monitor.md](../../.github/workflows/security-monitor.md)
