import { expect, test } from '@playwright/test';

test('la page charge sans erreur console', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Florian MASSOL/);
  await expect(page.locator('#vortex')).toBeAttached();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  expect(errors).toEqual([]);
});

test('le CV PDF est téléchargeable', async ({ page, request }) => {
  await page.goto('/');
  const link = page.locator('.hero a[download]');
  const href = await link.getAttribute('href');

  const response = await request.get(href);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('la photo de profil se charge', async ({ page }) => {
  await page.goto('/');
  const loaded = await page
    .locator('.hero__photo')
    .evaluate((img) => img.decode().then(() => img.naturalWidth > 0));
  expect(loaded).toBe(true);
});

test('robots.txt est servi', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('User-agent');
});
