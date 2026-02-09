import type { HexCoord, HexMap } from '@/types';

export interface TraversalStepContext {
  map: HexMap;
  start: HexCoord;
  from: HexCoord;
  to: HexCoord;
  currentCost: number;
  nextCost: number;
  steps: number;
  maxCost?: number;
}

export interface TraversalPolicy {
  getNeighbors: (coord: HexCoord) => HexCoord[];
  getStepCost?: (context: TraversalStepContext) => number;
  canTraverse?: (context: TraversalStepContext) => boolean;
  heuristic?: (from: HexCoord, goal: HexCoord) => number;
}

export interface PathfindingBaseInput {
  map: HexMap;
  start: HexCoord;
  maxCost?: number;
  allowFirstStepOverMaxCost?: boolean;
  policy: TraversalPolicy;
}

export interface FindPathInput extends PathfindingBaseInput {
  goal: HexCoord;
}

export interface ReachableHex {
  coord: HexCoord;
  cost: number;
  steps: number;
}

export interface PathResult {
  found: boolean;
  path: HexCoord[];
  cost: number;
  reason?: 'start_out_of_bounds' | 'goal_out_of_bounds' | 'no_path';
  visited: number;
}

export interface ReachableResult {
  reachable: ReachableHex[];
  visited: number;
  reason?: 'start_out_of_bounds';
}

export interface FindReachableInput extends PathfindingBaseInput {
  includeStart?: boolean;
}
