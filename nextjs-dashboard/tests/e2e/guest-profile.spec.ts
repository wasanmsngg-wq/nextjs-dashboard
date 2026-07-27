import { expect, test } from "@playwright/test";

const storageKey = "exercise-tracker:guest:v1";

test("new profiles use the saved locale, browser timezone, and metric units", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "acme_locale",
      value: "th",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.addInitScript(() => {
    const resolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function () {
      return { ...resolvedOptions.call(this), timeZone: "Asia/Bangkok" };
    };
  });
  await page.goto("/settings/profile");
  await expect(page.getByLabel(/Language|ภาษา/)).toHaveValue("th");
  await expect(page.getByLabel(/Timezone|เขตเวลา/)).toHaveValue("Asia/Bangkok");
  await expect(page.getByLabel(/Units|หน่วย/)).toHaveValue("metric");
});

test("guest profile persists in the versioned browser envelope", async ({
  page,
}) => {
  await page.goto("/settings/profile");
  await expect(page.getByText(/not backed up/i)).toBeVisible();
  await page.getByLabel("Display name").fill("QA Guest");
  await page.getByLabel("Language").selectOption("th");
  await page.getByLabel("Timezone").fill("Asia/Bangkok");
  await page.getByLabel("Units").selectOption("metric");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText(/saved on this browser/i)).toBeVisible();

  const envelope = await page.evaluate((key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, storageKey);
  expect(envelope).toMatchObject({
    schemaVersion: 1,
    profile: {
      displayName: "QA Guest",
      locale: "th",
      timezone: "Asia/Bangkok",
      unitSystem: "metric",
    },
  });
  expect(envelope.exportId).toEqual(expect.any(String));
  expect(envelope.exportedAt).toEqual(expect.any(String));
});

test("malformed guest data is reported and can be cleared safely", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [storageKey, "{bad-json"],
  );
  await page.goto("/onboarding/import");
  await expect(page.getByText(/Guest storage is corrupt/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirm import" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export JSON" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Clear guest data" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Continue to dashboard" }),
  ).toBeVisible();
});

test("JSON import is reviewed before replacing valid browser data", async ({
  page,
}) => {
  const existing = {
    schemaVersion: 1,
    exportId: "30000000-0000-4000-8000-000000000001",
    exportedAt: "2026-07-27T00:00:00.000Z",
    profile: {
      displayName: "Existing",
      locale: "en",
      timezone: "UTC",
      unitSystem: "metric",
    },
  };
  const imported = {
    ...existing,
    exportId: "30000000-0000-4000-8000-000000000002",
    profile: {
      displayName: "Imported",
      locale: "th",
      timezone: "Asia/Bangkok",
      unitSystem: "metric",
    },
  };
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [storageKey, JSON.stringify(existing)],
  );
  await page.goto("/onboarding/import");
  await page.getByLabel("Import a guest JSON export").setInputFiles({
    name: "guest.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(imported)),
  });
  await expect(page.getByText("Imported", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      storageKey,
    ),
  ).toEqual(existing);

  await page.getByRole("button", { name: "Confirm import" }).click();
  await expect(page.getByText(/imported into this browser/i)).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      storageKey,
    ),
  ).toEqual(imported);
});

test("guest export and clear controls complete with visible feedback", async ({
  page,
}) => {
  const envelope = {
    schemaVersion: 1,
    exportId: "30000000-0000-4000-8000-000000000003",
    exportedAt: "2026-07-27T00:00:00.000Z",
    profile: {
      displayName: "Exportable",
      locale: "en",
      timezone: "UTC",
      unitSystem: "metric",
    },
  };
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [storageKey, JSON.stringify(envelope)],
  );
  await page.goto("/onboarding/import");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    `exercise-tracker-guest-${envelope.exportId}.json`,
  );
  await expect(page.getByText("Guest export downloaded.")).toBeVisible();

  await page.getByRole("button", { name: "Clear guest data" }).click();
  await expect(
    page.getByText("Guest data cleared from this browser."),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBeNull();
});
