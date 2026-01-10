import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Divine Right e2e tests
 *
 * Key features:
 * - Multi-browser testing (Chrome, Safari/WebKit)
 * - Mobile viewport testing for iOS Safari
 * - Visual comparison for regression testing
 * - Screenshot capture on failure
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    baseURL: 'http://localhost:4173/dr3/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  // Expect settings for visual comparisons
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05, // Allow 5% pixel difference for anti-aliasing
    },
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports (iOS Safari is primary mobile target)
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-safari-landscape',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 844, height: 390 },
      },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/dr3/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
