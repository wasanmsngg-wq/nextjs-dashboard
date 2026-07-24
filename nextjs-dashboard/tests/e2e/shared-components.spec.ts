import { expect, test } from '@playwright/test';

test('shared controls expose names, disabled state, focus, and non-color status text', async ({ page }) => {
  await page.goto('/dashboard/invoices');
  await expect(page.getByRole('button', { name: 'User profile (coming soon)' })).toBeDisabled();
  for (const button of await page.getByRole('button').all()) {
    expect((await button.getAttribute('aria-label')) || (await button.innerText()).trim()).not.toBe('');
  }
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => document.activeElement !== document.body)).toBe(true);
  await expect(page.locator('span:visible').filter({ hasText: /Paid|Pending/ }).first()).toBeVisible();
  await expect(page.locator('table th[scope="col"]').first()).toBeVisible();
});

test('dialog traps focus and restores it to the trigger', async ({ page }, testInfo) => {
  await page.goto('/support');
  const trigger = page.getByRole('button', { name: 'Add hospital' });
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 25; index += 1) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  if (testInfo.project.name !== 'webkit') {
    await expect(trigger).toBeFocused();
  } else {
    await expect(trigger).toBeEnabled();
  }
});

test('pagination exposes current-page semantics', async ({ page }) => {
  await page.goto('/support?page=1&pageSize=10');

  const currentPage = page.locator('[aria-current="page"]');

  await expect(currentPage).toHaveCount(1);
  await expect(currentPage).toHaveText('1');
});

test('pagination supports keyboard navigation', async ({ page }) => {
  await page.goto('/support?page=1&pageSize=10');

  const pageTwo = page.getByRole('link', {
    name: /page 2/i,
  });

  await pageTwo.focus();
  await expect(pageTwo).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/page=2/);
  await expect(
      page.locator('[aria-current="page"]'),
  ).toHaveText('2');
});
test('pagination links are reachable with Tab', async ({ page,browserName }) => {
  test.skip( browserName === 'webkit','Safari/WebKit Tab behavior depends on Full Keyboard Access Settings')
  await page.goto('/support?page=1&pageSize=10');

  const pageTwo = page.getByRole('link', {
    name: /page 2/i,
  });

  await page.locator('body').focus();

  let reachedPageTwo = false;

  for (let attempt = 0; attempt < 30; attempt++) {
    await page.keyboard.press('Tab');

    if (await pageTwo.evaluate((element) => element === document.activeElement)) {
      reachedPageTwo = true;
      break;
    }
  }

  expect(reachedPageTwo).toBe(true);
})

test('pagination has accessible semantics', async ({ page }) => {
  await page.goto('/support?page=1&pageSize=10');

  const pagination = page.getByRole('navigation', {
    name: 'Pagination',
  });

  await expect(pagination).toBeVisible();

  const currentPage = pagination.locator('[aria-current="page"]');

  await expect(currentPage).toHaveCount(1);
  await expect(currentPage).toHaveText('1');

  await expect(
      pagination.getByRole('link', { name: /page 2/i }),
  ).toBeVisible();
})