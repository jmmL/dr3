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

### 2. Good (Definition of Quality)
Code and assets are considered **Good** when they are:
* **Clean:** Follow TDD principles. Keep a separation of concerns and don't repeat yourself. There are useful principles in SOLID that you should follow. Prioritise maintainable code and design. This project utilises reference documents from the physical board game for rules and game pieces; these are thr ultimate source of truth. You must write code that complies with this conformance suite.
* **Efficient:** Avoids unnecessary complexity or performance bottlenecks. Prefer small patch-style edits to wholesale rewrites.
* **Documented:** Clear code does not need inline comments and documentation. If code is unclear when you first write it, refactor it to be simpler first. Leave inline comments only for unusual or edge cases. Update relevant documentation when large changes to features or architecture are implemented.

## Conventions

**Rule validation pattern:** Rule validation functions return `DomainResult` (`{ ok: boolean, reason?: string }`) — never throw for rule violations. This pattern is used consistently in `src/engine/domain/rules.ts` and all engine helpers. Throwing is reserved for programmer errors (missing data, invalid state), not rule-based rejections.

**AI testability:** AI behavior must have conformance test coverage before promotion to trusted slice. AI decisions should be testable through the same conformance framework as rules.

## Learnings

**Conformance Suite Design:** Declarative JSON test specs are specification-first, not TDD. Include negative test cases (what's NOT allowed), not just happy paths. Use rule references to existing JSON for traceability — avoid duplicating rule text in test cases.

**Learning:** Validation harness should enforce schema parity with integration tests.

**Learning:** Rule references must be 2-3 parts (e.g., `25.2` or `25.2.2`), not 4+ parts — group sub-rules under parent.

**Learning:** `coverage_matrix.json` must stay in sync with conformance spec files — every new test ID needs a corresponding entry. The conformance validation script catches drift.

**Learning:** New conformance test inputs must match existing adapter signatures. Adding a test case without wiring its adapter is incomplete work.

**Learning:** Pathfinding hot paths (priority queues) should use O(log n) structures (binary heap), not O(n) linear scans. Port proven optimisations rather than reinventing.

**Learning:** `coverage_matrix.json` sync is necessary but not sufficient. Every new conformance case must be exercised by a matching adapter or runtime assertion in the same change.

**Learning:** `runConformanceSuite` adapters must fail closed. If a new JSON case falls through an adapter without assertions, the suite should fail immediately rather than silently passing.

**Learning:** After pushing commits or updating a PR, monitor GitHub Actions checks with [$gh-fix-ci](/Users/jamielawler/.codex/skills/gh-fix-ci/SKILL.md) until everything passes. Do not assume the remote branch is healthy just because local verification passed.

**Learning:** A conformance file path appearing in a runtime test does not prove all cases execute through game moves. Verify each claimed case against real reducer state; boardgame.io `overrideGameState` only overrides the client view.

**Learning:** Test complete player handoff and RNG continuation through the boardgame.io client. A shallow domain-state spread can discard top-level replacements, and deterministic dice can still have unreachable outcomes.

## First Steps
- Review the active plan in `docs/plans/` relevant to the task. The current roadmap is `docs/plans/2026-09-06-solo-game-implementation-plan.md`; its first package is `docs/plans/2026-09-06-runtime-foundations-plan.md`. The March recovery tracker is historical.
- Confirm no changes are made under `docs/refs/` unless explicitly authorized.
- Prefer small, patch-style edits and keep behavior aligned to conformance fixtures.
## Working Rules

- Prefer small patch-style edits over broad rewrites.
- Keep behavior aligned to conformance fixtures and runtime state invariants.
- Do not reintroduce duplicated runtime state or mirrored boardgame.io flow state; `stage` is the only intentional persisted flow mirror.
- New rules work should improve the trusted slice and move chunks toward `runtime-covered`, not just add adapter-only helpers.

## Workflow Reminder
- At the end of each completed task, always:
  1. Run `npm run test:local:gate` before committing.
  2. Confirm the gate passed without skips.
  3. For conformance work, verify every new test ID is wired to a real helper/runtime assertion, not just fixture JSON plus `coverage_matrix.json`.
  4. Do not land JSON-only conformance additions for unsupported rules. If the adapter/runtime path is not implemented in the same change, defer the fixture.
  5. **Self-improve:** Review the diff for regressions, drift from plan, and new learnings. Update this file's Learnings section with anything discovered. This loop closes every implementation task.
  6. Commit the changes.
  7. Open a PR with those committed changes.
  8. After each push or PR update, run [$gh-fix-ci](/Users/jamielawler/.codex/skills/gh-fix-ci/SKILL.md) against the active PR and keep monitoring until all GitHub Actions checks pass.
- For each new feature or significant work package:
  1. Create a new branch before making changes.
  2. Push that branch to `origin`.
  3. Open a PR from that branch.
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
