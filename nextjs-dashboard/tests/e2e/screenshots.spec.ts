import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from '@playwright/test';

test('capture localized responsive reference screenshots', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'One deterministic browser captures reference artifacts.');
  const output = join(process.cwd(), 'docs', 'evidence', 'screenshots');
  await mkdir(output, { recursive: true });
  for (const locale of ['en', 'th'] as const) {
    await page.context().addCookies([{ name: 'acme_locale', value: locale, domain: '127.0.0.1', path: '/' }]);
    for (const viewport of [{ name: 'mobile', width: 390 }, { name: 'tablet', width: 768 }, { name: 'desktop', width: 1280 }]) {
      await page.setViewportSize({ width: viewport.width, height: 900 });
      await page.goto('/support');
      await page.screenshot({ path: join(output, `support-${locale}-${viewport.name}.png`), fullPage: true });
    }
  }
});
