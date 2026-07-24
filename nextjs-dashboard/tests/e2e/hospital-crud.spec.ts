import { expect, test } from '@playwright/test';

test('hospital create, view, edit, and delete workflow', async ({ page }, testInfo) => {
  const name = `Atomic QA ${testInfo.project.name}`;
  await page.goto('/support?pageSize=10');
  await page.getByRole('button', { name: 'Add hospital' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Hospital name').fill(name);
  for (const [index, option] of [[0, 'General'], [1, 'Private']] as const) {
    await dialog.locator('.ant-select').nth(index).click();
    await page.locator('.ant-select-item-option').filter({ hasText: option }).click();
  }
  await dialog.getByLabel('Bed capacity').fill('42');
  await dialog.getByLabel('Street address').fill('123 QA Road');
  await dialog.getByRole('textbox', { name: 'City', exact: true }).fill('Bangkok');
  await dialog.getByRole('textbox', { name: 'State / province', exact: true }).fill('Bangkok');
  await dialog.getByRole('textbox', { name: 'Postal code', exact: true }).fill('10110');
  await dialog.getByRole('button', { name: 'Create hospital' }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: `${name} Bangkok, Thailand` }).click();
  await expect(page.getByText('Hospital profile', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Bed capacity').fill('43');
  await page.getByRole('dialog').getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Hospital updated successfully.')).toBeVisible();
  await page.getByRole('button', { name: `Actions for ${name}` }).click();
  await page.getByText('Delete', { exact: true }).last().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});
