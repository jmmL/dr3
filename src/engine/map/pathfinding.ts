import type { HexCoord } from '@/types';
import { hexKeyFromCoord } from '@/types';
import { hexDistance } from './hex-utils';
import type {
  FindPathInput,
  FindReachableInput,
  PathResult,
  ReachableHex,
  ReachableResult,
  TraversalPolicy,
  TraversalStepContext,
} from './pathfinding-types';

interface FrontierNode {
  coord: HexCoord;
  cost: number;
  steps: number;
  priority: number;
}

function compareCoords(a: HexCoord, b: HexCoord): number {
  if (a.col !== b.col) return a.col - b.col;
  return a.row - b.row;
}

/** Compare two frontier nodes for heap ordering (negative = a is better). */
function compareNodes(a: FrontierNode, b: FrontierNode): number {
  if (a.priority !== b.priority) return a.priority - b.priority;
  if (a.cost !== b.cost) return a.cost - b.cost;
  if (a.steps !== b.steps) return a.steps - b.steps;
  return compareCoords(a.coord, b.coord);
}

/** Binary min-heap for O(log n) push/pop on frontier nodes. */
class MinHeap {
  private heap: FrontierNode[] = [];

  get length(): number {
    return this.heap.length;
  }

  push(node: FrontierNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): FrontierNode | undefined {
    const heap = this.heap;
    if (heap.length === 0) return undefined;
    const top = heap[0]!;
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number): void {
    const heap = this.heap;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (compareNodes(heap[i]!, heap[parent]!) >= 0) break;
      [heap[i], heap[parent]] = [heap[parent]!, heap[i]!];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const heap = this.heap;
    const n = heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && compareNodes(heap[left]!, heap[smallest]!) < 0) smallest = left;
      if (right < n && compareNodes(heap[right]!, heap[smallest]!) < 0) smallest = right;
      if (smallest === i) break;
      [heap[i], heap[smallest]] = [heap[smallest]!, heap[i]!];
      i = smallest;
    }
  }
}

function sortCoords(coords: HexCoord[]): HexCoord[] {
  return [...coords].sort(compareCoords);
}

function isWithinBounds(input: { map: FindPathInput['map']; coord: HexCoord }): boolean {
  return input.map.hexes.has(hexKeyFromCoord(input.coord));
}

function getStepCost(policy: TraversalPolicy, context: TraversalStepContext): number {
  const value = policy.getStepCost?.(context) ?? 1;
  if (!Number.isFinite(value) || value < 0) return Infinity;
  return value;
}

function canUseStepCost(input: {
  nextCost: number;
  maxCost?: number;
  allowFirstStepOverMaxCost: boolean;
  steps: number;
}): boolean {
  const { nextCost, maxCost, allowFirstStepOverMaxCost, steps } = input;
  if (maxCost == null) return true;
  if (nextCost <= maxCost) return true;
  return allowFirstStepOverMaxCost && steps === 0;
}

function shouldExpandNode(input: { nodeCost: number; maxCost?: number }): boolean {
  const { nodeCost, maxCost } = input;
  if (maxCost == null) return true;
  return nodeCost <= maxCost;
}

function reconstructPath(
  startKey: string,
  goalKey: string,
  cameFrom: Map<string, string>,
  coordByKey: Map<string, HexCoord>,
): HexCoord[] {
  const reversed: HexCoord[] = [];
  let key = goalKey;

  while (true) {
    const coord = coordByKey.get(key);
    if (!coord) break;
    reversed.push(coord);
    if (key === startKey) break;
    const previous = cameFrom.get(key);
    if (!previous) break;
    key = previous;
  }

  return reversed.reverse();
}

export function findReachableHexes(input: FindReachableInput): ReachableResult {
  const {
    map,
    start,
    maxCost,
    policy,
    includeStart = false,
    allowFirstStepOverMaxCost = false,
  } = input;

  if (!isWithinBounds({ map, coord: start })) {
    return { reachable: [], visited: 0, reason: 'start_out_of_bounds' };
  }

  const startKey = hexKeyFromCoord(start);
  const bestCost = new Map<string, number>([[startKey, 0]]);
  const bestSteps = new Map<string, number>([[startKey, 0]]);
  const coordByKey = new Map<string, HexCoord>([[startKey, start]]);
  const frontier = new MinHeap();
  frontier.push({ coord: start, cost: 0, steps: 0, priority: 0 });
  let visited = 0;

  while (frontier.length > 0) {
    const current = frontier.pop();
    if (!current) break;
    const currentKey = hexKeyFromCoord(current.coord);
    const storedCost = bestCost.get(currentKey);
    if (storedCost == null || current.cost > storedCost) continue;
    const storedSteps = bestSteps.get(currentKey);
    if (storedSteps != null && current.cost === storedCost && current.steps > storedSteps) continue;

    visited += 1;

    if (!shouldExpandNode({ nodeCost: current.cost, maxCost })) {
      continue;
    }

    const neighbors = sortCoords(policy.getNeighbors(current.coord));
    for (const neighbor of neighbors) {
      if (!isWithinBounds({ map, coord: neighbor })) continue;

      const stepContextBase = {
        map,
        start,
        from: current.coord,
        to: neighbor,
        currentCost: current.cost,
        steps: current.steps,
        maxCost,
      };
      const stepCost = getStepCost(policy, {
        ...stepContextBase,
        nextCost: current.cost,
      });
      if (!Number.isFinite(stepCost)) continue;

      const nextCost = current.cost + stepCost;
      if (!canUseStepCost({
        nextCost,
        maxCost,
        allowFirstStepOverMaxCost,
        steps: current.steps,
      })) {
        continue;
      }

      const stepContext: TraversalStepContext = {
        ...stepContextBase,
        nextCost,
      };
      if (policy.canTraverse && !policy.canTraverse(stepContext)) continue;

      const nextKey = hexKeyFromCoord(neighbor);
      const nextSteps = current.steps + 1;
      const previousBestCost = bestCost.get(nextKey);
      const previousBestSteps = bestSteps.get(nextKey);
      const hasBetterPath =
        previousBestCost == null ||
        nextCost < previousBestCost ||
        (nextCost === previousBestCost &&
          (previousBestSteps == null || nextSteps < previousBestSteps));
      if (!hasBetterPath) continue;

      bestCost.set(nextKey, nextCost);
      bestSteps.set(nextKey, nextSteps);
      coordByKey.set(nextKey, neighbor);
      frontier.push({
        coord: neighbor,
        cost: nextCost,
        steps: nextSteps,
        priority: nextCost,
      });
    }
  }

  const reachable: ReachableHex[] = [];
  for (const [key, cost] of bestCost.entries()) {
    if (!includeStart && key === startKey) continue;
    const coord = coordByKey.get(key);
    if (!coord) continue;
    const steps = bestSteps.get(key) ?? 0;
    reachable.push({ coord, cost, steps });
  }

  reachable.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    if (a.steps !== b.steps) return a.steps - b.steps;
    return compareCoords(a.coord, b.coord);
  });

  return { reachable, visited };
}

