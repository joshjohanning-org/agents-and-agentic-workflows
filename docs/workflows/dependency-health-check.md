# Dependency Health Check

**Pattern:** IssueOps + Safe Inputs (Multi-Language)
**Trigger:** When a PR modifies dependency files
**Category:** Continuous Quality Hygiene
**Dynamic Features:** Custom MCP tools in JavaScript, Python, and shell

## What Makes This Dynamic

This workflow defines **four custom tools across two languages** -- demonstrating that safe-inputs can mix JavaScript and Python in the same workflow:

| Custom Tool | Language | What It Does |
|---|---|---|
| `analyze-package-json` | JavaScript | Parses `package.json` and returns structured dependency data |
| `analyze-requirements-txt` | Python | Parses `requirements.txt` and checks pinning status |
| `check-npm-package-info` | JavaScript | Calls the npm registry API to get latest version info |
| `check-pypi-package-info` | Python | Calls the PyPI API to get latest version info |

### Network Access Control

The workflow explicitly allows outbound network access to package registries:

```yaml
network:
  allowed:
    - defaults
    - registry.npmjs.org   # npm registry
    - pypi.org             # Python package index
```

Without this, the safe-input tools would be blocked from making HTTP requests. This is defense-in-depth -- even if a tool tried to call an unexpected domain, the network sandbox would block it.

### How the Agent Uses These Tools

The agent:
1. Reads the PR diff to see which dependency files changed
2. Calls the appropriate parser (`analyze-package-json` or `analyze-requirements-txt`)
3. For key dependencies, calls the registry lookup tool to compare versions
4. Generates a health report table and posts it as a PR comment

This is adaptive -- a traditional workflow would need separate logic branches for npm vs. pip vs. other ecosystems. The agent figures out which tools to use based on what files are in the PR.

## Multi-Language Safe Inputs

JavaScript tool example:
```yaml
safe-inputs:
  analyze-package-json:
    script: |  # Runs as Node.js
      const pkg = JSON.parse(fs.readFileSync(file_path, 'utf8'));
      return { dependencies: Object.entries(pkg.dependencies || {}) };
```

Python tool example:
```yaml
safe-inputs:
  analyze-requirements-txt:
    py: |  # Runs as Python 3
      import json, re
      deps = []
      with open(inputs.get('file_path')) as f:
          for line in f:
              # parse requirement specifiers...
      print(json.dumps({'dependencies': deps}))
```

Both are available to the agent as MCP tools with the same interface -- the language is an implementation detail.

## Source

See [.github/workflows/dependency-health-check.md](../../.github/workflows/dependency-health-check.md)
