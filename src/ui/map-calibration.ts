const SQRT3 = Math.sqrt(3);

export interface MapCalibration {
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  hexRadius: number;
  offsetX: number;
  offsetY: number;
}

export const MINARIA_MAP_CALIBRATION: MapCalibration = {
  imagePath: '/assets/minaria-map-hires.jpg',
  imageWidth: 1841,
  imageHeight: 1403,
  // Regular pointy-hex geometry: only radius + offsets are calibrated.
  hexRadius: 28,
  offsetX: 120,
  offsetY: 58,
};

function latticePosition(col: number, row: number): { x: number; y: number } {
  return {
    x: col * SQRT3,
    y: row * 1.5 + (col % 2 === 1 ? 0.75 : 0),
  };
}

export function mapHexCenter(
  col: number,
  row: number,
  calibration: MapCalibration = MINARIA_MAP_CALIBRATION,
): { x: number; y: number } {
  const lattice = latticePosition(col, row);
  return {
    x: calibration.offsetX + lattice.x * calibration.hexRadius,
    y: calibration.offsetY + lattice.y * calibration.hexRadius,
  };
}

export function mapHexPolygonPoints(
  col: number,
  row: number,
  calibration: MapCalibration = MINARIA_MAP_CALIBRATION,
): string {
  const center = mapHexCenter(col, row, calibration);
  const points: string[] = [];

  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = center.x + calibration.hexRadius * Math.cos(angle);
    const y = center.y + calibration.hexRadius * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return points.join(' ');
}
