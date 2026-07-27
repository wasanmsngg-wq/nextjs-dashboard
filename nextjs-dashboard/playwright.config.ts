import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

for (const line of readFileSync(
  resolve(process.cwd(), '.env.auth.local'),
  'utf8',
).split(/\r?\n/)) {
  const separator = line.indexOf('=');
  if (separator <= 0 || line.trimStart().startsWith('#')) continue;
  const key = line.slice(0, separator).trim();
  if (process.env[key] === undefined) {
    process.env[key] = line.slice(separator + 1).trim();
  }
}

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global.setup.ts',
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://127.0.0.1:3002',
    storageState: 'test-results/.auth/admin.json',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run start:load-test -- -p 3002',
    url: 'http://127.0.0.1:3002',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
