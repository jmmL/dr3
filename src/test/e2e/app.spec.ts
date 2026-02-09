import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('starts game and shows initial stage', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Divine Right 3' })).toBeVisible();
  await expect(page.getByTestId('stage-value')).toHaveText('rollEvents');
});

test('progresses through a basic turn flow', async ({ page }) => {
  await page.getByTestId('btn-roll-event').click();
  await expect(page.getByTestId('stage-value')).toHaveText('drawCard');

  await page.getByTestId('btn-draw-card').click();
  await expect(page.getByTestId('stage-value')).toHaveText('diplomacy');

  await page.getByTestId('btn-diplomacy').click();
  await expect(page.getByTestId('stage-value')).toHaveText('siegeResolution');

  await page.getByTestId('btn-resolve-sieges').click();
  await expect(page.getByTestId('stage-value')).toHaveText('movement');

  await page.getByTestId('btn-to-combat').click();
  await expect(page.getByTestId('stage-value')).toHaveText('combat');
});

test('saves and loads from slot-a', async ({ page }) => {
  await page.getByTestId('btn-save').click();
  await expect(page.getByTestId('status-text')).toContainText('Saved');

  await page.getByTestId('btn-load').click();
  await expect(page.getByTestId('status-text')).toContainText('Loaded');
});

test('runs cpu action sequence', async ({ page }) => {
  await page.getByTestId('btn-run-cpu').click();
  await expect(page.getByTestId('status-text')).toContainText('CPU executed');
});
