# Divine Right Runtime Foundations Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This is W1 of the solo-game roadmap, not authorisation to begin unrelated rules packages.

**Goal:** Make the current prototype advance real player turns and game rounds, persist valid random state, resume executable sessions, and report conformance honestly.

**Architecture:** Keep boardgame.io, replace phase-per-step flow with stages within a player turn, and introduce a single transactional domain boundary. Retain a serialisable game-owned RNG and save the canonical framework session context alongside domain state. Strengthen evidence at the executed case level before expanding rules.

**Tech Stack:** Existing TypeScript/React/boardgame.io/Vitest/Playwright/Python stack. Node `24.x`, npm `11.x`.

**Spec:** `docs/plans/2026-09-06-solo-game-implementation-plan.md`, sections 1–4 and W1.

## Global constraints

- Never change `docs/refs/` without explicit authorisation.
- Rule validation functions return `DomainResult` (`{ ok: boolean, reason?: string }`) — never throw for rule violations.
- `stage` remains the only intentional persisted boardgame.io flow mirror.
- No random die override or arbitrary state-injection move in the production action API.
- Failed commands preserve domain state, RNG, queue and log exactly.
- Every new test ID must be wired to a real runtime/helper assertion and entered in `coverage_matrix.json` in the same PR. Do not add unsupported fixture cases just to complete a table.
- Run `npm run test:local:gate` before each commit and confirm no skips. Push a `codex/...` branch, open a PR and monitor GitHub Actions through `gh-fix-ci` until all checks pass.

## Scope and evidence

The 2026-09-06 local gate passes 342 tests and 11 portable browser tests. It does not catch the following reproduced defects:

```text
Action             phase             ctx.turn  G.currentTurn  ctx.currentPlayer
start              rollEvents           1          1                 0
rollRandomEvent    drawCard             2          1                 0
drawDiplomacyCard  diplomacy            3          1                 0
conductDiplomacy   siegeResolution      4          1                 0
resolveSieges      movement             5          1                 0
toCombatPhase     combat               6          1                 0
endTurn           rollEvents           7          1                 0
```

`G.rngState` stayed `[3611474090]` throughout. A separate chained 10,000-roll sample from seed `review` gave totals `{3:1063,5:2149,7:3371,9:2259,11:1158}` and no even totals.

Do not update old tests to expect these behaviours. Turn the probes into failing regression tests, then fix the implementation. Existing placeholder diplomacy/events are still incomplete after W1; use clearly named prototype scenarios where required to exercise the loop.

## Task 1 — Make domain moves transactional

**Create:** `src/game/runtime-bridge.ts`, `src/game/runtime-bridge.test.ts`.
**Modify:** `src/game/dr3-game.ts`, `src/engine/domain/rules.ts`, `src/game/dr3-game.test.ts`, `src/engine/domain/rules.test.ts`.

**Interfaces:**

```ts
export function applyDomainMove<R extends DomainResult>(
  runtime: RuntimeGameState,
  operation: (domain: GameState) => R,
): R;
```

The bridge consumes runtime state and a domain operation. It produces the operation result and commits domain fields only on success; it never persists `hexMap`. Read-only selectors can continue using `toDomainState` until Task 3 supplies actor context there.

- [ ] **1.1 Add the failing actual-client regression to `dr3-game.test.ts`.**

```ts
it('persists RNG advancement after a runtime event', () => {
  const client = createClient();
  const before = structuredClone(client.getState()!.G.rngState);
  client.moves.rollRandomEvent();
  expect(client.getState()!.G.rngState).not.toEqual(before);
  client.stop();
});
```

- [ ] **1.2 Add bridge transaction tests and a failed combat-resolution test.** The callback below intentionally attempts mutation before rejection so the transaction guarantee is exercised independently of individual helper discipline.

```ts
it('discards all attempted changes when an operation rejects', () => {
  const { hexMap: _map, ...runtime } = buildInitialGameState({ seed: 'atomic' });
  const before = structuredClone(runtime);
  const result = applyDomainMove(runtime, (domain) => {
    domain.log.push('must not commit');
    domain.rngState = roll2d6(domain.rngState).nextState;
    domain.pendingCombats = [];
    return { ok: false, reason: 'wrong_player' };
  });
  expect(result).toEqual({ ok: false, reason: 'wrong_player' });
  expect(runtime).toEqual(before);
});
```

