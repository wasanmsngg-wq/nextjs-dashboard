import { expect, chromium, type FullConfig } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const authStatePath = resolve('test-results/.auth/admin.json');

export default async function globalSetup(config: FullConfig) {
  const username = process.env.AUTH_TEST_USERNAME;
  const password = process.env.AUTH_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'AUTH_TEST_USERNAME and AUTH_TEST_PASSWORD are required for E2E tests.',
    );
  }

  const baseURL = config.projects[0]?.use.baseURL;
  if (typeof baseURL !== 'string') {
    throw new Error('A Playwright baseURL is required for authentication setup.');
  }

  await mkdir(dirname(authStatePath), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.context().storageState({ path: authStatePath });

  await browser.close();
}
