Original prompt: We're going to massively improve the UI. Use this image as the base for the map. Reconfigure / calibrate the hex grid to be an overlay on top of this image. Notice how the hexes tile - they have the pointy end down, and are staggered to perfectly tessalate the surface. Plan out how you would do this, keeping display of units clear on top of the hex grid image.

## 2026-02-09

- Started `feat/map-image-grid-overlay` from `origin/main`.
- Confirmed provided board image exists at `public/assets/minaria-map-hires.jpg` with dimensions `1841x1403`.
- Implementing first pass: image-backed map layer, calibrated hex overlay, improved unit marker legibility, pan/zoom interactions.
- Added `src/ui/map-calibration.ts` for reusable map/hex calibration constants and coordinate helpers.
- Reworked `HexBoard` to render the map image as base layer with subtle interactive hex overlay and high-contrast unit badges.
- Added board pan/zoom interaction with reset control to support map readability and navigation.
- Pulled the board base from the provided local asset path (`public/assets/minaria-map-hires.jpg`) and wired it as the rendered board image.
- Verification:
  - `npm run lint` passed.
  - `npm test` passed.
  - `npm run build` passed.
  - `npm run test:e2e -- --project=chromium` passed (run outside sandbox restrictions due local EPERM in sandbox).

## TODO / Follow-ups

- Fine-tune `MINARIA_MAP_CALIBRATION` constants by visual calibration pass against target landmarks for tighter edge alignment.
- User feedback (2026-02-09): map now renders and hexes are regular, but calibration offset is still off; top-left hex should sit much closer to the map image top-left. Recalibrate `offsetX`/`offsetY` (and then re-check `hexRadius`) against corner anchors.
- Add touch pinch-zoom support for mobile beyond drag + wheel baseline.
- PR opened: `https://github.com/jmmL/dr3/pull/33`.

## 2026-02-09 (Local testing loop hardening)

- Added plan doc: `docs/plans/2026-02-09-local-visual-testing-loop.md`.
- Added deterministic browser automation hooks in `src/App.tsx`:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
- Added board-focused Playwright contract tests in `src/test/e2e/board.contract.spec.ts`:
  - map image request/visibility checks
  - regular-hex side-length checks (explicitly fails if distorted)
  - board interaction checks (zoom/pan/unit select)
  - console/page/request failure capture
- Added board visual regression test in `src/test/e2e/board.visual.spec.ts`.
- Added npm scripts for local board loop + gate in `package.json`:
  - `test:e2e:board:contract`
  - `test:e2e:board:visual`
  - `test:e2e:board:visual:update`
  - `test:e2e:board:loop`
  - `test:local:gate`
- Documented the workflow in `README.md`.

### Next

- Run `npm run test:e2e:board:visual:update` once to establish/refresh baseline snapshots intentionally.
- Keep `npm run test:local:gate` as pre-completion gate for local work.

### Verification status (completed)

- `npm run lint` passed.
- `npm test` passed.
- `npm run test:e2e:board:contract` passed after fixes.
- `npm run test:e2e:board:visual` passed after snapshot refresh.
- `npm run test:local:gate` passed end-to-end.
- Ran develop-web-game loop client and reviewed artifacts:
  - `test-results/web-game-loop/shot-0.png`
  - `test-results/web-game-loop/shot-1.png`
  - `test-results/web-game-loop/state-0.json`
  - `test-results/web-game-loop/state-1.json`

### Fixes made while enabling the loop

- Enforced regular-hex calibration model in `src/ui/map-calibration.ts`:
  - removed independent `scaleX/scaleY`
  - added single `hexRadius`
  - switched center lattice to regular pointy-hex spacing
- Prevented wheel handler warning in `src/ui/HexBoard.tsx` by guarding `preventDefault` with `event.cancelable`.

## 2026-02-09 (Core turn-flow recovery, boardgame.io-first)

- Refactored `src/game/dr3-game.ts` to use phase-scoped `boardgame.io` flow (`rollEvents` -> `drawCard` -> `diplomacy` -> `siegeResolution` -> `movement` -> `combat`) with explicit `setPhase` transitions and stage synchronization.
- Tightened turn semantics:
  - movement reset on turn begin now applies only to units controllable by the active player
  - combat `endTurn` now rejects when pending combats remain
- Extended domain movement APIs in `src/engine/domain/rules.ts`:
  - `canControlUnitForPlayer`
  - `validateMoveUnitForPlayer`
  - `listLegalDestinationsForUnit`
  - `findAllLegalMovements`
- Updated CPU behavior in `src/ai/cpu-bot.ts` to prefer legal `moveUnit` actions before `toCombatPhase`.
- Added movement UX fidelity:
  - legal destination highlighting (`data-legal-destination`) in `src/ui/HexBoard.tsx`
  - phase-aware move validation and user feedback in `src/App.tsx`
  - guarded movement->combat transition requiring confirmation when legal moves remain
- Added runtime conformance coverage in `src/test/conformance/runtime/core-turn-combat.runtime.test.ts` to validate core turn + movement/combat behavior against conformance fixture IDs.
- Expanded E2E coverage in `src/test/e2e/app.spec.ts` for movement-phase legal destinations and actual movement execution.

## 2026-02-09 (Review regression fixes + MCTS coverage)

- Fixed `App` load/import restore path in `src/App.tsx` to stop relying on `overrideGameState` (display-only) and instead call a real game move restore path.
- Added `restoreSnapshot` move support in every phase in `src/game/dr3-game.ts`, with a deep snapshot assignment plus `setPhase(snapshot.stage)` so loaded state is playable immediately.
- Corrected map parity mapping in `src/ui/map-calibration.ts` to odd-q column parity so render geometry matches engine neighbor logic.
- Fixed CPU fallback behavior in `src/ai/cpu-bot.ts` to recompute fallback actions from post-bot state and avoid stale combat redeclare loops.
- Expanded CPU tests in `src/ai/cpu-bot.test.ts`:
  - explicit direct MCTS coverage via `createCpuBot(...).play(...)`
  - retained full run-through integration test
  - deterministic regression test for stale fallback behavior using injected `botOverride`
- Added restore snapshot regression coverage in `src/game/dr3-game.test.ts`.
- Updated app e2e flow in `src/test/e2e/app.spec.ts`:
  - load->movement->combat restoration path
  - explicit movement->combat confirmation behavior
- Updated visual baseline snapshot after intentional board geometry parity correction:
  - `src/test/e2e/board.visual.spec.ts-snapshots/board-shell-chromium-win32.png`

### Verification (2026-02-09)

- `npx vitest run src/ai/cpu-bot.test.ts` passed.
- `npx vitest run src/game/dr3-game.test.ts` passed.
- `npx vitest run src/ui/map-calibration.test.ts` passed.
- `npm test` passed (302 tests).
- `npx playwright test src/test/e2e/app.spec.ts --project=chromium` passed.
- `npm run test:e2e:chromium` passed (11 tests) after visual snapshot refresh.

## 2026-02-09 (Follow-on stability hardening)

- Updated `src/App.tsx` to run privileged local actions (restore/load/import and CPU execution) under the active player identity using `client.updatePlayerID(...)` during the operation, then restore local player identity.
- Kept local board interaction move validation bound to player `0` for direct human actions, while enabling `Run CPU` regardless of local turn.
- Added `data-testid="player-value"` in `src/App.tsx` turn panel for deterministic e2e targeting.

### Verification (follow-on)

- `npx playwright test src/test/e2e/app.spec.ts --project=chromium` passed.
- `npm run test:e2e:chromium` passed (11 tests).
- `npm test` passed (302 tests).
