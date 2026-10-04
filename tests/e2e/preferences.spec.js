import { expect, test } from '@playwright/test';

test.describe('thème clair / sombre', () => {
  test.use({ colorScheme: 'dark' });

  test('bascule le thème et le mémorise', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const bodyBackground = () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const darkBackground = await bodyBackground();

    await page.locator('[data-action="theme"]').click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(await bodyBackground()).not.toBe(darkBackground);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('suit la préférence du système au premier passage', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await context.close();
  });
});

test.describe('version anglaise', () => {
  test.use({ locale: 'fr-FR' });

  test('traduit la page et mémorise le choix', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#competences-title')).toHaveText('Compétences');

    await page.locator('[data-action="lang"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#competences-title')).toHaveText('Skills');
    await expect(page).toHaveTitle(/Systems and Network Administrator/);
    await expect(page.locator('#contact')).toHaveClass(/is-visible/);

    await page.reload();
    await expect(page.locator('#competences-title')).toHaveText('Skills');
  });

  test('s’affiche en anglais pour un navigateur anglophone', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('#parcours-title')).toHaveText('Professional experience');
    await context.close();
  });
});
