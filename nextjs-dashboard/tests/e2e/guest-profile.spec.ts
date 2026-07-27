import { expect, test } from "@playwright/test";

const storageKey = "exercise-tracker:guest:v1";

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
