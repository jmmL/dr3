import { expect, test, type Page } from '@playwright/test';

type RuntimeErrors = {
  consoleErrors: string[];
  pageErrors: string[];
  requestFailures: string[];
};

function trackRuntimeErrors(page: Page): RuntimeErrors {
  const runtimeErrors: RuntimeErrors = {
    consoleErrors: [],
    pageErrors: [],
    requestFailures: [],
  };

  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    runtimeErrors.pageErrors.push(String(error));
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.startsWith('data:') || url.includes('favicon.ico')) return;
    runtimeErrors.requestFailures.push(
      `${url} :: ${request.failure()?.errorText ?? 'requestfailed'}`,
    );
  });

  return runtimeErrors;
}

function assertNoRuntimeErrors(runtimeErrors: RuntimeErrors): void {
  expect(runtimeErrors.consoleErrors, 'Console errors').toEqual([]);
  expect(runtimeErrors.pageErrors, 'Page errors').toEqual([]);
  expect(runtimeErrors.requestFailures, 'Request failures').toEqual([]);
}

test.use({ viewport: { width: 1600, height: 980 } });

test('board loads map image and exposes automation hooks', async ({ page }) => {
  const runtimeErrors = trackRuntimeErrors(page);
  const mapResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/assets/minaria-map-hires.jpg'),
  );

  await page.goto('/');

  const mapResponse = await mapResponsePromise;
  expect(mapResponse.ok()).toBeTruthy();
  expect(mapResponse.status()).toBe(200);

  await expect(page.getByTestId('board-shell')).toBeVisible();
  await expect(page.locator('.board-image')).toHaveCount(1);

  const metrics = await page.evaluate(() => {
    const image = document.querySelector<SVGImageElement>('.board-image');
    if (!image) return null;
    const bbox = image.getBBox();
    const hookWindow = window as Window &
      typeof globalThis & {
        render_game_to_text?: unknown;
        advanceTime?: unknown;
      };
    return {
      href: image.getAttribute('href'),
      width: bbox.width,
      height: bbox.height,
      hookTypes: {
        render_game_to_text: typeof hookWindow.render_game_to_text,
        advanceTime: typeof hookWindow.advanceTime,
      },
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics?.href).toContain('/assets/minaria-map-hires.jpg');
  expect(metrics?.width ?? 0).toBeGreaterThan(1000);
  expect(metrics?.height ?? 0).toBeGreaterThan(1000);
  expect(metrics?.hookTypes.render_game_to_text).toBe('function');
  expect(metrics?.hookTypes.advanceTime).toBe('function');

  assertNoRuntimeErrors(runtimeErrors);
});

test('hex polygons remain regular (no side-length distortion)', async ({ page }) => {
  const runtimeErrors = trackRuntimeErrors(page);
  await page.goto('/');

  const geometry = await page.evaluate(() => {
    const polygons = Array.from(document.querySelectorAll<SVGPolygonElement>('.hex')).slice(0, 72);
    const sideRatios: number[] = [];

    for (const polygon of polygons) {
      const points = polygon
        .getAttribute('points')
        ?.trim()
        .split(/\s+/)
        .map((pair) => pair.split(',').map(Number))
        .filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
      if (!points || points.length !== 6) continue;

      const sideLengths: number[] = [];
      for (let index = 0; index < points.length; index += 1) {
        const from = points[index];
        const to = points[(index + 1) % points.length];
        if (!from || !to) continue;
        const fromX = from[0];
        const fromY = from[1];
        const toX = to[0];
        const toY = to[1];
        if (
          fromX === undefined ||
          fromY === undefined ||
          toX === undefined ||
          toY === undefined
        ) {
          continue;
        }
        const dx = toX - fromX;
        const dy = toY - fromY;
        sideLengths.push(Math.hypot(dx, dy));
      }
      if (sideLengths.length !== 6) continue;
      const min = Math.min(...sideLengths);
      const max = Math.max(...sideLengths);
      sideRatios.push(max / min);
    }

    return {
      sampledHexes: sideRatios.length,
      worstRatio: sideRatios.length > 0 ? Math.max(...sideRatios) : Number.POSITIVE_INFINITY,
    };
  });

  expect(geometry.sampledHexes).toBeGreaterThan(20);
  expect(
    geometry.worstRatio,
    'Regular hexes should have near-equal side lengths. Ratio max/min must stay close to 1.',
  ).toBeLessThan(1.03);

  assertNoRuntimeErrors(runtimeErrors);
});

test('board supports zoom, pan, and unit selection interactions', async ({ page }) => {
  const runtimeErrors = trackRuntimeErrors(page);
  await page.goto('/');

  const viewport = page.getByTestId('board-viewport');
  const boardSvg = page.getByTestId('board-svg');
  const zoomLabel = page.getByTestId('board-zoom');
  const initialZoomText = await zoomLabel.textContent();

  await page.locator('.board-svg .unit-stack').first().click();
  await expect(page.locator('.unit-stack.is-selected')).toHaveCount(1);
  await expect(page.locator('.selection')).toBeVisible();

  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    throw new Error('Expected board viewport bounding box to exist');
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.wheel(0, -600);
  await expect(zoomLabel).not.toHaveText(initialZoomText ?? 'Zoom 100%');

  const transformBeforePan = await boardSvg.evaluate(
    (element) => element.getAttribute('style') ?? '',
  );
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 120, centerY + 80, { steps: 6 });
  await page.mouse.up();
  const transformAfterPan = await boardSvg.evaluate((element) => element.getAttribute('style') ?? '');
  expect(transformAfterPan).not.toEqual(transformBeforePan);

  assertNoRuntimeErrors(runtimeErrors);
});
