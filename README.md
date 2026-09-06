# DR3

Browser-based implementation of Divine Right (3rd edition), focused on deterministic rules execution, conformance fixtures, and single-player gameplay.

## Current Status

- The repo is now explicitly rebaselined as a prototype with a trusted slice, not a near-complete rules implementation.
- Trusted slice: movement, combat declaration/resolution, persistence, portable Chromium E2E, and runtime coverage for the movement/combat conformance chunks.
- Scaffolded or adapter-only areas remain incomplete: diplomacy/cards, random events, sieges, victory conditions, and many unwired conformance chunks.
- The September runtime review found player-handoff and RNG defects even though the existing gate passes; the trusted slice describes limited tested paths, not complete movement/combat rules or full-game reliability.
- The active roadmap is [the solo-game implementation plan](docs/plans/2026-09-06-solo-game-implementation-plan.md), with a [detailed runtime-foundations plan](docs/plans/2026-09-06-runtime-foundations-plan.md) as its first package.

## Quick Start

```bash
nvm use
npm run bootstrap
npm run dev
```

## Verification Commands

```bash
npm run verify:base
npm run test:e2e:portable
npm run test:local:visual
```

Notes:
- Supported toolchain baseline: Node `24.x`, npm `11.x` (`.nvmrc` and `package.json#engines` are the source of truth).
- `npm run verify:base` runs lint, coverage-gated unit tests, conformance fixture validation, the conformance wiring report, and production build.
- `npm run test:e2e:portable` is the reliable local browser lane.
- `npm run test:local:visual` is intentionally separate from the main local gate.
- `npm run test:conformance:report` prints each conformance chunk as `runtime-covered`, `adapter-only`, or `unwired`.

## Documentation Index

- `docs/README.md` - top-level documentation map.
- `docs/prd/divine-right-prd.md` - product intent and requirements.
- `docs/architecture/app-architecture.md` - as-built architecture and module boundaries.
- `docs/plans/README.md` - active vs archived plans.
- `docs/tooling/mcp-playwright.md` - local MCP Playwright setup notes.
- `docs/tooling/dependency-audit.md` - current npm audit triage and accepted risk notes.
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
