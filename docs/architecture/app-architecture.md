# DR3 Web App Architecture (Recovery Baseline)

## Scope

Single-player DR3 prototype running as a static web app with deterministic rules helpers, a trusted movement/combat slice, and explicit conformance coverage classification. The PRD remains the intent document; this file describes the currently trusted implementation rather than aspirational completeness.

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
Trusted runtime slice (movement/combat/persistence)
        |
Rule helpers + conformance adapters
        |
Reference datasets (docs/refs/*.json)
```

## Module Boundaries

### Game Wrapper

- `src/game/dr3-game.ts` owns turn stages, move wiring, and translation between runtime state and domain state.
- Runtime state omits static reference data from saves/snapshots where possible; `hexMap` is reconstructed from refs.
- `stage` is kept in `G` because save/restore snapshots do not include `ctx.phase`; this is the only intentional boardgame.io flow mirror.

### Domain And Rules

- `src/engine/domain/setup.ts` builds deterministic initial state.
- `src/engine/domain/rng.ts` provides seeded randomness helpers.
- `src/engine/domain/rules.ts` handles the trusted gameplay slice:
  - movement legality
  - combat declaration and resolution
  - player-control semantics for controlled factions
- Earlier/later phases still exist in the wrapper, but they are not considered fully trusted game logic yet.

### Engine Helpers

- `src/engine/combat/`, `src/engine/movement/`, `src/engine/siege/`, `src/engine/map/`, `src/engine/units/`, `src/engine/leaders/` provide rule-focused pure helpers used by domain services and conformance adapters.

### Data Loading

- `src/data/load-refs.ts` loads canonical reference JSON from `docs/refs/*.json` and maps compact keys to typed runtime structures.
- The PRD still targets `.min.json` as the long-term authoritative runtime source; that migration has not been completed.

### UI Layer

- `src/App.tsx` is the shell for stage actions, status text, trusted-slice messaging, save/load/import/export controls, and CPU trigger.
- `src/ui/HexBoard.tsx` renders the board as custom SVG polygons and unit stacks.
- UI now exposes movement and combat declaration/resolution for the trusted slice. Legality still lives in the engine.

### Persistence

- `src/persistence/save-load.ts` provides local storage slot save/load, import/export payload validation, and metadata listing.

### CPU

- `src/ai/cpu-bot.ts` integrates boardgame.io bot APIs for baseline CPU turns.

## Turn Flow (Current)

Current stage sequence remains:

1. `rollEvents`
2. `drawCard`
3. `diplomacy`
4. `siegeResolution`
5. `movement`
6. `combat`

Trusted UI slice tests:
- `src/test/e2e/app.spec.ts`
- `src/test/e2e/board.contract.spec.ts`

## Testing And Quality Gates

### Local Validation Commands

1. `npm run verify:base`
2. `npm run test:e2e:portable`
3. `npm run test:local:visual`

### CI Enforcement

`/.github/workflows/ci.yml` still runs the unified verification pipeline, while local work should treat `verify:base` + `test:e2e:portable` as the practical recovery gate.

- lint
- unit + conformance adapter tests
- conformance fixture validation
- Playwright e2e
- production build

## Deployment

- Static bundle is built with Vite and deployed via GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.
- Deployment path uses `dist/` artifact upload.

## Known Gaps

- Diplomacy/cards, random events, sieges, and victory conditions are not yet trusted runtime systems.
- 16 conformance chunks are currently unwired, and 10 are adapter-only.
- CPU quality remains baseline only.
- Mobile/iOS browser coverage remains a separate lane from the portable local gate.
