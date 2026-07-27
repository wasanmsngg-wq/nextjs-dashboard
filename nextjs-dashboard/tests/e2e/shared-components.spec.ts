import { expect, test } from '@playwright/test';

test('navigation is keyboard accessible and marks the current page', async ({
  page,
}) => {
  await page.goto('/dashboard/customers');
  await page.getByRole('button', { name: 'Open navigation' }).click();

  const customersLink = page.getByRole('link', { name: 'Customers' });
  await expect(customersLink).toBeVisible();
  await customersLink.focus();
  await expect(customersLink).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('#application-sidebar')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

test('customer search has an associated accessible label', async ({ page }) => {
  await page.goto('/dashboard/customers');
  const input = page.getByRole('searchbox', { name: 'Search' });
  const inputId = await input.getAttribute('id');

  expect(inputId).toBeTruthy();
  await expect(page.locator(`label[for="${inputId}"]`)).toHaveText('Search');
});
