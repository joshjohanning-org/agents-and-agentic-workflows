---
timeout-minutes: 15

on:
  schedule: daily
  workflow_dispatch:

permissions:
  contents: read
  issues: read

tools:
  github:
    toolsets: [issues]
  bash: ["gh"]

# External MCP server -- connects the agent to DeepWiki for
# researching vulnerabilities and best practices from documentation
mcp-servers:
  deepwiki:
    url: "https://mcp.deepwiki.com/sse"
    allowed:
      - read_wiki_structure
      - read_wiki_contents
      - ask_question

# Custom inline tools for fetching security data
safe-inputs:
  check-dependabot-alerts:
    description: "Fetch open Dependabot security alerts for the repository"
    run: |
      gh api repos/$GITHUB_REPOSITORY/dependabot/alerts \
        --jq '[.[] | select(.state == "open") | {
          number: .number,
          severity: .security_advisory.severity,
          summary: .security_advisory.summary,
          package: .dependency.package.name,
          ecosystem: .dependency.package.ecosystem,
          vulnerable_range: .security_vulnerability.vulnerable_version_range,
          patched_version: .security_vulnerability.first_patched_version.identifier,
          created: .created_at
        }]' 2>/dev/null || echo "[]"
    env:
      GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
      GITHUB_REPOSITORY: "${{ github.repository }}"

  check-code-scanning-alerts:
    description: "Fetch open code scanning alerts for the repository"
    run: |
      gh api repos/$GITHUB_REPOSITORY/code-scanning/alerts \
        --jq '[.[] | select(.state == "open") | {
          number: .number,
          severity: .rule.severity,
          description: .rule.description,
          tool: .tool.name,
          location: "\(.most_recent_instance.location.path):\(.most_recent_instance.location.start_line)"
        }] | .[0:20]' 2>/dev/null || echo "[]"
    env:
      GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
      GITHUB_REPOSITORY: "${{ github.repository }}"

  check-secret-scanning-alerts:
    description: "Check for open secret scanning alerts"
    run: |
      count=$(gh api repos/$GITHUB_REPOSITORY/secret-scanning/alerts \
        --jq '[.[] | select(.state == "open")] | length' 2>/dev/null || echo "0")
      echo "{\"open_alerts\": $count}"
    env:
      GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
      GITHUB_REPOSITORY: "${{ github.repository }}"

safe-outputs:
  create-issue:
    title-prefix: "[security-report] "
    labels: [security, automated, report]

network:
  allowed:
    - defaults
    - mcp.deepwiki.com
---

# Security Advisory Monitor

Generate a daily security health report for ${{ github.repository }}.

## Data Collection

1. Use `check-dependabot-alerts` to fetch all open Dependabot alerts
2. Use `check-code-scanning-alerts` to fetch open code scanning findings
3. Use `check-secret-scanning-alerts` to check for exposed secrets
4. For any critical or high-severity Dependabot alerts, use the DeepWiki
   MCP `ask_question` tool to research the vulnerability and find
   recommended remediation steps

## Report Format

### Executive Summary
- Total open alerts by severity (critical, high, medium, low)
- Trend compared to previous reports (if visible from issue history)
- Overall security posture rating (Red/Yellow/Green)

### Critical & High Severity Alerts
For each critical/high alert:
- Package name and ecosystem
- Vulnerability summary
- Recommended fix (version to upgrade to)
- Research from DeepWiki on the vulnerability impact and fix

### Medium & Low Severity Alerts
- Summary table grouped by ecosystem
- Bulk upgrade recommendations where possible

### Secret Scanning
- Number of open alerts (do NOT include secret values)
- Recommendation to rotate exposed credentials

### Recommended Actions
- Prioritized list of fixes, starting with the highest-impact items
- Specific commands to run for dependency upgrades where possible
  (e.g., `npm update package-name` or `pip install --upgrade package-name`)

## Guidelines
- Never include actual secret values in the report
- Focus on actionable remediation steps
- If no alerts are found, create a brief "all clear" report
- Link to the actual alerts in the GitHub Security tab
