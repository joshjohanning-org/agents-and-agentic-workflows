---
timeout-minutes: 15

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

if: github.event.workflow_run.conclusion == 'failure'

permissions:
  contents: read
  actions: read
  issues: read
  pull-requests: read

tools:
  github:
    toolsets: [issues, pull_requests]
  bash: ["gh"]

safe-outputs:
  create-issue:
    title-prefix: "[ci-doctor] "
    labels: [ci-failure, automated]
  add-comment: {}
---

# CI Doctor -- Failure Investigator

A CI workflow has failed in ${{ github.repository }}.

## Investigation Steps

1. **Identify the failure** -- Examine the failed workflow run logs to determine
   which step(s) failed and extract the relevant error messages
2. **Analyze root cause** -- Look at the error messages, recent commits, and
   changed files to determine the likely root cause
3. **Check for patterns** -- Search recent issues for similar CI failures to
   determine if this is a recurring problem
4. **Research the fix** -- Look at the codebase and documentation to identify
   the most likely fix

## Output

Create an issue with:

- A clear title describing the failure
- use as many emojis as you can to make it more fun and engaging
- The specific error message(s) from the logs
- The likely root cause analysis
- A proposed fix with code snippets if applicable
- Links to the failed workflow run and relevant commits

If the failure is related to an existing open issue, add a comment to that
issue instead of creating a new one.

## Guidelines

- Be concise but thorough in the analysis
- Focus on actionable information
- Do not speculate beyond what the logs and code show
- If the failure appears to be flaky (intermittent), note that explicitly
