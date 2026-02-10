import { describe, expect, it } from 'vitest';
import { MINARIA_MAP_CALIBRATION, mapHexCenter } from './map-calibration';

describe('map calibration lattice parity', () => {
  it('uses odd-q column parity staggering (not row parity)', () => {
    const evenColSameRow = mapHexCenter(10, 12, MINARIA_MAP_CALIBRATION);
    const evenColNextRow = mapHexCenter(10, 13, MINARIA_MAP_CALIBRATION);
    const oddColSameRow = mapHexCenter(11, 12, MINARIA_MAP_CALIBRATION);

    const rowStepX = evenColNextRow.x - evenColSameRow.x;
    const rowStepY = evenColNextRow.y - evenColSameRow.y;
    const colStepY = oddColSameRow.y - evenColSameRow.y;

    // Row changes should not horizontally offset centers in odd-q layout.
    expect(Math.abs(rowStepX)).toBeLessThan(0.000001);
    // Rows are spaced by 1.5 radii.
    expect(rowStepY).toBeCloseTo(MINARIA_MAP_CALIBRATION.hexRadius * 1.5, 6);
    // Odd columns are vertically shifted by half a row step.
    expect(colStepY).toBeCloseTo(MINARIA_MAP_CALIBRATION.hexRadius * 0.75, 6);
  });
});
