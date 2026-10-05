import { expect, test } from '@playwright/test';

const angle = (page) => page.locator('#vortex').getAttribute('data-angle').then(Number);
// WebKit mobile anime lentement en test (~13 images/s) : le retour au repos y dépasse
// les 5 s par défaut.
const SETTLE_TIMEOUT = 15_000;
const waitUntilIdle = (page) =>
  expect(page.locator('#vortex')).toHaveAttribute('data-animating', 'false', {
    timeout: SETTLE_TIMEOUT,
  });

test.describe('tourbillon', () => {
  test('reste immobile tant qu’on ne défile pas', async ({ page }) => {
    await page.goto('/');
    const before = await angle(page);
    await page.waitForTimeout(1000);
    expect(await angle(page)).toBe(before);
    await waitUntilIdle(page);
  });

  test('tourne quand on descend et revient quand on remonte', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect.poll(() => angle(page)).toBeGreaterThan(1);
    await waitUntilIdle(page);

    await page.evaluate(() => window.scrollTo(0, 0));
    // Une fois l'écart imperceptible, l'angle est calé exactement sur la cible.
    await expect.poll(() => angle(page), { timeout: SETTLE_TIMEOUT }).toBe(0);
    await waitUntilIdle(page);
  });

  test('fait tourner les anneaux de la photo avec le scroll', async ({ page }) => {
    await page.goto('/');
    const ring = page.locator('.hero__ring--arcs ellipse').first();
    await expect(ring).toHaveCSS('stroke-dashoffset', '0px');
    await page.evaluate(() => window.scrollTo(0, 600));
    await waitUntilIdle(page);
    await expect(ring).not.toHaveCSS('stroke-dashoffset', '0px');
  });

  test.describe('avec « réduire les animations »', () => {
    test.use({ reducedMotion: 'reduce' });

    test('ne tourne pas, même après un scroll', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(500);
      expect(await angle(page)).toBe(0);
      await expect(page.locator('.hero__ring--arcs ellipse').first()).toHaveCSS(
        'stroke-dashoffset',
        '0px',
      );
    });
  });
});
