# DR3 In-House Hex Pathfinding Plan (2026-02-09)

This scoped plan is separate from the visual map/image calibration work.

## Summary

Implement deterministic, rule-aware in-house pathfinding primitives for the odd-q hex map, then integrate traversal outputs into movement decision helpers and CPU behavior without changing game rules.

## Scope

- In scope:
  - `findPath` (A*).
  - `findReachableHexes` (cost-bounded Dijkstra flood).
  - Rule-aware traversal policies (terrain cost, enemy occupancy, map bounds, minimum first-step behavior).
  - Integration in movement decision helper(s) used by CPU enumeration.
  - Unit tests for pathfinding and integration safety.
- Out of scope:
  - Third-party pathfinding libraries.
  - Conformance fixture/schema changes.
  - Immediate multi-hex UI move command.

## Interfaces

- `src/engine/map/pathfinding-types.ts`
  - `TraversalStepContext`
  - `TraversalPolicy`
  - `FindPathInput`
  - `FindReachableInput`
  - `PathResult`
  - `ReachableResult`
- `src/engine/map/pathfinding.ts`
  - `findPath(input): PathResult`
  - `findReachableHexes(input): ReachableResult`

## Core Decisions

1. Preserve odd-q geometry and existing neighbor generation.
2. Keep traversal generic via policy callbacks (`getNeighbors`, `getStepCost`, `canTraverse`, `heuristic`).
3. Enforce deterministic output using stable tie-breaks (cost, steps, coordinate order).
4. Support DR3 minimum movement exception by allowing an over-budget first step when configured.
5. Keep `moveUnitForPlayer` legality checks authoritative and unchanged.

## Integration

1. Wire `findFirstLegalMovement` to traversal outputs rather than raw neighbor-first scanning.
2. Limit returned destinations to adjacent legal hexes (`steps === 1`) so move calls remain valid with current single-step move API.
3. Continue using existing movement legality in `moveUnitForPlayer` as the execution gate.

## Testing

1. `src/engine/map/pathfinding.test.ts`
  - lower-cost route selection
  - blocked route behavior
  - over-budget first-step allowance
  - deterministic sort/tie behavior
2. Existing domain/CPU tests must continue to pass.

## Acceptance Criteria

1. Pathfinding utilities return deterministic, bounded, rule-filtered results.
2. CPU movement selection stays legal with the current move API.
3. No regressions in existing rules, game wrapper, or CPU tests.
