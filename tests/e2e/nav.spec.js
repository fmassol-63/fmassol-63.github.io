import { expect, test } from '@playwright/test';

test.use({ locale: 'fr-FR' });

const sections = [
  'profil',
  'competences',
  'parcours',
  'missions',
  'formation',
  'diplomes',
  'contact',
];

/** Position haute de la carte une fois le défilement et l'animation terminés. */
async function settledCardTop(page, id) {
  const read = () =>
    page.locator(`#${id} .card`).evaluate((el) => Math.round(el.getBoundingClientRect().top));
  let previous = null;
  await expect
    .poll(
      async () => {
        const current = await read();
        const stable = current === previous;
        previous = current;
        return stable;
      },
      { intervals: [250] },
    )
    .toBe(true);
  return previous;
}

test('chaque lien de navigation mène à sa carte, entièrement sous l’en-tête', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const headerBottom = await page
    .locator('#header')
    .evaluate((el) => Math.round(el.getBoundingClientRect().bottom));

  for (const id of sections) {
    if (isMobile) await page.locator('[data-action="menu"]').click();
    await page.locator(`.header__link[href="#${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toHaveClass(/is-visible/);
    expect(await settledCardTop(page, id), `carte #${id}`).toBeGreaterThanOrEqual(headerBottom);
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

  for (const action of ['theme', 'lang']) {
    test(`reste cohérent après la bascule « ${action} » menu ouvert`, async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-action="menu"]').click();
      await page.locator(`[data-action="${action}"]`).click();

      await expect(page.locator('[data-action="menu"]')).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#site-nav')).toBeHidden();

      await page.locator('[data-action="menu"]').click();
      await expect(page.locator('#site-nav')).toBeVisible();
    });
  }
});
