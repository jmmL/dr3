---
name: reading-ci-logs
description: Use when CI/CD checks fail on a PR and you need to understand what went wrong
---

# Reading CI/CD Logs

## Overview

When working in the Claude Code web sandbox, you cannot run Playwright E2E tests directly. Instead, you must:
1. Push changes to GitHub
2. Let CI run the tests
3. Read CI results to understand failures

This skill teaches you how to read CI results using the GitHub API via WebFetch.

## When to Use

- After pushing changes when CI checks fail
- When the user reports a PR has failing checks
- When you need to debug test failures that only occur in CI

## GitHub API Endpoints (No Auth Required)

The following endpoints are accessible without authentication:

### 1. List Recent Workflow Runs

```
GET https://api.github.com/repos/{owner}/{repo}/actions/runs?per_page=5
```

Returns: Run IDs, status, conclusion, branch name, commit SHA

### 2. Get Jobs for a Workflow Run

```
GET https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}/jobs
```

Returns: Job names, status, conclusion, which step failed

### 3. Get Check Run Annotations (MOST USEFUL)

```
GET https://api.github.com/repos/{owner}/{repo}/check-runs/{job_id}/annotations
```

Returns: **Actual error messages with file paths and line numbers**

This is the key endpoint - it contains lint errors, type errors, test failures with exact locations.

## Step-by-Step Process

### Step 1: Find the Failed Run

Use WebFetch to get recent runs:

```
URL: https://api.github.com/repos/jmmL/dr3/actions/runs?per_page=5
Prompt: Extract run IDs, status, conclusion, and branch. Focus on failed runs.
```

### Step 2: Get Job Details

For each failed run, get the jobs:

```
URL: https://api.github.com/repos/jmmL/dr3/actions/runs/{run_id}/jobs
Prompt: Extract job names, status, conclusion, and which step failed.
```

### Step 3: Get Error Annotations

For the failed job, get annotations:

```
URL: https://api.github.com/repos/jmmL/dr3/check-runs/{job_id}/annotations
Prompt: Extract all annotations with file paths, line numbers, and error messages.
```

## Example: Debugging a Failed PR

```typescript
// Step 1: Get latest runs for a branch
WebFetch(
  url: "https://api.github.com/repos/jmmL/dr3/actions/runs?branch=my-feature&per_page=3",
  prompt: "Find failed runs and extract their run_id"
)

// Step 2: Get jobs for failed run (e.g., run_id = 21277047777)
WebFetch(
  url: "https://api.github.com/repos/jmmL/dr3/actions/runs/21277047777/jobs",
  prompt: "Find which job failed and get its job_id"
)

// Step 3: Get annotations for failed job (e.g., job_id = 61238667499)
WebFetch(
  url: "https://api.github.com/repos/jmmL/dr3/check-runs/61238667499/annotations",
  prompt: "Extract all error details with file paths and line numbers"
)
```

## What Each CI Job Tests

| Job | What it runs | Common failures |
|-----|-------------|-----------------|
| `test` | lint, typecheck, unit tests | ESLint errors, TypeScript errors, Vitest failures |
| `e2e` (chromium) | Playwright tests on Chrome | Selector failures, timeout errors, assertion failures |
| `e2e` (ios-safari) | Playwright tests on iOS Safari | Mobile-specific issues, viewport problems |

## Limitations

- **Full logs require authentication** - The `/jobs/{id}/logs` endpoint returns 403
- **Annotations are the best source** - They contain the actual error messages
- **Some errors may not have annotations** - In that case, check the job step that failed

## Common Patterns

### Lint Failure
Annotations show: file path, line number, rule name, error message

### Type Error
Annotations show: file path, line number, TypeScript error code, message

### E2E Test Failure
Annotations may show: test name, assertion that failed
Check for uploaded artifacts: `playwright-report-{project}` contains detailed HTML report

## Tips

1. **Always check annotations first** - They contain structured error info
2. **Match job_id to the failed step** - The annotations URL uses job_id, not run_id
3. **For E2E failures** - The artifacts contain screenshots and traces, but you'll need the HTML report for details
4. **For flaky tests** - Check if the same test passes/fails across runs

## Related

- `.github/workflows/deploy.yml` - CI workflow configuration
- `playwright.config.ts` - E2E test configuration
