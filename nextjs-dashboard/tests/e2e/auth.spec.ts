import { expect, test } from '@playwright/test';

const anonymousState = { cookies: [], origins: [] };

test('anonymous users are redirected before protected pages render', async ({
  browser,
}) => {
  const context = await browser.newContext({ storageState: anonymousState });
  const page = await context.newPage();

  for (const route of [
    '/dashboard',
    '/dashboard/customers',
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(
      new RegExp(`/login\\?callbackUrl=${encodeURIComponent(route)}$`),
    );
    await expect(page.getByRole('heading', { name: 'Please log in to continue.' })).toBeVisible();
  }

  await context.close();
});

test('invalid credentials do not create a session', async ({ browser }) => {
  const context = await browser.newContext({ storageState: anonymousState });
  const page = await context.newPage();

  await page.goto('/login');
  await page.getByLabel('Username').fill('invalid-user');
  await page.getByLabel('Password').fill('invalid-password');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByText('Invalid username or password.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);

  await context.close();
});

test('sign out invalidates the session', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard$/);
});
