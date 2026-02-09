import { describe, expect, it } from 'vitest';
import type { HexCoord, HexMap, HexData } from '@/types';
import { hexKeyFromCoord } from '@/types';
import { findPath, findReachableHexes } from './pathfinding';

function coord(col: number, row: number): HexCoord {
  return { col, row };
}

function makeMap(coords: HexCoord[]): HexMap {
  const hexes = new Map<string, HexData>();
  for (const c of coords) {
    hexes.set(hexKeyFromCoord(c), {
      col: c.col,
      row: c.row,
      terrain: ['clear'],
    });
  }
  return {
    cols: 20,
    rows: 20,
    hexes,
  };
}

describe('pathfinding', () => {
  it('findPath prefers the lower-cost path', () => {
    const a = coord(0, 0);
    const b = coord(1, 0);
    const c = coord(0, 1);
    const d = coord(1, 1);
    const map = makeMap([a, b, c, d]);
    const neighbors: Record<string, HexCoord[]> = {
      [hexKeyFromCoord(a)]: [b, c],
      [hexKeyFromCoord(b)]: [a, d],
      [hexKeyFromCoord(c)]: [a, d],
      [hexKeyFromCoord(d)]: [b, c],
    };
    const costs = new Map<string, number>([
      [`${hexKeyFromCoord(a)}->${hexKeyFromCoord(b)}`, 5],
      [`${hexKeyFromCoord(b)}->${hexKeyFromCoord(a)}`, 5],
      [`${hexKeyFromCoord(a)}->${hexKeyFromCoord(c)}`, 1],
      [`${hexKeyFromCoord(c)}->${hexKeyFromCoord(a)}`, 1],
      [`${hexKeyFromCoord(c)}->${hexKeyFromCoord(d)}`, 1],
      [`${hexKeyFromCoord(d)}->${hexKeyFromCoord(c)}`, 1],
      [`${hexKeyFromCoord(b)}->${hexKeyFromCoord(d)}`, 1],
      [`${hexKeyFromCoord(d)}->${hexKeyFromCoord(b)}`, 1],
    ]);

    const result = findPath({
      map,
      start: a,
      goal: d,
      policy: {
        getNeighbors: (current) => neighbors[hexKeyFromCoord(current)] ?? [],
        getStepCost: ({ from, to }) =>
          costs.get(`${hexKeyFromCoord(from)}->${hexKeyFromCoord(to)}`) ?? Infinity,
      },
    });

    expect(result.found).toBe(true);
    expect(result.cost).toBe(2);
    expect(result.path).toEqual([a, c, d]);
  });

  it('findPath reports no_path when traversal is blocked', () => {
    const a = coord(0, 0);
    const b = coord(1, 0);
    const map = makeMap([a, b]);

    const result = findPath({
      map,
      start: a,
      goal: b,
      policy: {
        getNeighbors: () => [b],
        canTraverse: () => false,
      },
    });

    expect(result.found).toBe(false);
    expect(result.reason).toBe('no_path');
  });

  it('findReachableHexes allows one over-budget first step and stops expansion', () => {
    const a = coord(0, 0);
    const b = coord(1, 0);
    const c = coord(2, 0);
    const map = makeMap([a, b, c]);
    const neighbors: Record<string, HexCoord[]> = {
      [hexKeyFromCoord(a)]: [b],
      [hexKeyFromCoord(b)]: [a, c],
      [hexKeyFromCoord(c)]: [b],
    };

    const result = findReachableHexes({
      map,
      start: a,
      maxCost: 1,
      allowFirstStepOverMaxCost: true,
      policy: {
        getNeighbors: (current) => neighbors[hexKeyFromCoord(current)] ?? [],
        getStepCost: () => 3,
      },
    });

    expect(result.reachable).toHaveLength(1);
    expect(result.reachable[0]?.coord).toEqual(b);
    expect(result.reachable[0]?.cost).toBe(3);
  });

  it('findReachableHexes sorts deterministically by cost then coordinate', () => {
    const a = coord(0, 0);
    const b = coord(2, 0);
    const c = coord(1, 0);
    const d = coord(1, 1);
    const map = makeMap([a, b, c, d]);
    const neighbors: Record<string, HexCoord[]> = {
      [hexKeyFromCoord(a)]: [b, c, d],
      [hexKeyFromCoord(b)]: [a],
      [hexKeyFromCoord(c)]: [a],
      [hexKeyFromCoord(d)]: [a],
    };

    const result = findReachableHexes({
      map,
      start: a,
      policy: {
        getNeighbors: (current) => neighbors[hexKeyFromCoord(current)] ?? [],
        getStepCost: ({ to }) => (to.col === 2 ? 2 : 1),
      },
    });

    expect(result.reachable.map((r) => r.coord)).toEqual([c, d, b]);
  });
});
