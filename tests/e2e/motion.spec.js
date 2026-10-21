import { expect, test } from '@playwright/test';

test.describe('animations', () => {
  test('les cartes apparaissent quand on les atteint', async ({ page }) => {
    await page.goto('/');
    const contact = page.locator('#contact');
    await expect(contact).not.toHaveClass(/is-visible/);
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toHaveClass(/is-visible/);
    await expect(contact.locator('.card')).toHaveCSS('opacity', '1');
  });

  test('les compteurs finissent sur la bonne valeur', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chiffres').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-count="1000"]')).toHaveText('1000', { timeout: 5000 });
  });

  test.describe('avec « réduire les animations »', () => {
    test.use({ reducedMotion: 'reduce' });

    test('tout est visible tout de suite', async ({ page }) => {
      await page.goto('/');
      // État lu une seule fois, sans attendre : une animation qui finirait plus tard doit échouer.
      const state = await page.evaluate(() => ({
        motionReady: document.documentElement.classList.contains('motion-ready'),
        counter: document.querySelector('[data-count="500"]').textContent,
      }));
      expect(state.motionReady).toBe(false);
      expect(state.counter).toBe('500');
    });
  });
});
