import { expect, test } from '@playwright/test';

test('homepage shows the app header', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Divine Right III')).toBeVisible();
  await expect(page.getByText('Mobile-first tactical campaign')).toBeVisible();
});
