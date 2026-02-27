---
timeout-minutes: 15

on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - "package.json"
      - "package-lock.json"
      - "requirements.txt"
      - "Pipfile"
      - "pyproject.toml"
      - "Gemfile"
      - "go.mod"
      - "pom.xml"
      - "*.csproj"

permissions:
  contents: read
  pull-requests: read

tools:
  github:
    toolsets: [pull_requests]

# Custom inline tools -- the agent calls these like any MCP tool,
# but they are defined right here in the workflow as safe-inputs
safe-inputs:
  analyze-package-json:
    description: "Analyze a package.json file and return dependency info with version details"
    inputs:
      file_path:
        type: string
        required: true
        description: "Path to the package.json file"
    script: |
      const fs = require('fs');
      try {
        const pkg = JSON.parse(fs.readFileSync(file_path, 'utf8'));
        const deps = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
          name, version, type: 'production'
        }));
        const devDeps = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
          name, version, type: 'development'
        }));
        return {
          name: pkg.name,
          version: pkg.version,
          total_deps: deps.length,
          total_dev_deps: devDeps.length,
          dependencies: deps,
          dev_dependencies: devDeps,
          engines: pkg.engines || null
        };
      } catch (e) {
        return { error: e.message };
      }

  analyze-requirements-txt:
    description: "Parse a Python requirements.txt and return dependency information"
    inputs:
      file_path:
        type: string
        required: true
    py: |
      import json
      import re

      deps = []
      try:
          with open(inputs.get('file_path'), 'r') as f:
              for line in f:
                  line = line.strip()
                  if not line or line.startswith('#') or line.startswith('-'):
                      continue
                  match = re.match(r'^([a-zA-Z0-9_-]+)\s*([><=!~]+.+)?$', line)
                  if match:
                      deps.append({
                          'name': match.group(1),
                          'version_spec': match.group(2) or 'any',
                          'pinned': '==' in (match.group(2) or '')
                      })
      except Exception as e:
          print(json.dumps({'error': str(e)}))
          raise SystemExit(0)

      result = {
          'total': len(deps),
          'pinned': sum(1 for d in deps if d['pinned']),
          'unpinned': sum(1 for d in deps if not d['pinned']),
          'dependencies': deps
      }
      print(json.dumps(result))

  check-npm-package-info:
    description: "Look up an npm package to check the latest version and deprecation status"
    inputs:
      package_name:
        type: string
        required: true
    script: |
      try {
        const resp = await fetch(`https://registry.npmjs.org/${encodeURIComponent(package_name)}/latest`);
        if (!resp.ok) return { error: `Package not found: ${package_name}` };
        const data = await resp.json();
        return {
          name: data.name,
          latest_version: data.version,
          deprecated: data.deprecated || false,
          license: data.license,
          homepage: data.homepage
        };
      } catch (e) {
        return { error: e.message };
      }

  check-pypi-package-info:
    description: "Look up a PyPI package to check the latest version"
    inputs:
      package_name:
        type: string
        required: true
    py: |
      import json
      import urllib.request

      name = inputs.get('package_name')
      try:
          url = f"https://pypi.org/pypi/{name}/json"
          resp = urllib.request.urlopen(url)
          data = json.loads(resp.read())
          info = data['info']
          print(json.dumps({
              'name': info['name'],
              'latest_version': info['version'],
              'license': info.get('license', 'Unknown'),
              'home_page': info.get('home_page', ''),
              'summary': info.get('summary', '')
          }))
      except Exception as e:
          print(json.dumps({'error': str(e)}))

safe-outputs:
  add-comment: {}

network:
  allowed:
    - defaults
    - registry.npmjs.org
    - pypi.org
---

# Dependency Health Check

A pull request in ${{ github.repository }} has modified dependency files.
Analyze the dependency changes and provide a health report as a PR comment.

## Analysis Steps

1. **Identify changed dependency files** -- look at the PR diff to determine
   which dependency files were modified
2. **Parse dependencies** -- use `analyze-package-json` or
   `analyze-requirements-txt` (as appropriate) to parse the dependency files
3. **Check for updates** -- for key dependencies (especially production ones),
   use `check-npm-package-info` or `check-pypi-package-info` to compare
   the specified version against the latest available version
4. **Assess health** -- evaluate the overall dependency health

## Report Format (as a PR comment)

### Dependency Summary
- Total production dependencies
- Total development dependencies
- Number of pinned vs. unpinned versions

### Version Check
Table of dependencies with columns:
| Package | Current | Latest | Status |

Where Status is:
- Up to date
- Minor update available
- Major update available (highlight these)
- Deprecated (warn prominently)

### Recommendations
- Flag any deprecated packages
- Flag any packages with major version gaps
- Note unpinned dependencies that should be pinned
- Suggest specific version bumps for outdated packages

### Security Note
- Remind to check Dependabot alerts for known vulnerabilities
- Link to the repository's security tab

## Guidelines
- Only check the top 15 production dependencies to avoid rate limiting
- Be concise -- this is a PR comment, not a full report
- Use tables for readability
- Use emoji status indicators (green check, yellow warning, red alert)
