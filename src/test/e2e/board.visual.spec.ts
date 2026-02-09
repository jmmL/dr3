import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1600, height: 980 } });

test('board-shell visual baseline', async ({ page }) => {
  await page.goto('/');
  const boardShell = page.getByTestId('board-shell');
  await expect(boardShell).toBeVisible();
  await expect(boardShell).toHaveScreenshot('board-shell.png', {
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
    maxDiffPixelRatio: 0.01,
  });
});
