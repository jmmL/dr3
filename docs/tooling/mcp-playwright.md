# MCP Playwright Setup

This repository includes a local MCP configuration at `.mcp.json` that registers a Playwright MCP server.

## Prerequisites

- Node.js `24.x`
- npm `11.x`
- Project dependencies installed with `npm run bootstrap`
- Playwright browsers installed with `npx playwright install --with-deps`

## Start MCP server

Use the provided script:

```bash
npm run mcp:playwright
```

Or let your MCP-capable client load `.mcp.json` automatically.

## Validation checks

1. `npm run verify:base`
2. `npm run test:e2e:portable`
3. `npm run test:local:visual`

Notes:
- The default local Playwright server now binds to `127.0.0.1:4173`.
- `test:e2e:portable` is the recovery-era local browser lane.
- `test:local:visual` is intentionally separate because visual baselines are higher-friction than the portable gate.
