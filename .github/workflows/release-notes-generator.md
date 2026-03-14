---
timeout-minutes: 15

on:
  release:
    types: [created]
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

tools:
  github:
    toolsets: [issues, pull_requests]

# Custom MCP tools defined inline -- these run as isolated processes
# the agent can call, giving it dynamic data-fetching capabilities
mcp-scripts:
  get-commits-since-tag:
    description: "Get all commits between two git tags or since a tag"
    inputs:
      since_tag:
        type: string
        required: true
        description: "The previous release tag (e.g., v1.0.0)"
      until_tag:
        type: string
        required: false
        description: "The current release tag (defaults to HEAD)"
    run: |
      if [ -n "$INPUT_UNTIL_TAG" ]; then
        gh api repos/$GITHUB_REPOSITORY/compare/${INPUT_SINCE_TAG}...${INPUT_UNTIL_TAG} \
          --jq '.commits[] | {sha: .sha[0:7], message: .commit.message, author: .commit.author.name, date: .commit.author.date}' \
          | head -100
      else
        gh api repos/$GITHUB_REPOSITORY/compare/${INPUT_SINCE_TAG}...HEAD \
          --jq '.commits[] | {sha: .sha[0:7], message: .commit.message, author: .commit.author.name, date: .commit.author.date}' \
          | head -100
      fi
    env:
      GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
      GITHUB_REPOSITORY: "${{ github.repository }}"

  get-pr-details:
    description: "Get merged PRs with labels, body, and review info between two dates"
    inputs:
      since_date:
        type: string
        required: true
        description: "ISO date to search from (e.g., 2026-01-01)"
    run: |
      gh pr list --repo "$GITHUB_REPOSITORY" --state merged \
        --search "merged:>=$INPUT_SINCE_DATE" \
        --json number,title,labels,body,author,mergedAt \
        --limit 50
    env:
      GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
      GITHUB_REPOSITORY: "${{ github.repository }}"

  categorize-commit:
    description: "Parse a conventional commit message into category and description"
    inputs:
      message:
        type: string
        required: true
    script: |
      const patterns = [
        { regex: /^feat(\(.*?\))?[!:]/, category: 'Features' },
        { regex: /^fix(\(.*?\))?[!:]/, category: 'Bug Fixes' },
        { regex: /^docs(\(.*?\))?[!:]/, category: 'Documentation' },
        { regex: /^perf(\(.*?\))?[!:]/, category: 'Performance' },
        { regex: /^refactor(\(.*?\))?[!:]/, category: 'Refactoring' },
        { regex: /^test(\(.*?\))?[!:]/, category: 'Tests' },
        { regex: /^ci(\(.*?\))?[!:]/, category: 'CI/CD' },
        { regex: /^chore(\(.*?\))?[!:]/, category: 'Chores' },
        { regex: /^build(\(.*?\))?[!:]/, category: 'Build' },
        { regex: /BREAKING CHANGE/, category: 'Breaking Changes' },
      ];
      const match = patterns.find(p => p.regex.test(message));
      const isBreaking = message.includes('!:') || message.includes('BREAKING CHANGE');
      return {
        category: match ? match.category : 'Other',
        breaking: isBreaking,
        description: message.split('\n')[0]
      };

safe-outputs:
  create-issue:
    title-prefix: "[release-notes] "
    labels: [release, automated]

network:
  allowed:
    - defaults
---

# Release Notes Generator

A new release has been created (or this was triggered manually) for
${{ github.repository }}.

## Instructions

1. Use the `get-commits-since-tag` tool to fetch all commits since the
   previous release tag
2. Use the `get-pr-details` tool to get details on recently merged PRs
3. Use the `categorize-commit` tool to classify each commit by type
   (feature, fix, docs, etc.)
4. Generate well-structured release notes organized by category

## Release Notes Format

### Header
- Release version and date
- One-line summary of the release theme

### Sections (only include sections with content)
- **Breaking Changes** -- list any breaking changes prominently at the top
- **Features** -- new functionality added
- **Bug Fixes** -- bugs that were resolved
- **Performance** -- performance improvements
- **Documentation** -- documentation updates
- **Other** -- anything that does not fit the categories above

### Footer
- Number of commits, contributors, and PRs included
- Thank contributors by @mentioning them

## Style
- Use bullet points with the short commit SHA linked to the commit
- Group related changes together
- Highlight breaking changes with a warning emoji
- Keep descriptions concise but informative