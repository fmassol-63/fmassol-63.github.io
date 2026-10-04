import { expect, test } from '@playwright/test';

test('la page charge sans erreur console', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Florian MASSOL/);
  await expect(page.locator('#vortex')).toBeAttached();
  expect(errors).toEqual([]);
});
