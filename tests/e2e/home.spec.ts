import { test, expect } from '@playwright/test';

test('has title and initial status', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page.getByRole('heading', { name: 'Divine Right' })).toBeVisible();

  // Expect status to be "Welcome to Divine Right"
  await expect(page.getByText('Status: Welcome to Divine Right')).toBeVisible();

  // Expect map placeholder
  await expect(page.getByText('[Map Placeholder]')).toBeVisible();
});
