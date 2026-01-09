/**
 * Map calibration settings for aligning the hex grid overlay with the DR3 map image.
 *
 * To calibrate:
 * 1. Add the map image to public/assets/minaria-map.png
 * 2. Set MAP_IMAGE_URL below
 * 3. Adjust offsetX, offsetY, and hexScale until the hex grid aligns with the map
 * 4. Save these values permanently once calibration is complete
 */

export interface MapCalibration {
  /** X offset to shift the entire hex grid (pixels) */
  offsetX: number
  /** Y offset to shift the entire hex grid (pixels) */
  offsetY: number
  /** Scale factor for hex size (1.0 = default 20px hex size) */
  hexScale: number
}

/**
 * URL to the map image. Set to null to use rendered hex terrain.
 * When set, hexes become transparent overlays for selection.
 */
export const MAP_IMAGE_URL: string | null = null
// Uncomment when map image is added:
// export const MAP_IMAGE_URL = '/assets/minaria-map.png'

/**
 * Calibration values for aligning hex grid to map image.
 * These will need adjustment once the actual DR3 map is added.
 */
export const MAP_CALIBRATION: MapCalibration = {
  offsetX: 0,
  offsetY: 0,
  hexScale: 1.0,
}
