import { expect, test } from '@playwright/test';

test.use({ locale: 'fr-FR' });

const sections = ['profil', 'competences', 'parcours', 'missions', 'formation', 'contact'];

test('chaque lien de navigation mène à sa section, sous l’en-tête', async ({ page, isMobile }) => {
  await page.goto('/');
  for (const id of sections) {
    if (isMobile) await page.locator('[data-action="menu"]').click();
    await page.locator(`.header__link[href="#${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect
      .poll(() =>
        page.locator(`#${id}`).evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBeGreaterThanOrEqual(60);
    await expect(page.locator(`#${id}-title`)).toBeInViewport();
  }
});

test('aucun défilement horizontal', async ({ page }) => {
  for (const width of [360, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow, `largeur ${width}px`).toBe(false);
  }
});

test.describe('menu mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('s’ouvre, se ferme avec Échap et indique son état', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-action="menu"]');
    const nav = page.locator('#site-nav');

    await expect(nav).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();
    await expect(button).toBeFocused();
  });
});