Add imports from the existing setup/rng modules and the new bridge. Also assert a successful callback replacing `rngState`, `log` and `pendingCombats` commits all three and omits `hexMap`. Construct a pending combat declared by the wrong player and prove direct `resolveNextCombatForPlayer` leaves its queue unchanged on rejection.

- [ ] **1.3 Run red:** `npm test -- src/game/runtime-bridge.test.ts src/game/dr3-game.test.ts src/engine/domain/rules.test.ts`. Expect the RNG client regression to fail on equal before/after state and the bridge tests to fail until the new module exists.
- [ ] **1.4 Implement the bridge around a detached serialisable runtime draft.** boardgame.io provides Immer drafts to moves: do not call `structuredClone` directly on that Proxy. Materialise the JSON-safe runtime fields before cloning/operating, attach the static map only to the domain view, and commit replacements from the operated-on domain object, not the pre-operation object.

```ts
const draft = JSON.parse(JSON.stringify(runtime)) as RuntimeGameState;
const domain = toDomainState(draft);
const result = operation(domain);
if (result.ok) {
  const { hexMap: _map, ...next } = domain;
  Object.assign(runtime, next);
}
return result;
```

Move map/view ownership to the bridge module if needed to avoid a circular import from `dr3-game.ts`. Keep exported compatibility selectors in the game wrapper. Switch every mutating wrapper handler to the bridge. In `resolveNextCombatForPlayer`, validate the queue head and combatants before removing it. Do not broadly rewrite rule helpers.
- [ ] **1.5 Run green and the required gate**, review changes for static-map leakage and failed-operation side effects, then commit the explicit changed files with `fix: commit domain moves atomically`. Open and monitor this small PR before proceeding.

## Task 2 — Replace the dice generator and version its state

**Modify:** `src/engine/domain/rng.ts`, `src/engine/domain/rng.test.ts`, `src/types/game-state.ts`, `src/engine/domain/setup.ts`, `src/game/runtime-state.ts`, `src/persistence/save-load.ts`, associated tests and any current `number[]` RNG callers.
**Create:** `src/engine/domain/alea.ts` if a separate generator module is needed; include its source attribution/license.

**Decision:** Reuse the Alea algorithm already present and inspectable in the installed boardgame.io source (`node_modules/boardgame.io/src/plugins/random/random.alea.ts`). Port its small generator and seeding implementation retaining the included David Bau copyright and permission notice, inspected during this review. Do not import a hashed `dist` filename or private module into application code. Keep the existing pure RNG wrapper API; the game owns one RNG stream rather than maintaining a second framework-random mirror.

**Interfaces:** Replace the unvalidated numeric array with:

```ts
export interface RngState {
  algorithm: 'alea-v1';
  c: number;
  s0: number;
  s1: number;
  s2: number;
}
export interface RngRoll { value: number; nextState: RngState }
export function seedToState(seed: string): RngState;
export function nextRng(state: RngState): RngRoll;
export function nextInt(state: RngState, maxExclusive: number): RngRoll;
export function rollDie(state: RngState, sides?: number): RngRoll;
export function roll2d6(state: RngState): {
  first: number; second: number; total: number; nextState: RngState;
};
```

- [ ] **2.1 Write the parity-regression test using existing API names.**

```ts
it('can produce every ordered pair of ordinary dice', () => {
  let state = seedToState('review');
  const pairs = new Set<string>();
  for (let index = 0; index < 10_000; index += 1) {
    const roll = roll2d6(state);
    state = roll.nextState;
    pairs.add(`${roll.first},${roll.second}`);
  }
  expect(pairs.size).toBe(36);
});
```

Add tests for range/integer results, repeatable seeded streams, distinct successive states, JSON round-trip continuation, all totals 2–12, invalid bounds, and a fixed deterministic frequency sanity check with generous bounds. This catches degeneracy; it is not a statistical certification. Compare a pinned sequence with the locally inspected upstream generator when porting it.
- [ ] **2.2 Run red:** `npm test -- src/engine/domain/rng.test.ts`. Confirm the current algorithm cannot generate all 36 pairs.
- [ ] **2.3 Port the generator and implement bounded integer selection.** Draw a 32-bit word from the Alea output and use rejection sampling to avoid modulo bias. Retain every consumed next state, including a rejected sample. The sampling operation is:

