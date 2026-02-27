---
timeout-minutes: 20

on:
  schedule: weekly
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: read

tools:
  github:
    toolsets: [pull_requests]
  edit:
  bash: ["grep", "wc", "find", "node", "python"]

safe-outputs:
  create-pull-request:
    title-prefix: "[test] "
    labels: [testing, automated]
---

# Test Coverage Improver

Analyze the test suite of ${{ github.repository }} and identify opportunities
to improve test coverage and quality.

## What to Analyze

1. **Untested code paths** -- Find functions or modules that lack test coverage
2. **Edge cases** -- Identify common edge cases that existing tests miss
   (null/undefined inputs, empty arrays, boundary values, error conditions)
3. **Missing integration tests** -- Look for interaction points between
   components that lack integration testing
4. **Brittle tests** -- Find tests that rely on implementation details rather
   than behavior, making them fragile to refactoring

## Constraints

- Add only ONE test file or test suite per pull request
- Tests must follow the existing test framework and conventions in the repo
- Tests must be meaningful -- avoid trivial assertions that do not catch real bugs
- Do not modify existing tests (only add new ones)
- Do not modify production code (only add test files)
- Ensure new tests pass by following the patterns of existing passing tests

## Process

1. Examine the project structure and identify the test framework in use
2. Find areas with low or missing test coverage
3. Prioritize by risk -- focus on code paths most likely to have bugs
4. Write focused, well-named tests with clear assertions
5. Create a PR with the new tests and a description explaining what is now covered

## Style

- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern
- Include comments explaining what each test validates
- Group related tests together
