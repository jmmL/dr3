import { describe, it, expect } from 'vitest';
import { loadHexMap } from '@/data/load-refs';
import { getNeighborCoords } from './hex-grid';
import { getNeighbors, hexDistance } from './hex-utils';

describe('hex-grid', () => {
  const map = loadHexMap();

  it('getNeighbors(10,10) returns 6 hexes', () => {
    const neighbors = getNeighbors(10, 10);
    expect(neighbors).toHaveLength(6);
  });

  it('getNeighborCoords filters to valid map hexes', () => {
    const neighbors = getNeighborCoords(map, 10, 10);
    expect(neighbors).toHaveLength(6);
    for (const n of neighbors) {
      expect(map.hexes.has(`${n.col},${n.row}`)).toBe(true);
    }
  });

  it('corner hex has fewer valid neighbors', () => {
    const neighbors = getNeighborCoords(map, 0, 0);
    expect(neighbors.length).toBeLessThan(6);
  });

  it('hexDistance between adjacent hexes is 1', () => {
    const neighbors = getNeighbors(10, 10);
    for (const n of neighbors) {
      expect(hexDistance({ col: 10, row: 10 }, n)).toBe(1);
    }
  });
});
