# DR3 Web App Architecture (As Built)

## Scope

Single-player DR3 implementation running as a static web app with deterministic rules and CI-gated conformance fixtures. The PRD in `docs/prd/divine-right-prd.md` remains the intent document; this file describes the current implementation.

## Technology Stack

- Runtime framework: `boardgame.io` (`src/game/dr3-game.ts`)
- UI framework: React + Vite (`src/App.tsx`, `src/ui/HexBoard.tsx`)
- Language: TypeScript
- Unit/integration/conformance tests: Vitest
- End-to-end tests: Playwright
- Hosting/deploy target: GitHub Pages (`.github/workflows/deploy-pages.yml`)

## System Overview

```text
React UI (App + HexBoard)
        |
boardgame.io client + DR3Game wrapper
        |
Domain services (rules/setup/rng + engine helpers)
        |
Reference datasets (docs/refs/*.json)
```

## Module Boundaries

### Game Wrapper

- `src/game/dr3-game.ts` owns turn stages, move wiring, and translation between runtime state and domain state.
- Runtime state type omits static map payload from `G` for efficiency and reconstructs domain state as needed.

### Domain And Rules

- `src/engine/domain/setup.ts` builds deterministic initial state.
- `src/engine/domain/rng.ts` provides seeded randomness helpers.
- `src/engine/domain/rules.ts` handles stage progression and core actions:
  - random events
  - diplomacy
  - siege resolution
  - movement
  - combat declaration and resolution
  - score helpers

### Engine Helpers

- `src/engine/combat/`, `src/engine/movement/`, `src/engine/siege/`, `src/engine/map/`, `src/engine/units/`, `src/engine/leaders/` provide rule-focused pure helpers used by domain services and conformance adapters.

### Data Loading

- `src/data/load-refs.ts` loads canonical reference JSON from `docs/refs/*.json` and maps compact keys to typed runtime structures.

### UI Layer

- `src/App.tsx` is the shell for stage actions, status text, save/load/import/export controls, and CPU trigger.
- `src/ui/HexBoard.tsx` renders the board as custom SVG polygons and unit stacks.
- UI does not enforce game legality; it dispatches actions and renders engine state.

### Persistence

- `src/persistence/save-load.ts` provides local storage slot save/load, import/export payload validation, and metadata listing.

### CPU

- `src/ai/cpu-bot.ts` integrates boardgame.io bot APIs for baseline CPU turns.

## Turn Flow (Current)

Current stage sequence is reflected in both code and e2e tests:

1. `rollEvents`
2. `drawCard`
3. `diplomacy`
4. `siegeResolution`
5. `movement`
6. `combat`

Reference test: `src/test/e2e/app.spec.ts`.

## Testing And Quality Gates

### Local Validation Commands

1. `npm run lint`
2. `npm test`
3. `python3 scripts/validate_conformance_suite.py`
4. `npm run test:e2e:chromium`
5. `npm run test:e2e:ios`
6. `npm run build`

### CI Enforcement

`/.github/workflows/ci.yml` runs:

- lint
- unit + conformance adapter tests
- conformance fixture validation
- Playwright e2e
- production build

## Deployment

- Static bundle is built with Vite and deployed via GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.
- Deployment path uses `dist/` artifact upload.

## Known Gaps (Execution Backlog)

- Expand move legality and phase behavior toward full PRD coverage.
- Increase runtime move-level assertions against more conformance chunks.
- Improve map interaction depth (zoom/pan/filter/accessibility enhancements).
- Improve CPU quality and bounded response times.
- Add explicit coverage thresholds for critical rule modules.
