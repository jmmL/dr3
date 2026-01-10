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

  console.log('Page loaded, taking screenshot...');

  // Take a screenshot
  await page.screenshot({
    path: 'dr3-screenshot.png',
    fullPage: true
  });

  console.log('Screenshot saved to dr3-screenshot.png');

  await browser.close();
})();
