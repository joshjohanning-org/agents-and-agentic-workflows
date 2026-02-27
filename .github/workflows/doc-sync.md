---
timeout-minutes: 10

on:
  pull_request:
    types: [closed]

if: github.event.pull_request.merged == true

permissions:
  contents: read
  pull-requests: read
  issues: read

tools:
  github:
    toolsets: [pull_requests, issues]
  edit:

safe-outputs:
  create-pull-request:
    title-prefix: "[doc-sync] "
    labels: [documentation, automated]
---

# Documentation Sync Agent

A pull request was just merged in ${{ github.repository }}. Analyze the
changes and determine if any documentation needs to be updated.

## What to Check

1. **README files** -- Check if any changes affect the project setup,
   configuration, or usage described in README files
2. **API documentation** -- If API endpoints, parameters, or responses changed,
   update the corresponding docs
3. **Code comments** -- Verify that function/method documentation comments
   still accurately describe the updated code
4. **Configuration docs** -- If environment variables, config files, or
   settings changed, update the relevant documentation
5. **Architecture docs** -- If the PR introduces new components, services, or
   significant structural changes, flag for architecture doc updates

## Guidelines

- Only create a documentation PR if meaningful updates are needed
- Do not create PRs for trivial changes (typo fixes, formatting, etc.)
- Keep documentation changes focused and minimal
- Match the existing documentation style and format
- If unsure whether a doc update is needed, err on the side of not creating a PR
  and instead add a comment to the original PR noting what might need review

## Output

If documentation updates are needed, create a pull request with the changes.
Include a clear description of what was updated and why, referencing the
original PR.
