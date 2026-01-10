import { test, expect } from '@playwright/test'
import { GamePage } from './pages/GamePage'

/**
 * Map Viewing Tests
 *
 * User Story: As a player, I want to view the game map so I can see the
 * current state of the game world including terrain, kingdoms, and units.
 *
 * These tests verify:
 * - Map renders correctly with the map image overlay
 * - Hexes are properly displayed as selection overlays
 * - Units are visible on the map
 * - Zoom and pan controls work
 */
test.describe('Map Viewing', () => {
  test.describe('Initial Load', () => {
    test('displays the game title and turn info', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      await expect(gamePage.title).toContainText('Divine Right')
      await expect(gamePage.turnInfo).toBeVisible()
      expect(await gamePage.getTurnNumber()).toBe(1)
      expect(await gamePage.getPhase()).toBe('setup')
    })

    test('renders the map with background image', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      // Map should use image mode by default
      expect(await gamePage.isMapImageMode()).toBe(true)

      // Map container and grid should be visible
      await expect(gamePage.mapContainer).toBeVisible()
      await expect(gamePage.hexGrid).toBeVisible()
    })

    test('displays hex overlay grid for interaction', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      // Should have substantial number of hexes (Minaria has ~1070)
      const hexCount = await gamePage.getHexCount()
      expect(hexCount).toBeGreaterThan(1000)
      expect(hexCount).toBeLessThan(1200)
    })

    test('shows units on the map', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      // Should have unit markers for both kingdoms
      const unitCount = await gamePage.getUnitMarkerCount()
      expect(unitCount).toBeGreaterThan(0)
    })
  })

  test.describe('Map Controls', () => {
    test('displays zoom level indicator', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      const zoomLevel = await gamePage.getZoomLevel()
      expect(zoomLevel).toContain('%')
    })

    test('has reset view button', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      await expect(gamePage.resetViewButton).toBeVisible()
      await expect(gamePage.resetViewButton).toContainText('Reset View')
    })

    test('reset view button is functional', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      // Click reset (should work even at default zoom)
      await gamePage.resetView()

      const zoomLevel = await gamePage.getZoomLevel()
      expect(zoomLevel).toContain('100%')
    })
  })

  test.describe('Responsive Layout', () => {
    test('map fills available viewport', async ({ page }) => {
      const gamePage = new GamePage(page)
      await gamePage.goto()

      const containerBox = await gamePage.mapContainer.boundingBox()
      const viewportSize = page.viewportSize()

      expect(containerBox).not.toBeNull()
      if (containerBox && viewportSize) {
        // Map should take significant portion of viewport
        expect(containerBox.width).toBeGreaterThan(viewportSize.width * 0.8)
      }
    })
  })
})
