import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/dashboard",
  "/settings/profile",
  "/onboarding/import",
  "/workouts",
];

test("public and guest routes have one h1 and no horizontal overflow", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
  }
});

test("health endpoints are generic and security headers are present", async ({
  request,
}) => {
  const live = await request.get("/api/health/live");
  expect(live.ok()).toBeTruthy();
  expect(await live.json()).toEqual({ status: "ok" });

  const ready = await request.get("/api/health/ready");
  expect([200, 503]).toContain(ready.status());
  expect(await ready.text()).not.toMatch(
    /(?:postgres|password|stack|service.role)/i,
  );

  const page = await request.get("/");
  expect(page.headers()["content-security-policy"]).toBeTruthy();
  expect(page.headers()["x-content-type-options"]).toBe("nosniff");
  expect(page.headers()["referrer-policy"]).toBeTruthy();
  expect(page.headers()["permissions-policy"]).toBeTruthy();
});

test("retired and unauthorized directory routes do not disclose existence", async ({
  request,
}) => {
  for (const route of ["/dashboard/customers", "/admin/customers"]) {
    expect(
      (await request.get(route, { maxRedirects: 0 })).status(),
      route,
    ).toBe(404);
  }
});
