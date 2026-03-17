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
  await page.getByTestId('btn-to-combat').click();
  await expect(page.getByTestId('stage-value')).toHaveText('combat');
});

test('movement phase exposes legal destinations and allows moving a selected unit', async ({
  page,
}) => {
  await page.getByTestId('btn-roll-event').click();
  await page.getByTestId('btn-draw-card').click();
  await page.getByTestId('btn-diplomacy').click();
  await page.getByTestId('btn-resolve-sieges').click();
  await expect(page.getByTestId('stage-value')).toHaveText('movement');

  const unitStacks = page.locator('.board-svg .unit-stack');
  const unitCount = await unitStacks.count();
  let moved = false;

  for (let index = 0; index < unitCount; index += 1) {
    await unitStacks.nth(index).click();
    const legalDestinations = page.locator(".hex[data-legal-destination='true']");
    const legalCount = await legalDestinations.count();
    if (legalCount < 1) continue;

    await legalDestinations.first().click();
    await expect(page.getByTestId('status-text')).toContainText('Moved');
    moved = true;
    break;
  }

  expect(moved).toBeTruthy();
});

test('saves and loads from slot-a', async ({ page }) => {
  await page.getByTestId('btn-save').click();
  await expect(page.getByTestId('status-text')).toContainText('Saved');

  await page.getByTestId('btn-load').click();
  await expect(page.getByTestId('status-text')).toContainText('Loaded');
});

test('load restores movement stage flow even after advancing to combat', async ({ page }) => {
  await page.getByTestId('btn-roll-event').click();
  await page.getByTestId('btn-draw-card').click();
  await page.getByTestId('btn-diplomacy').click();
  await page.getByTestId('btn-resolve-sieges').click();
  await expect(page.getByTestId('stage-value')).toHaveText('movement');

  await page.getByTestId('btn-save').click();
  await page.getByTestId('btn-to-combat').click();
  await page.getByTestId('btn-to-combat').click();
  await expect(page.getByTestId('stage-value')).toHaveText('combat');

  await page.getByTestId('btn-load').click();
  await expect(page.getByTestId('stage-value')).toHaveText('movement');

  await page.getByTestId('btn-to-combat').click();
  await page.getByTestId('btn-to-combat').click();
  await expect(page.getByTestId('stage-value')).toHaveText('combat');
});

test('to combat requires explicit confirmation when legal moves remain', async ({ page }) => {
  await page.getByTestId('btn-roll-event').click();
  await page.getByTestId('btn-draw-card').click();
  await page.getByTestId('btn-diplomacy').click();
  await page.getByTestId('btn-resolve-sieges').click();

  await expect(page.getByTestId('stage-value')).toHaveText('movement');
  await page.getByTestId('btn-to-combat').click();
  await expect(page.getByTestId('status-text')).toContainText('Legal moves remain');
  await expect(page.getByTestId('stage-value')).toHaveText('movement');
  await page.getByTestId('btn-to-combat').click();
  await expect(page.getByTestId('stage-value')).toHaveText('combat');
});

test('runs cpu action sequence', async ({ page }) => {
  await page.getByTestId('btn-run-cpu').click();
  await expect(page.getByTestId('status-text')).toContainText('CPU executed');
});

test('trusted slice supports combat declaration and resolution through the UI', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('btn-roll-event').click();
  await page.getByTestId('btn-draw-card').click();
  await page.getByTestId('btn-diplomacy').click();
  await page.getByTestId('btn-resolve-sieges').click();
  await page.getByTestId('btn-to-combat').click();
  await page.getByTestId('btn-to-combat').click();
  await expect(page.getByTestId('stage-value')).toHaveText('combat');

  const seeded = await page.evaluate(async () => {
    const hookWindow = window as Window &
      typeof globalThis & {
        seedCombatSkirmish?: () => Promise<boolean>;
      };
    return hookWindow.seedCombatSkirmish ? hookWindow.seedCombatSkirmish() : false;
  });
  expect(seeded).toBeTruthy();

  const attackerHex = page.locator('.hex.is-combat-attacker').first();
  await expect(attackerHex).toBeVisible();
  const combatTargets = page.locator(".hex[data-combat-target='true']");
  await expect(combatTargets.first()).toBeVisible();

  const firstCombatTarget = await page.evaluate(() => {
    const hookWindow = window as Window &
      typeof globalThis & {
        render_game_to_text?: () => string;
      };
    if (!hookWindow.render_game_to_text) return null;
    const state = JSON.parse(hookWindow.render_game_to_text()) as {
      combatTargets?: string[];
    };
    return state.combatTargets?.[0] ?? null;
  });
  expect(firstCombatTarget).toBeTruthy();
  await page.locator(`.unit-stack[data-hex-key="${firstCombatTarget}"]`).click();
  await expect(page.getByTestId('status-text')).toContainText('Combat declared');

  await page.getByTestId('btn-resolve-combat').click();
  await expect(page.getByTestId('status-text')).not.toContainText('Combat declared');
});