```ts
export function nextInt(state: RngState, maxExclusive: number): RngRoll {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > 0x1_0000_0000) {
    throw new Error('maxExclusive must be an integer from 1 through 2^32');
  }
  const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
  let cursor = state;
  for (;;) {
    const step = nextRng(cursor);
    cursor = step.nextState;
    if (step.value < limit) return { value: step.value % maxExclusive, nextState: cursor };
  }
}
```

Require an integer bound in `[1, 0x1_0000_0000]`. Keep randomness out of UI code and avoid consuming game randomness for CPU search. Use Fisher–Yates with this integer sampler for later deck/turn-order shuffles.
- [ ] **2.4 Bump the save schema, validate exact algorithm/state shape and update current tests.** Preserve old exported files; explicitly reject v2 saves as prototype-incompatible. Do not reinterpret the old LCG state as Alea. Task 4 will introduce a separate, fully specified session-envelope version.
- [ ] **2.5 Run the focused tests and local gate**, review licensing and all RNG assignments through Task 1's bridge, then commit `fix: make seeded dice cover valid outcomes` and open/monitor its PR.

## Task 3 — One A–F sequence per player; one shuffled order per round

**Create:** `src/engine/domain/turns.ts`, `src/engine/domain/turns.test.ts`, `src/test/conformance/runtime/turn-order.runtime.test.ts`.
**Modify:** `src/game/dr3-game.ts`, `src/game/dr3-game.test.ts`, `src/types/game-state.ts`, `src/engine/domain/setup.ts`, `src/engine/domain/rules.ts`, `src/game/runtime-bridge.ts`, runtime validation, `src/ai/cpu-bot.ts`, `src/App.tsx`, stage-sensitive E2E tests.
**Conformance:** Create a section-7 fixture under `docs/conformance/chunk_1_foundations/07_sequence_of_play.json` only with its runtime adapter and matching `coverage_matrix.json` entries. Register the new case IDs with Task 5's coverage mechanism when it lands.

**Interfaces:** Persist `currentTurn` as the domain game-round number, the round's shuffled `turnOrder`, and `completedPlayerIdsThisRound`. Remove persisted `activePlayerIndex`; supply `activePlayerId` from framework context on the non-persisted domain view. The wrapper owns actor conversion:

```ts
export interface DomainActorContext { activePlayerId: string }
export function toDomainState(
  runtime: RuntimeGameState,
  actor: DomainActorContext,
): GameState;
export function completePlayerTurn(
  domain: GameState,
  playerId: string,
): DomainResult & { roundCompleted?: boolean; gameCompleted?: boolean };
```

Update every UI, CPU, test and wrapper caller in the same change. `applyDomainMove` also takes `actor` and strips the derived `activePlayerId` before committing. `completedPlayerIdsThisRound` is round bookkeeping, not a copy of `ctx.currentPlayer`. Later elimination logic supplies the eligible player set.

- [ ] **3.1 Add a complete-turn driver in the new runtime test file.** Use one unbound local client for exercising multiple player IDs; assert successful transitions after each command. Initially the existing placeholder diplomacy can be used to reach movement, with an explicitly neutral target; do not write a fixture claiming its diplomacy is correct.

```ts
function finishPrototypePlayerTurn(client: ReturnType<typeof Client>) {
  const initial = client.getState()!;
  const target = Object.values(initial.G.factions).find(
    (faction: { controllingPlayerId: string | null }) => faction.controllingPlayerId === null,
  ) as { id: string };
  expect(target).toBeDefined();
  client.moves.rollRandomEvent();
  client.moves.drawDiplomacyCard();
  client.moves.conductDiplomacy(target.id, 'deactivate');
  client.moves.resolveSieges();
  client.moves.toCombatPhase();
  client.moves.endTurn();
}
```

Use the concrete typed DR3 client alias in the test implementation. For six-player tests, wrap `DR3Game.setup` in a test game configuration supplying six distinct `SetupOptions.players`; `ClientOpts` has no `setupData` constructor field. The helper never uses `overrideGameState`: in boardgame.io 0.50.2 that method changes the client view and does not install executable reducer state.

