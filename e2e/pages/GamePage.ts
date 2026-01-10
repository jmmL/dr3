import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model for the Divine Right game interface.
 *
 * This abstraction layer:
 * - Encapsulates UI element selectors in one place
 * - Provides high-level actions that map to user behaviors
 * - Makes tests more readable and maintainable
 * - Isolates tests from UI implementation changes
 *
 * When adding new features:
 * 1. Add locators for new UI elements
 * 2. Add action methods for user interactions
 * 3. Add assertion helpers for common checks
 */
export class GamePage {
  readonly page: Page

  // === LAYOUT ELEMENTS ===
  readonly header: Locator
  readonly main: Locator
  readonly footer: Locator
  readonly title: Locator
  readonly turnInfo: Locator

  // === MAP ELEMENTS ===
  readonly mapContainer: Locator
  readonly hexGrid: Locator
  readonly mapImage: Locator
  readonly hexPolygons: Locator
  readonly hexGroups: Locator

  // === UNIT ELEMENTS ===
  readonly unitMarkers: Locator

  // === CONTROLS ===
  readonly resetViewButton: Locator
  readonly zoomLevel: Locator

  // === SELECTION STATE ===
  readonly hexInfo: Locator
  readonly selectedHex: Locator

  constructor(page: Page) {
    this.page = page

    // Layout
    this.header = page.locator('.header')
    this.main = page.locator('.main')
    this.footer = page.locator('.footer')
    this.title = page.locator('h1')
    this.turnInfo = page.locator('.turn-info')

    // Map
    this.mapContainer = page.locator('.hex-grid-container')
    this.hexGrid = page.locator('.hex-grid')
    this.mapImage = page.locator('.hex-grid image')
    this.hexPolygons = page.locator('.hex-polygon')
    this.hexGroups = page.locator('.hex')

    // Units
    this.unitMarkers = page.locator('.unit-markers')

    // Controls
    this.resetViewButton = page.locator('.reset-view-btn')
    this.zoomLevel = page.locator('.zoom-level')

    // Selection
    this.hexInfo = page.locator('.hex-info')
    this.selectedHex = page.locator('.hex-selected')
  }

  // === NAVIGATION ===

  async goto() {
    await this.page.goto('/')
    await this.waitForMapToLoad()
  }

  async waitForMapToLoad() {
    await expect(this.hexGrid).toBeVisible()
    await expect(this.hexPolygons.first()).toBeVisible()
    // Give SVG time to fully render
    await this.page.waitForTimeout(300)
  }

  // === MAP INTERACTIONS ===

  async clickHex(index: number = 0) {
    const hex = this.hexGroups.nth(index)
    await hex.click()
  }

  async clickHexAt(col: number, row: number) {
    const hex = this.page.locator(`[data-hex="${col},${row}"]`)
    await hex.click()
  }

  async getSelectedHexInfo(): Promise<string> {
    return await this.hexInfo.textContent() ?? ''
  }

  async isHexSelected(): Promise<boolean> {
    return await this.selectedHex.count() > 0
  }

  async resetView() {
    await this.resetViewButton.click()
  }

  async getZoomLevel(): Promise<string> {
    return await this.zoomLevel.textContent() ?? ''
  }

  // === GAME STATE QUERIES ===

  async getTurnNumber(): Promise<number> {
    const text = await this.turnInfo.textContent() ?? ''
    const match = text.match(/Turn (\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  async getPhase(): Promise<string> {
    const text = await this.turnInfo.textContent() ?? ''
    const match = text.match(/- (\w+)/)
    return match ? match[1] : ''
  }

  async getHexCount(): Promise<number> {
    return await this.hexPolygons.count()
  }

  async getUnitMarkerCount(): Promise<number> {
    return await this.unitMarkers.count()
  }

  // === MAP MODE CHECKS ===

  async isMapImageMode(): Promise<boolean> {
    return await this.mapImage.count() > 0
  }

  async hasOverlayHexes(): Promise<boolean> {
    const overlayHexes = this.page.locator('.hex-overlay')
    return await overlayHexes.count() > 0
  }

  // === VISUAL TESTING HELPERS ===

  async takeMapScreenshot(name: string) {
    await this.waitForMapToLoad()
    await this.mapContainer.screenshot({ path: `e2e/screenshots/${name}.png` })
  }

  async takeFullScreenshot(name: string) {
    await this.waitForMapToLoad()
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
  }
}
