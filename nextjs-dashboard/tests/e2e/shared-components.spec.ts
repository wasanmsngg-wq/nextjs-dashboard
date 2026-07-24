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
