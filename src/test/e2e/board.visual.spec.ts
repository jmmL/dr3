import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1600, height: 980 } });

test('board-shell visual baseline', async ({ page }) => {
  await page.goto('/');
  const boardViewport = page.getByTestId('board-viewport');
  await expect(boardViewport).toBeVisible();
  await expect(boardViewport).toHaveScreenshot('board-viewport.png', {
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
    maxDiffPixelRatio: 0.03,
  });
});
