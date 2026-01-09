/**
 * Map calibration settings for aligning the hex grid overlay with the DR3 map image.
 *
 * NOTE: Currently using 25th Anniversary Edition map image which has correct geography
 * but slightly different kingdom colors. TODO: Find true 3rd Edition map image.
 *
 * To calibrate:
 * 1. Add the map image to public/assets/minaria-map.png
 * 2. Set MAP_IMAGE_URL below
 * 3. Adjust offsetX, offsetY, and hexScale until the hex grid aligns with the map
 * 4. Save these values permanently once calibration is complete
 */

export interface MapCalibration {
  /** X offset to shift the entire hex grid (pixels in SVG coordinate space) */
  offsetX: number
  /** Y offset to shift the entire hex grid (pixels in SVG coordinate space) */
  offsetY: number
  /** Scale factor for hex size (1.0 = default 20px hex size) */
  hexScale: number
}

/** Dimensions of the map image for proper scaling */
export interface MapImageDimensions {
  width: number
  height: number
}

/**
 * URL to the map image. Set to null to use rendered hex terrain.
 * When set, hexes become transparent overlays for selection.
 * Uses import.meta.env.BASE_URL to work correctly on GitHub Pages.
 */
export const MAP_IMAGE_URL: string | null = `${import.meta.env.BASE_URL}assets/map.png`

/**
 * Actual dimensions of the map image file.
 * Used to properly scale the image in the SVG viewport.
 */
export const MAP_IMAGE_DIMENSIONS: MapImageDimensions = {
  width: 2600,
  height: 2040,
}

/**
 * Calibration values for aligning hex grid to map image.
 * These values were calibrated for the 25th Anniversary Edition map (2600x2040).
 *
 * To fine-tune:
 * - offsetX: increase to move grid right, decrease to move left
 * - offsetY: increase to move grid down, decrease to move up
 * - hexScale: increase to make hexes larger, decrease to make smaller
 */
export const MAP_CALIBRATION: MapCalibration = {
  offsetX: 48,
  offsetY: 22,
  hexScale: 0.87,
}
