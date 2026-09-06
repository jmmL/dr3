# DR3 Recovery Plan (2026-03-17)

Historical recovery tracker, superseded by [the solo-game implementation plan](2026-09-06-solo-game-implementation-plan.md). The September review found additional turn/RNG defects in the previously trusted prototype paths; see that review before relying on this baseline.

## Current baseline

- Trusted slice:
  - movement legality
  - combat declaration and resolution
  - save/load/import/export validation
  - Chromium portable E2E lane
  - runtime conformance assertions for movement/combat chunks
- Scaffolded or incomplete systems:
  - diplomacy/cards
  - random events
  - sieges
  - victory conditions
  - many conformance chunks outside the movement/combat slice

## Recovery work already landed

1. Removed duplicated runtime state:
   - dropped `PlayerState.hand`
   - dropped unused `unitDefinitions` / `factionData` from `GameState`
   - kept `stage` as the single intentional persisted flow mirror
2. Hardened persistence:
   - save schema bumped to `2`
   - snapshot imports now validate runtime state shape and fail closed
3. Tightened trusted-slice rules:
   - movement/combat hostility now keys off player control rather than raw `factionId`
   - pending combats now record `declaredByPlayerId`
4. Added trusted-slice UI path:
   - combat attacker selection
   - combat target highlighting
   - combat resolve action
   - E2E hook for deterministic skirmish setup
5. Reworked tooling:
   - Node/npm baseline pinned in repo metadata
   - portable E2E lane separated from visual lane
   - coverage gate for critical runtime modules
   - conformance wiring report added

## Next implementation targets

1. Build a real diplomacy/card model instead of placeholder draw/activation logic.
2. Replace random event logging stubs with stateful event application.
3. Implement siege declaration and state transitions before keeping siege resolution in the turn flow.
4. Implement victory scoring with runtime tests and end-game assertions.
5. Promote unwired chunks one subsystem at a time from `unwired` -> `adapter-only` -> `runtime-covered`.
6. AI behavior must have conformance test coverage before promotion to trusted slice.
