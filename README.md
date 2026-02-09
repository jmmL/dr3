# DR3

Browser-based implementation of Divine Right (3rd edition), focused on deterministic rules execution, conformance fixtures, and single-player gameplay.

## Current Status

- Core runtime, UI shell, persistence, CPU baseline, and CI pipelines are implemented.
- Conformance fixtures and adapters are in place and validated in CI.
- The active execution tracker is `docs/plans/2026-02-09-prd-execution-plan.md`.

## Quick Start

```bash
npm ci
npm run dev
```

## Verification Commands

```bash
npm run lint
npm test
python3 scripts/validate_conformance_suite.py
npm run test:e2e:chromium
npm run test:e2e:ios
npm run build
```

Notes:
- E2E requires Playwright browsers: `npx playwright install --with-deps`.
- In restricted local environments, Playwright can fail to spawn a browser process even when CI passes.

## Documentation Index

- `docs/README.md` - top-level documentation map.
- `docs/prd/divine-right-prd.md` - product intent and requirements.
- `docs/architecture/app-architecture.md` - as-built architecture and module boundaries.
- `docs/plans/README.md` - active vs archived plans.
- `docs/tooling/mcp-playwright.md` - local MCP Playwright setup notes.
- `docs/refs/README.md` - reference dataset format and validation details.

## Repository Layout

- `src/engine/` - rules helpers and domain logic.
- `src/game/` - boardgame.io wrapper and move/stage flow.
- `src/ui/` - board and interaction components.
- `src/persistence/` - local save/load and import/export.
- `src/test/conformance/` - conformance harness and adapters.
- `src/test/e2e/` - Playwright end-to-end tests.
- `docs/conformance/` - fixture suites, schema, and coverage matrix.
- `.github/workflows/` - CI and Pages deploy pipelines.
