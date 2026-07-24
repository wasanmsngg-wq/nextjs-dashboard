import {expect, test} from '@playwright/test';

const routes = ['/', '/dashboard', '/dashboard/invoices', '/dashboard/customers', '/support'];
const viewports = [{ width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1280, height: 900 }];

test('all routes have one h1 and no document overflow at supported widths', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), { message: `document overflow at ${route} (${viewport.width}px)` }).toBe(true);
    }
  }
});

test('locale persists and navigation supports keyboard dismissal', async ({ page, context }) => {
  await page.goto('/dashboard');
  await page.getByLabel('Language').selectOption('th');
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await page.reload();
  await expect(page.locator('h1')).toContainText('แดชบอร์ด');
  expect((await context.cookies()).find((cookie) => cookie.name === 'acme_locale')?.value).toBe('th');
  await page.getByRole('button', { name: /เปิดเมนูนำทาง/ }).click();
  await expect(page.locator('#application-sidebar')).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('Escape');
  await expect(page.locator('#application-sidebar')).toHaveAttribute('aria-hidden', 'true');
});

test('URL controls preserve contracts', async ({ page }) => {
  await page.goto('/dashboard/invoices?page=2');
  await page.getByPlaceholder('Search invoices...').fill('alice');
  await expect(page).toHaveURL(/page=1&query=alice/);
  await page.goto('/support?query=bangkok&page=3&pageSize=10');
  await page.getByLabel('Rows per page').selectOption('25');
  await expect(page).toHaveURL(/query=bangkok&page=1&pageSize=25/);
  await page.goto('/support?page=1&pageSize=25');
  await page.getByRole('link', { name: 'Page 2' }).click();
  await expect(page).toHaveURL(/page=2&pageSize=25/);
});

test('invalid pagination URLs are canonicalized', async ({page}) => {
  await page.goto('/dashboard/invoices?query=alice&page=-1');
  await expect(page).toHaveURL(
      /\/dashboard\/invoices\?query=alice&page=1$/,
  );
  await expect(page.getByText(/server error/i)).toHaveCount(0);

  await page.goto('/support?query=bangkok&page=-1&pageSize=999');
  await expect(page).toHaveURL(
      /\/support\?query=bangkok&page=1&pageSize=10$/,
  );
  await expect(page.getByLabel('Rows per page')).toHaveValue('10');
});

test('seed endpoint should not exist', async ({
    request}) => {
    const response = await request.get('/seed');

    console.log({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body: await response.text(),
    });
    expect(response.status()).toBe(404);
})
