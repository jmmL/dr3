import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--disable-web-security',
      '--single-process'
    ]
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log('Navigating to http://localhost:4173/dr3/ ...');

  // Navigate to the DR3 app
  await page.goto('http://localhost:4173/dr3/', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Page loaded, searching for Muscaster hex...');

  // Muscaster is at coordinates (15, 8)
  // Find and click the hex with data-hex="15,8"
  const hexSelector = '[data-hex="15,8"]';

  // Wait for the hex grid to be rendered
  await page.waitForSelector('[data-hex]', { timeout: 10000 });

  // Click on the Muscaster hex
  const muscasterHex = await page.$(hexSelector);
  if (muscasterHex) {
    console.log('Found Muscaster hex at (15,8), clicking...');
    await muscasterHex.click();

    // Wait a moment for the selection to update
    await page.waitForTimeout(500);

    console.log('Muscaster selected, taking screenshot...');
  } else {
    console.log('Warning: Could not find Muscaster hex, taking screenshot anyway...');
  }

  // Take a screenshot
  await page.screenshot({
    path: 'dr3-screenshot-muscaster.png',
    fullPage: true
  });

  console.log('Screenshot saved to dr3-screenshot-muscaster.png');

  await browser.close();
})();
