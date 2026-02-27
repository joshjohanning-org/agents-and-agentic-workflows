# Agents and Agentic Workflows Demo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/joshjohanning-org/agents-and-agentic-workflows?style=flat)](https://github.com/joshjohanning-org/agents-and-agentic-workflows/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/joshjohanning-org/agents-and-agentic-workflows)](https://github.com/joshjohanning-org/agents-and-agentic-workflows/issues)
[![Daily Repo Status](https://github.com/joshjohanning-org/agents-and-agentic-workflows/actions/workflows/daily-repo-status.lock.yml/badge.svg)](https://github.com/joshjohanning-org/agents-and-agentic-workflows/actions/workflows/daily-repo-status.lock.yml)
[![Issue Triage](https://github.com/joshjohanning-org/agents-and-agentic-workflows/actions/workflows/issue-triage-agent.lock.yml/badge.svg)](https://github.com/joshjohanning-org/agents-and-agentic-workflows/actions/workflows/issue-triage-agent.lock.yml)

This repository demonstrates **GitHub Agentic Workflows** -- automated, intent-driven repository workflows that run in GitHub Actions, authored in plain Markdown, and executed with coding agents (such as GitHub Copilot, Claude, or OpenAI Codex).

## What are GitHub Agentic Workflows?

GitHub Agentic Workflows bring coding agents into the heart of repository automation. Instead of writing complex YAML logic, you describe what you want in **natural language Markdown**, and a coding agent interprets and executes the instructions at runtime.

Each workflow has two parts:

1. **Frontmatter** (YAML between `---` markers) -- configuration for triggers, permissions, tools, and safe outputs
2. **Markdown instructions** -- natural language that describes the job for the AI agent

### Key Concepts

| Concept | Description |
|---|---|
| **Agentic Workflow** | A Markdown file (`*.md`) in `.github/workflows/` that defines both configuration and natural language instructions for an AI agent |
| **Lock File** | A compiled `.lock.yml` file generated from the `.md` source -- this is the actual GitHub Actions workflow that runs |
| **Safe Outputs** | Pre-approved GitHub operations (create issue, add comment, open PR, add labels) that the agent can perform without write permissions |
| **Safe Inputs** | Custom MCP tools defined inline to prevent injection attacks |
| **AI Engine** | The coding agent that interprets instructions -- Copilot (default), Claude, or Codex |
| **Continuous AI** | The practice of integrating AI continuously into the SDLC, similar to CI/CD |

### How It Works

```
┌─────────────────────┐
│  Workflow (.md)      │  ← You write this (Markdown + YAML frontmatter)
└──────────┬──────────┘
           │ gh aw compile
           ▼
┌─────────────────────┐
│  Lock File (.lock.yml) │  ← Compiled GitHub Actions workflow
└──────────┬──────────┘
           │ GitHub Actions trigger
           ▼
┌─────────────────────┐
│  AI Agent Execution  │  ← Coding agent runs in sandboxed environment
└──────────┬──────────┘
           │ Safe Outputs
           ▼
┌─────────────────────┐
│  GitHub Operations   │  ← Issues, comments, PRs, labels (reviewed by humans)
└──────────┘──────────┘
```

### Security Model (Defense-in-Depth)

- **Read-only by default** -- agents have no write permissions unless explicitly granted through safe outputs
- **Sandboxed execution** -- agents run in isolated containers with network controls
- **Tool allowlisting** -- only explicitly configured tools are available
- **Safe outputs** -- write operations go through a safety layer before being applied
- **Human review** -- PRs are never auto-merged; humans always review and approve

## Workflows in This Demo

This repo includes **10 example agentic workflows** across two categories:

### Core Workflows

These demonstrate the fundamental agentic workflow patterns:

| Workflow | Pattern | Trigger | Description |
|---|---|---|---|
| [Issue Triage](./docs/workflows/issue-triage.md) | IssueOps | Issue opened | Automatically labels and triages new issues with a helpful comment |
| [Daily Repo Status](./docs/workflows/daily-repo-status.md) | DailyOps | Scheduled (daily) | Generates a daily status report for maintainers |
| [CI Doctor](./docs/workflows/ci-doctor.md) | IssueOps | CI failure | Investigates CI failures and proposes fixes |
| [Doc Sync](./docs/workflows/doc-sync.md) | IssueOps | PR merged | Keeps documentation aligned with code changes |
| [Code Simplifier](./docs/workflows/code-simplifier.md) | DailyOps | Scheduled (weekly) | Identifies and proposes code simplifications |
| [Test Improver](./docs/workflows/test-improver.md) | DailyOps | Scheduled (weekly) | Assesses test coverage and adds high-value tests |
| [ChatOps Helper](./docs/workflows/chatops-helper.md) | ChatOps | Issue comment command | Responds to `/agent` commands in issue comments |

### Dynamic Workflows (MCP + Safe Inputs)

These showcase the **really exciting part** -- custom MCP tools and external MCP servers that give agents dynamic, adaptive capabilities:

| Workflow | Dynamic Features | Trigger | Description |
|---|---|---|---|
| [Release Notes Generator](./docs/workflows/release-notes-generator.md) | `safe-inputs` (JS + Shell) | Release created | Uses custom tools to fetch commits, parse conventional commits, and generate categorized release notes |
| [Security Monitor](./docs/workflows/security-monitor.md) | `safe-inputs` + `mcp-servers` (DeepWiki) | Daily schedule | Fetches Dependabot/code scanning/secret scanning alerts, then uses DeepWiki MCP to research vulnerability fixes |
| [Dependency Health Check](./docs/workflows/dependency-health-check.md) | `safe-inputs` (JS + Python) | PR with dep changes | Multi-language custom tools that parse dependency files and call npm/PyPI registries to check for outdated packages |

## What Makes the Dynamic Workflows Special?

The dynamic workflows demonstrate two powerful features that make agentic workflows radically different from traditional CI/CD:

### Safe Inputs -- Custom MCP Tools Defined Inline

You can define custom tools right in the workflow Markdown that the agent calls like any MCP tool. These run as **isolated processes** with controlled secret access:

```yaml
safe-inputs:
  check-npm-package-info:
    description: "Look up an npm package's latest version"
    inputs:
      package_name:
        type: string
        required: true
    script: |  # JavaScript runs in an isolated process
      const resp = await fetch(
        `https://registry.npmjs.org/${package_name}/latest`
      );
      const data = await resp.json();
      return { latest_version: data.version, deprecated: data.deprecated };
```

The agent decides *when* and *how* to call these tools based on the situation. You can mix JavaScript (`script:`), Python (`py:`), Shell (`run:`), and Go (`go:`) in the same workflow.

### External MCP Servers -- Connect to Any Service

Workflows can connect to external MCP servers over HTTP, giving agents access to databases, APIs, and specialized services:

```yaml
mcp-servers:
  deepwiki:
    url: "https://mcp.deepwiki.com/sse"
    allowed:
      - read_wiki_contents
      - ask_question

network:
  allowed:
    - defaults
    - mcp.deepwiki.com  # Explicit network allowlisting
```

### Why This Matters

Traditional YAML workflows are **deterministic** -- they run the same steps every time. Agentic workflows with MCP tools are **adaptive** -- the agent reasons about what data to fetch, which tools to call, and how to synthesize results. For example, the Security Monitor:

1. Calls safe-input tools to gather raw alert data (deterministic data fetching)
2. Analyzes severity patterns (AI reasoning)
3. For critical vulnerabilities, calls DeepWiki to research fixes (dynamic tool use)
4. Synthesizes everything into an actionable report (AI generation)

No amount of `if/then` YAML could replicate this behavior.

## Getting Started

See the full [Setup Guide](./docs/setup-guide.md) for detailed instructions.

### Quick Start

```bash
# 1. Install the GitHub Agentic Workflows CLI extension
gh extension install github/gh-aw

# 2. Add a starter workflow (interactive wizard)
gh aw add-wizard githubnext/agentics/daily-repo-status

# 3. Or compile your own workflows
gh aw compile

# 4. Trigger a run manually
gh aw run daily-repo-status
```

### Prerequisites

- [GitHub CLI](https://cli.github.com/) (`gh`) v2.0.0+
- A GitHub repository with write access
- GitHub Actions enabled
- An AI account: [GitHub Copilot](https://github.com/features/copilot), [Anthropic Claude](https://www.anthropic.com/), or [OpenAI Codex](https://openai.com/api/)

## Agentic Workflow Patterns

GitHub Agentic Workflows support several operational patterns:

| Pattern | Description | Example |
|---|---|---|
| **DailyOps** | Scheduled workflows that run on a recurring basis | Daily reports, weekly code reviews |
| **IssueOps** | Triggered by issue or PR events | Issue triage, PR review assistance |
| **ChatOps** | Triggered by commands in comments (e.g., `/agent help`) | On-demand analysis, summaries |
| **DataOps** | Process and analyze data from the repository | Metrics dashboards, trend analysis |
| **ProjectOps** | Manage project boards and tracking | Sprint summaries, roadmap updates |
| **MultiRepoOps** | Coordinate across multiple repositories | Cross-repo dependency updates |
| **Orchestration** | Chain multiple workflows together | Multi-phase improvements |

## Continuous AI Categories

These workflows demonstrate the six pillars of Continuous AI:

1. **Continuous Triage** -- Automatically summarize, label, and route new issues
2. **Continuous Documentation** -- Keep READMEs and docs aligned with code changes
3. **Continuous Code Simplification** -- Repeatedly identify and propose code improvements
4. **Continuous Test Improvement** -- Assess test coverage and add high-value tests
5. **Continuous Quality Hygiene** -- Investigate CI failures and propose targeted fixes
6. **Continuous Reporting** -- Create regular reports on repository health and trends

## Resources

- [GitHub Agentic Workflows Documentation](https://github.github.com/gh-aw/)
- [Quick Start Guide](https://github.github.com/gh-aw/setup/quick-start/)
- [How They Work](https://github.github.com/gh-aw/introduction/how-they-work/)
- [Security Architecture](https://github.github.com/gh-aw/introduction/architecture/)
- [Safe Inputs Reference](https://github.github.com/gh-aw/reference/safe-inputs/) -- defining custom MCP tools inline
- [Using MCPs Guide](https://github.github.com/gh-aw/guides/mcps/) -- connecting to external MCP servers
- [Tools Reference](https://github.github.com/gh-aw/reference/tools/) -- all available tool types
- [Peli's Agent Factory](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/)
- [Workflow Gallery](https://github.github.com/gh-aw/index.html#gallery)
- [Creating Workflows](https://github.github.com/gh-aw/setup/creating-workflows/)
- [Frontmatter Reference](https://github.github.com/gh-aw/reference/frontmatter/)
- [GitHub Blog: Automate repository tasks with GitHub Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