- [ ] **3.2 Add assertions against the driver:** current player changes after one complete turn; A–F steps keep the same `ctx.turn`; all 2/6 players act exactly once per round; a round advances only after its final player; seeded orders reproduce without replacement. Iterate 20 rounds and assert no early gameover, the last legal action executes, then further moves reject. Add out-of-turn and out-of-stage rejection cases, checking state and RNG unchanged.
- [ ] **3.3 Run red:** `npm test -- src/test/conformance/runtime/turn-order.runtime.test.ts`. Expect the player-handoff assertion to fail on player `0` remaining active.
- [ ] **3.4 Replace phase-per-step configuration with `turn.stages`.** Keep one phase for normal play, use `events.setStage` for A–F, call `events.endTurn` exactly once at F completion, and put the MP reset in the actual player's `turn.onBegin`. Prevent external `endPhase`/`setPhase` shortcuts from bypassing mandatory stages. Set `G.stage` only through the single transition function.

The coordinator order is: finish current-player effects → mark that player complete → if round complete, process round-end effects → if round 20, finish → otherwise increment domain round and shuffle eligible players → begin next player's A step. Do not advance the round or finish the game merely because a framework counter reaches 20.

- [ ] **3.5 Update UI/CPU stage reads and turn display**, and assert actual handoff in the browser test. Existing prototype buttons must still reach movement/combat. Do not use `ctx.phase` to infer A–F after this migration.
- [ ] **3.6 Run focused tests, conformance validation and the gate**, then commit `fix: advance players and game rounds correctly`, open and monitor its PR. Publish section-7 coverage only for cases actually executed.

## Task 4 — Restore a complete executable session

**Create:** `src/game/session.ts`, `src/game/session.test.ts`.
**Modify:** `src/persistence/save-load.ts`, `src/persistence/save-load.test.ts`, `src/game/runtime-state.ts`, `src/game/dr3-game.ts`, `src/App.tsx`, `src/test/e2e/app.spec.ts`.

**Decision:** Store domain `G` plus the canonical boardgame.io context/plugin state in a versioned session envelope. Preserve no redundant phase/current-player mirror in `G`; restore through a single local session adapter, not a public gameplay move. Clear undo/redo history at load rather than fabricate hidden-information history. Keep the save parser's external errors explicit.

**Interfaces:**

```ts
export interface SavedSession {
  schemaVersion: number;
  engineVersion: 'boardgame.io-0.50.2';
  savedAtIso: string;
  engineState: State<RuntimeGameState>;
}
export function createSessionSnapshot(state: State<RuntimeGameState>): SavedSession;
export function restoreLocalSession(
  client: ReturnType<typeof Client<RuntimeGameState>>,
  snapshot: SavedSession,
): void;
```

Use a concrete alias if the installed TypeScript signatures require it. Validate a deliberately enumerated subset of `State` and reconstruct transient fields. Never serialize subscriber/UI state or accept an unchecked raw `ctx` cast.

- [ ] **4.1 Write the cross-player executable round-trip test.** Create a real client, complete one player turn using Task 3's driver, save, advance at least another player turn, restore into a fresh client, then execute the saved actor's next legal move. Assert both actor and RNG continuation match an uninterrupted control run.

```ts
const expected = control.getState()!;
const saved = createSessionSnapshot(expected);
restoreLocalSession(restored, JSON.parse(JSON.stringify(saved)));
expect(restored.getState()!.ctx.currentPlayer).toBe(expected.ctx.currentPlayer);
expect(restored.getState()!.G).toEqual(expected.G);
control.moves.rollRandomEvent();
restored.moves.rollRandomEvent();
expect(restored.getState()!.G).toEqual(control.getState()!.G);
```

The test creates `control` and `restored` using the shared real-client factory and stops both afterwards. Repeat at every A–F stage, round boundary and gameover; a displayed-stage equality alone is not sufficient.
- [ ] **4.2 Run red** against current G-only persistence. Add invalid-state cases: unknown actor, impossible order membership, mismatched phase/stage, unknown unit/faction IDs, invalid RNG state, non-integer/out-of-range counters and malformed terminal result.
- [ ] **4.3 Implement the isolated local restore adapter.** Installed `ClientOpts` has no `initialState` option and `overrideGameState` changes only the view. Inspect the installed Redux reducer's `RESET`/`SYNC` action path and install validated canonical state through the client's store in this one pinned-version adapter; assert with real post-load moves. Keep the framework coupling here and test it on dependency upgrades. Do not spread internal action dispatch through UI or rule modules.
- [ ] **4.4 Replace UI `restoreSnapshot` calls with the session adapter**, remove the gameplay restore move, cancel in-flight CPU work and clear UI selection after restore. Keep old save files untouched and provide a specific unsupported-prototype-version error.
- [ ] **4.5 Run all persistence/runtime tests, browser load tests and local gate**, then commit `fix: restore executable game sessions`, open and monitor the PR. New pending-choice types in later packages must extend this same round-trip matrix.

