import { test, expect } from '@playwright/test'

test.describe('Divine Right App', () => {
  test('renders the hex grid map', async ({ page }) => {
    await page.goto('/')

    // Check header is visible
    await expect(page.locator('h1')).toContainText('Divine Right')

    // Check the hex grid container exists
    await expect(page.locator('.hex-grid-container')).toBeVisible()

    // Check SVG hex grid is rendered
    const hexGrid = page.locator('.hex-grid')
    await expect(hexGrid).toBeVisible()

    // Wait for hexes to render (should have many hex polygons)
    const hexes = page.locator('.hex-polygon')
    await expect(hexes.first()).toBeVisible()

    // Verify we have a substantial number of hexes (should be ~1070)
    const hexCount = await hexes.count()
    expect(hexCount).toBeGreaterThan(100)

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'e2e/screenshots/hex-grid.png', fullPage: true })
  })

  test('shows turn and phase information', async ({ page }) => {
    await page.goto('/')

    // Check turn info is displayed
    await expect(page.locator('.turn-info')).toContainText('Turn 1')
    await expect(page.locator('.turn-info')).toContainText('setup')
  })

  test('can select a hex by clicking', async ({ page }) => {
    await page.goto('/')

    // Wait for grid to render
    await expect(page.locator('.hex-grid')).toBeVisible()

    // Click on a hex (get the first hex group)
    const hex = page.locator('.hex').first()
    await hex.click()

    // Check footer shows hex info
    await expect(page.locator('.footer')).not.toContainText('Tap a hex to select')
  })

  test('displays units on the map', async ({ page }) => {
    await page.goto('/')

    // Wait for grid to render
    await expect(page.locator('.hex-grid')).toBeVisible()

    // Check that unit markers exist (we should have units from Hothior and Mivior)
    const unitMarkers = page.locator('.unit-markers')
    const markerCount = await unitMarkers.count()
    expect(markerCount).toBeGreaterThan(0)
  })

  test('can zoom and pan the map', async ({ page }) => {
    await page.goto('/')

    // Wait for grid to render
    await expect(page.locator('.hex-grid')).toBeVisible()

    // Check reset view button exists
    await expect(page.locator('.reset-view-btn')).toBeVisible()

    // Check zoom level display
    await expect(page.locator('.zoom-level')).toContainText('%')
  })

  test('screenshot: full app with units visible', async ({ page }) => {
    await page.goto('/')

    // Wait for everything to render
    await expect(page.locator('.hex-grid')).toBeVisible()
    await expect(page.locator('.hex-polygon').first()).toBeVisible()

    // Give a moment for all hexes to render
    await page.waitForTimeout(500)

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/divine-right-full.png',
      fullPage: true
    })

    // Take viewport screenshot
    await page.screenshot({
      path: 'e2e/screenshots/divine-right-viewport.png',
    })
  })
})
