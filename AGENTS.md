# DR3 - Divine Right Webapp

## Current Baseline

- Treat the repo as a recovery-phase prototype, not a rules-complete game.
- Trusted slice only:
  - movement legality
  - combat declaration and resolution
  - save/load/import/export validation
  - portable Chromium E2E
  - runtime conformance coverage for the movement/combat chunks
- Still incomplete or scaffolded:
  - diplomacy/cards
  - random events
  - sieges
  - victory conditions
  - CPU quality
  - many conformance chunks outside the trusted slice

## First Steps

- Review the active tracker: `docs/plans/2026-03-17-recovery-plan.md`.
- Review the current architecture baseline: `docs/architecture/app-architecture.md`.
- Do not modify anything under `docs/refs/` unless explicitly authorized.

## Working Rules

- Prefer small patch-style edits over broad rewrites.
- Keep behavior aligned to conformance fixtures and runtime state invariants.
- Do not reintroduce duplicated runtime state or mirrored boardgame.io flow state; `stage` is the only intentional persisted flow mirror.
- New rules work should improve the trusted slice and move chunks toward `runtime-covered`, not just add adapter-only helpers.

## Toolchain

- Node `24.x`
- npm `11.x`
- Bootstrap with `npm run bootstrap`

## Verification

- Required local gate before completion: `npm run test:local:gate`
- Base recovery gate: `npm run verify:base`
- Run `npm run test:local:visual` when changing board visuals or snapshots.
- Only refresh visual baselines intentionally: `npm run test:e2e:board:visual:update`

## Workflow

1. Create a `codex/...` branch before significant work.
2. Run the required verification commands.
3. Commit locally.
4. Push the branch to `origin`.
5. Open a PR.
