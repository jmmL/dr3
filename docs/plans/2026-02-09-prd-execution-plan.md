# DR3 PRD Execution Plan (2026-02-09)

This is the active implementation tracker against `docs/prd/divine-right-prd.md`.
Older working plans and review docs are archived under `docs/plans/archive/`.

## Current status

- `M1` Runtime architecture and deterministic domain rules: **Done**
- `M2` boardgame.io wrapper and move flow: **Done**
- `M3` Persistence + export/import: **Done**
- `M4` CPU bot integration baseline: **Done**
- `M5` React UI shell + SVG board + action sidebar: **Done**
- `M6` Playwright E2E baseline (start, turn flow, save/load, CPU action): **Done**
- `M7` CI/CD parity + GitHub Pages deploy pipeline: **Done**
- `M8` Deep rules completion, richer UX and full interaction fidelity: **In progress**

## Implemented deliverables

### Engine and game runtime

- Deterministic RNG utilities in `src/engine/domain/rng.ts`.
- Runtime state initialization in `src/engine/domain/setup.ts`.
- Domain action services in `src/engine/domain/rules.ts`:
  - Random events
  - Diplomacy
  - Siege resolution
  - Movement
  - Combat declaration and resolution
  - Turn scoring helpers
- boardgame.io game config in `src/game/dr3-game.ts`.

### Persistence and CPU

- Local save/load, import/export in `src/persistence/save-load.ts`.
- Boardgame bot integration in `src/ai/cpu-bot.ts`.

### UI

- App entrypoint in `index.html`, `src/main.tsx`, `src/App.tsx`.
- SVG board rendering in `src/ui/HexBoard.tsx`.
- Save/load/export/import controls and action controls.

### Testing

- New unit/integration tests for domain, game wrapper, persistence, CPU:
  - `src/engine/domain/*.test.ts`
  - `src/game/dr3-game.test.ts`
  - `src/persistence/save-load.test.ts`
  - `src/ai/cpu-bot.test.ts`
- Playwright E2E suite:
  - `src/test/e2e/app.spec.ts`
- Playwright projects:
  - `chromium`
  - `ios-safari` (webkit + iPhone 13 device profile)

### CI/CD and tooling

- Unified CI pipeline: `.github/workflows/ci.yml`
  - lint
  - unit/conformance tests
  - conformance fixture validation
  - playwright e2e
  - build
- GitHub Pages deployment pipeline: `.github/workflows/deploy-pages.yml`
- MCP Playwright setup:
  - `.mcp.json`
  - `docs/tooling/mcp-playwright.md`

## Verification checklist

Run locally:

1. `npm run lint`
2. `npm test`
3. `python3 scripts/validate_conformance_suite.py`
4. `npm run test:e2e:chromium`
5. `npm run test:e2e:ios`
6. `npm run build`

## Verification snapshot (2026-02-09)

- `npm run lint`: **Passed**
- `npm test`: **Passed** (`20` files, `293` tests)
- `python3 scripts/validate_conformance_suite.py`: **Passed** (`510` conformance tests validated)
- `npm run build`: **Passed**
- `npm run test:e2e:chromium`: **Not executable in this local sandbox** (`spawn EPERM` while launching browser process)

## Next implementation targets

1. Expand move legality and phase transitions to full PRD behavior.
2. Promote more conformance chunks to direct runtime move-level assertions.
3. Implement richer map interactions (zoom/pan, unit filtering, accessibility shortcuts).
4. Improve CPU quality (objective heuristics, bounded response times).
5. Add coverage thresholds for critical rule modules.
