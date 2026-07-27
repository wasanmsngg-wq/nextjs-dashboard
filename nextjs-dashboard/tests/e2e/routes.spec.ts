import { expect, test } from '@playwright/test';

const routes = ['/', '/dashboard', '/dashboard/customers'];
const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
];

test('remaining routes have one h1 and no document overflow', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
    }
  }
});

test('customer search updates the URL', async ({ page }) => {
  await page.goto('/dashboard/customers');
  const search = page.getByRole('searchbox', { name: 'Search' });
  await expect
    .poll(() =>
      search.evaluate((input) =>
        Object.keys(input).some((key) => key.startsWith('__reactProps')),
      ),
    )
    .toBe(true);
  await search.fill('alice');
  await expect(page).toHaveURL(/query=alice/);
});

test('removed routes and seed endpoint return 404', async ({ request }) => {
  for (const route of ['/dashboard/invoices', '/support', '/query', '/seed']) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
});