## Task 5 — Measure executed conformance, align remote gates

**Modify:** `src/test/conformance/harness.ts`, current runtime conformance tests, `scripts/report_conformance_coverage.py`, `scripts/validate_conformance_suite.py`, `vitest.config.ts`, `package.json`, `.github/workflows/ci.yml`.
**Create:** `src/test/conformance/runtime-registry.ts`, `src/test/conformance/runtime-registry.test.ts`, `scripts/test_report_conformance_coverage.py`, a generated ignored execution report under `test-results/`.

**Interfaces:**

```ts
export function runRuntimeCase(
  suitePath: string,
  caseId: string,
  assertion: (testCase: ConformanceTest) => void | Promise<void>,
): void;
```

The registration resolves a real fixture ID, names the Vitest test, enforces assertions and records a passing runtime execution only after the callback completes. Runtime assertions must execute production commands on installed reducer state and inspect outcomes. Direct helper tests remain helper coverage even when housed in a `runtime/` directory.

- [ ] **5.1 Write report/registry failures for unknown IDs, duplicate registration, registered-but-not-executed cases, zero assertions, stale run data and a fixture file with only one of several cases exercised.** A test source comment containing a fixture filename must not promote anything. Example expected report row:

```json
{
  "suite": "chunk_2_core_mechanics/25_combat.json",
  "fixtureCases": 61,
  "runtimePassed": 1,
  "status": "partial-runtime"
}
```

This is a synthetic report test input, not the current measured combat count.
- [ ] **5.2 Run red:** `npm test -- src/test/conformance/runtime-registry.test.ts` and `python3 -m unittest discover -s scripts -p 'test_report_conformance_coverage.py'`.
- [ ] **5.3 Implement case registration and an execution report collected by a Vitest reporter**, with a fresh run ID and revision. Clear previous evidence before the run; emit worker results through the reporter rather than unsynchronised parallel writes. A standalone report without fresh execution data must say unverified, not reuse stale passing counts.
- [ ] **5.4 Convert the current seven runtime-labelled tests.** Assert the fixture's actual inputs/outputs, not just existence of its ID. The current “terrain cost exceeds remaining” test chooses a nonadjacent hex: replace that with an adjacent expensive terrain case after a prior move. Exercise combat through real client dispatch after installing a scenario via the isolated test/session adapter. Replace fixture-self assertions in adapters with actual helper outputs where supported; downgrade/defer remaining claims.
- [ ] **5.5 Align CI with `npm run test:local:gate`** after installing Chromium. Make focused test runs remain possible without pretending they qualify as a full release report. A full gate must fail on skipped tests or missing required execution records. Keep WebKit/visual checks as an explicit separate job and never refresh snapshots automatically on failure.
- [ ] **5.6 Add new domain modules to coverage as they land**, with a ratchet from current module baselines rather than lowering thresholds or counting only easy files. Track semantic rule coverage separately; the PRD's 90% helper coverage goal is not already achieved by today's three-file report.
- [ ] **5.7 Run focused registry/report tests, the full gate and inspect the fresh generated report**, then commit `test: report executed runtime conformance`, open and monitor the PR.

## Final W1 acceptance checklist

- [ ] Two-player and six-player scenarios each run exactly 20 complete rounds without skips or fallback state injection.
- [ ] Round order is a deterministic permutation of eligible players; A–F does not count as six player turns.
- [ ] Every die pair is reachable in the fixed regression sample, game RNG advances on committed random actions, and failed actions preserve it.
- [ ] Actual saved games resume with the same actor, round, stage and next random result in a new client.
- [ ] Rejected commands preserve all state; no top-level domain replacement disappears.
- [ ] Runtime case reporting is based on executed assertions and explicitly distinguishes partial/helper/unwired coverage.
- [ ] Required gate and GitHub Actions pass; no reference files changed.
- [ ] Update the roadmap with measured outcomes. Keep W2–W10 open and the game labelled as a prototype.
