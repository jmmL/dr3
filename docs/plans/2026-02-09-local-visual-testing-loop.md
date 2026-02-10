# Local Visual Testing Loop Plan (2026-02-09)

## Goal
Make local testing fail fast on board-rendering regressions (map missing, hex distortion, broken interactions) before work is considered complete.

## Scope
1. Add Playwright board contract tests for:
   - Map image request status and visibility.
   - Hex geometry quality (no vertical squish / regular side lengths).
   - Board interactions (zoom, pan, unit selection).
   - Browser/page console error detection.
2. Add Playwright visual snapshot backstop for board region.
3. Add deterministic browser hooks for automated loops:
   - `window.render_game_to_text()`
   - `window.advanceTime(ms)`
4. Add a single local gate command that runs:
   - lint
   - unit tests
   - e2e board contracts (Chromium)
   - e2e visual snapshot check (Chromium)
5. Update project docs and `progress.md` with the loop and current known failures.

## Execution Order
1. Persist this plan.
2. Implement deterministic hooks in `src/App.tsx` (and global typings).
3. Add board-focused Playwright specs under `src/test/e2e`.
4. Add npm scripts for board-contract and visual checks.
5. Run local verification and record what fails.
6. Document usage in `README.md` and log in `progress.md`.

## Acceptance Criteria
1. Running the new local gate command clearly reports board regressions.
2. Missing map image causes test failure.
3. Distorted hex geometry causes test failure.
4. Playwright captures board screenshot comparisons for regression detection.
5. Hooks are available in browser devtools and automation contexts.
