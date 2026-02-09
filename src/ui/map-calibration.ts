const SQRT3 = Math.sqrt(3);

export interface MapCalibration {
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export const MINARIA_MAP_CALIBRATION: MapCalibration = {
  imagePath: '/assets/minaria-map-hires.jpg',
  imageWidth: 1841,
  imageHeight: 1403,
  // Tuned for the supplied hires board scan.
  scaleX: 31,
  scaleY: 24.2,
  offsetX: 120,
  offsetY: 58,
};

function latticePosition(col: number, row: number): { x: number; y: number } {
  return {
    x: col * 1.5,
    y: row * SQRT3 + (col % 2 === 1 ? SQRT3 / 2 : 0),
  };
}

export function mapHexCenter(
  col: number,
  row: number,
  calibration: MapCalibration = MINARIA_MAP_CALIBRATION,
): { x: number; y: number } {
  const lattice = latticePosition(col, row);
  return {
    x: calibration.offsetX + lattice.x * calibration.scaleX,
    y: calibration.offsetY + lattice.y * calibration.scaleY,
  };
}

export function mapHexPolygonPoints(
  col: number,
  row: number,
  calibration: MapCalibration = MINARIA_MAP_CALIBRATION,
): string {
  const center = mapHexCenter(col, row, calibration);
  const radiusX = calibration.scaleX;
  const radiusY = (SQRT3 / 2) * calibration.scaleY;
  const points: string[] = [];

  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = center.x + radiusX * Math.cos(angle);
    const y = center.y + radiusY * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return points.join(' ');
}
