import { expect, test } from '@playwright/test';

test.describe('animations', () => {
  test('les cartes apparaissent quand on les atteint', async ({ page }) => {
    await page.goto('/');
    const contact = page.locator('#contact');
    await expect(contact).not.toHaveClass(/is-visible/);
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toHaveClass(/is-visible/);
    await expect(contact).toHaveCSS('opacity', '1');
  });

  test('les compteurs finissent sur la bonne valeur', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chiffres').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-count="1000"]')).toHaveText('1000', { timeout: 5000 });
  });

  test('le terminal finit de taper toutes les commandes', async ({ page }) => {
    await page.goto('/');
    const terminal = page.locator('[data-terminal]');
    await expect(terminal).toHaveClass(/is-done/, { timeout: 15000 });
    await expect(terminal.locator('.terminal__cmd').first()).toHaveText('whoami');
  });

  test.describe('avec « réduire les animations »', () => {
    test.use({ reducedMotion: 'reduce' });

    test('tout est visible tout de suite', async ({ page }) => {
      await page.goto('/');
      // État lu une seule fois, sans attendre : une animation qui finirait plus tard doit échouer.
      const state = await page.evaluate(() => ({
        motionReady: document.documentElement.classList.contains('motion-ready'),
        terminalClasses: document.querySelector('[data-terminal]').className,
        lastCommand: [...document.querySelectorAll('.terminal__cmd')].at(-1).textContent,
        counter: document.querySelector('[data-count="500"]').textContent,
      }));
      expect(state.motionReady).toBe(false);
      expect(state.terminalClasses).toContain('is-done');
      expect(state.terminalClasses).not.toContain('is-typing');
      expect(state.lastCommand).toBe('ls ~/competences');
      expect(state.counter).toBe('500');
    });
  });
});
