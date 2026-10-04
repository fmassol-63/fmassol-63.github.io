import { expect, test } from '@playwright/test';

const angle = (page) => page.locator('#vortex').getAttribute('data-angle').then(Number);
const waitUntilIdle = (page) =>
  expect(page.locator('#vortex')).toHaveAttribute('data-animating', 'false');

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
    await expect.poll(() => angle(page)).toBeCloseTo(0, 2);
    await waitUntilIdle(page);
  });

  test.describe('avec « réduire les animations »', () => {
    test.use({ reducedMotion: 'reduce' });

    test('ne tourne pas, même après un scroll', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(500);
      expect(await angle(page)).toBe(0);
    });
  });
});
