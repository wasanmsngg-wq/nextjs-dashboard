import { describe, expect, it } from "vitest";
import { readServerEnv, resolveSiteUrl } from "@/app/lib/env";
import { profileSchema } from "@/app/lib/profile-validation";
import { safeRedirectPath } from "@/app/lib/redirects";
import { redact } from "@/app/lib/observability";

const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-publishable-key-long-enough",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("foundation security contracts", () => {
  it("rejects public secret names", () => {
    expect(() =>
      readServerEnv({ ...publicEnv, NEXT_PUBLIC_SERVICE_ROLE_KEY: "secret" }),
    ).toThrow("NEXT_PUBLIC_");
  });

  it("requires production-grade adapters", () => {
    expect(() =>
      readServerEnv({
        ...publicEnv,
        NODE_ENV: "production",
        APP_ENV: "production",
      }),
    ).toThrow("distributed rate limiting");
  });

  it("derives the review origin from Vercel without weakening production", () => {
    expect(
      resolveSiteUrl({
        ...publicEnv,
        NODE_ENV: "production",
        APP_ENV: "preview",
        VERCEL_URL: "exercise-tracker-review.vercel.app",
      }),
    ).toBe("https://exercise-tracker-review.vercel.app");
    expect(() =>
      resolveSiteUrl({
        NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "staging-publishable-key-long-enough",
        NODE_ENV: "production",
        APP_ENV: "production",
        RATE_LIMIT_ADAPTER: "distributed",
        ERROR_REPORTER_ADAPTER: "sentry",
      }),
    ).toThrow("Production URLs");
  });

  it("allowlists local redirect paths", () => {
    expect(safeRedirectPath("/settings/profile?done=1")).toBe(
      "/settings/profile?done=1",
    );
    expect(safeRedirectPath("//evil.example")).toBe("/dashboard");
    expect(safeRedirectPath("https://evil.example")).toBe("/dashboard");
  });

  it("validates IANA timezones and profile fields", () => {
    expect(
      profileSchema.safeParse({
        displayName: "Ada",
        locale: "en",
        timezone: "Asia/Bangkok",
        unitSystem: "metric",
      }).success,
    ).toBe(true);
    expect(
      profileSchema.safeParse({
        displayName: "Ada",
        locale: "en",
        timezone: "Mars/Olympus",
        unitSystem: "metric",
      }).success,
    ).toBe(false);
  });

  it("redacts nested secrets", () => {
    expect(redact({ requestId: "1", nested: { token: "nope" } })).toEqual({
      requestId: "1",
      nested: { token: "[REDACTED]" },
    });
  });
});