export function findPath(input: FindPathInput): PathResult {
  const {
    map,
    start,
    goal,
    maxCost,
    policy,
    allowFirstStepOverMaxCost = false,
  } = input;

  if (!isWithinBounds({ map, coord: start })) {
    return {
      found: false,
      path: [],
      cost: 0,
      reason: 'start_out_of_bounds',
      visited: 0,
    };
  }
  if (!isWithinBounds({ map, coord: goal })) {
    return {
      found: false,
      path: [],
      cost: 0,
      reason: 'goal_out_of_bounds',
      visited: 0,
    };
  }

  const heuristic = policy.heuristic ?? hexDistance;
  const startKey = hexKeyFromCoord(start);
  const goalKey = hexKeyFromCoord(goal);

  const bestCost = new Map<string, number>([[startKey, 0]]);
  const bestSteps = new Map<string, number>([[startKey, 0]]);
  const cameFrom = new Map<string, string>();
  const coordByKey = new Map<string, HexCoord>([
    [startKey, start],
    [goalKey, goal],
  ]);
  const frontier = new MinHeap();
  frontier.push({
    coord: start,
    cost: 0,
    steps: 0,
    priority: heuristic(start, goal),
  });
  let visited = 0;

  while (frontier.length > 0) {
    const current = frontier.pop();
    if (!current) break;
    const currentKey = hexKeyFromCoord(current.coord);
    const storedCost = bestCost.get(currentKey);
    if (storedCost == null || current.cost > storedCost) continue;
    const storedSteps = bestSteps.get(currentKey);
    if (storedSteps != null && current.cost === storedCost && current.steps > storedSteps) continue;

    visited += 1;

    if (currentKey === goalKey) {
      return {
        found: true,
        path: reconstructPath(startKey, goalKey, cameFrom, coordByKey),
        cost: current.cost,
        visited,
      };
    }

    if (!shouldExpandNode({ nodeCost: current.cost, maxCost })) {
      continue;
    }

    const neighbors = sortCoords(policy.getNeighbors(current.coord));
    for (const neighbor of neighbors) {
      if (!isWithinBounds({ map, coord: neighbor })) continue;

      const stepContextBase = {
        map,
        start,
        from: current.coord,
        to: neighbor,
        currentCost: current.cost,
        steps: current.steps,
        maxCost,
      };
      const stepCost = getStepCost(policy, {
        ...stepContextBase,
        nextCost: current.cost,
      });
      if (!Number.isFinite(stepCost)) continue;

      const nextCost = current.cost + stepCost;
      if (!canUseStepCost({
        nextCost,
        maxCost,
        allowFirstStepOverMaxCost,
        steps: current.steps,
      })) {
        continue;
      }

      const stepContext: TraversalStepContext = {
        ...stepContextBase,
        nextCost,
      };
      if (policy.canTraverse && !policy.canTraverse(stepContext)) continue;

      const nextKey = hexKeyFromCoord(neighbor);
      const nextSteps = current.steps + 1;
      const previousBestCost = bestCost.get(nextKey);
      const previousBestSteps = bestSteps.get(nextKey);
      const hasBetterPath =
        previousBestCost == null ||
        nextCost < previousBestCost ||
        (nextCost === previousBestCost &&
          (previousBestSteps == null || nextSteps < previousBestSteps));
      if (!hasBetterPath) continue;

      bestCost.set(nextKey, nextCost);
      bestSteps.set(nextKey, nextSteps);
      cameFrom.set(nextKey, currentKey);
      coordByKey.set(nextKey, neighbor);
      frontier.push({
        coord: neighbor,
        cost: nextCost,
        steps: nextSteps,
        priority: nextCost + heuristic(neighbor, goal),
      });
    }
  }

  return {
    found: false,
    path: [],
    cost: 0,
    reason: 'no_path',
    visited,
  };
}
