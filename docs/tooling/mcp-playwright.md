# MCP Playwright Setup

This repository includes a local MCP configuration at `.mcp.json` that registers a Playwright MCP server.

## Prerequisites

- Node.js 24.x (same as CI)
- Project dependencies installed with `npm ci`
- Playwright browsers installed with `npx playwright install --with-deps`

## Start MCP server

Use the provided script:

```bash
npm run mcp:playwright
```

Or let your MCP-capable client load `.mcp.json` automatically.

## Validation checks

1. `npm run test:e2e:chromium`
2. `npm run test:e2e:ios`

If these pass locally, browser automation and CI browser environments are aligned.
