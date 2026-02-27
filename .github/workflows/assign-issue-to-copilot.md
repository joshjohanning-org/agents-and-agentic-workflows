---
timeout-minutes: 5

on:
  issues:
    types: [opened, reopened]

permissions:
  contents: read
  issues: read

tools:
  github:
    toolsets: [issues, labels]
  bash: ["gh"]

safe-outputs:
  add-comment: {}
  assign-to-agent: {}
---

## Work

If you think it's a good item for Copilot can you just assign it to him? Also make the comment back to the PR saying that's what we did and why.
