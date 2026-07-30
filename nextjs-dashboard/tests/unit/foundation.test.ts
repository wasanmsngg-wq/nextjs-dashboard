import { describe, expect, it } from "vitest";
import { readServerEnv, resolveSiteUrl } from "@/app/lib/env";
import { profileSchema } from "@/app/lib/profile-validation";
import { safeRedirectPath } from "@/app/lib/redirects";
import { redact } from "@/app/lib/observability";
import {
  credentialsSchema,
  newPasswordSchema,
} from "@/app/lib/auth-validation";

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

  it("uses the explicitly configured Supabase variables in Preview", () => {
    expect(
      readServerEnv({
        ...publicEnv,
        APP_ENV: "preview",
        NEXT_PUBLIC_SUPABASE_URL: "https://shared.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "shared-publishable-key-long-enough",
        NEXT_PUBLIC_PREVIEW_SUPABASE_URL:
          "https://isolated-preview.supabase.co",
        NEXT_PUBLIC_PREVIEW_SUPABASE_PUBLISHABLE_KEY:
          "isolated-preview-publishable-key",
      }),
    ).toMatchObject({
      NEXT_PUBLIC_SUPABASE_URL: "https://shared.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "shared-publishable-key-long-enough",
    });
  });

  it("rejects conflicting deployment environment declarations", () => {
    expect(() =>
      readServerEnv({
        ...publicEnv,
        APP_ENV: "production",
        VERCEL_ENV: "preview",
        NEXT_PUBLIC_SITE_URL: "https://exercise.example",
        NEXT_PUBLIC_SUPABASE_URL: "https://production.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "production-publishable-key-long-enough",
        NEXT_PUBLIC_PREVIEW_SUPABASE_URL:
          "https://isolated-preview.supabase.co",
        NEXT_PUBLIC_PREVIEW_SUPABASE_PUBLISHABLE_KEY:
          "isolated-preview-publishable-key",
        RATE_LIMIT_ADAPTER: "distributed",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "upstash-token-long-enough",
        ERROR_REPORTER_ADAPTER: "sentry",
        SENTRY_DSN: "https://public@example.ingest.sentry.io/123",
      }),
    ).toThrow("APP_ENV and VERCEL_ENV");

    expect(() =>
      readServerEnv({
        ...publicEnv,
        APP_ENV: "preview",
        VERCEL_ENV: "production",
      }),
    ).toThrow("APP_ENV and VERCEL_ENV");
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

  it("uses the current Vercel deployment origin for previews", () => {
    expect(
      resolveSiteUrl({
        ...publicEnv,
        NEXT_PUBLIC_SITE_URL: "https://stable-review.vercel.app/",
        NODE_ENV: "production",
        APP_ENV: "preview",
        VERCEL_URL: "exercise-tracker-review.vercel.app",
      }),
    ).toBe("https://exercise-tracker-review.vercel.app");
    expect(
      resolveSiteUrl({
        ...publicEnv,
        NEXT_PUBLIC_SITE_URL: undefined,
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        VERCEL_URL: "automatic-review.vercel.app",
      }),
    ).toBe("https://automatic-review.vercel.app");
    expect(() =>
      resolveSiteUrl({
        NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "staging-publishable-key-long-enough",
        NODE_ENV: "production",
        APP_ENV: "production",
        RATE_LIMIT_ADAPTER: "distributed",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "upstash-token-long-enough",
        ERROR_REPORTER_ADAPTER: "sentry",
        SENTRY_DSN: "https://public@example.ingest.sentry.io/123",
      }),
    ).toThrow("Production URLs");
  });

  it("requires HTTPS and non-loopback production URLs", () => {
    const production = {
      ...publicEnv,
      NODE_ENV: "production",
      APP_ENV: "production",
      RATE_LIMIT_ADAPTER: "distributed",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "upstash-token-long-enough",
      ERROR_REPORTER_ADAPTER: "sentry",
      SENTRY_DSN: "https://public@example.ingest.sentry.io/123",
    };
    expect(() =>
      readServerEnv({
        ...production,
        NEXT_PUBLIC_SITE_URL: "http://exercise.example",
        NEXT_PUBLIC_SUPABASE_URL: "https://production.supabase.co",
      }),
    ).toThrow("HTTPS");
    expect(() =>
      readServerEnv({
        ...production,
        NEXT_PUBLIC_SITE_URL: "https://exercise.example",
        NEXT_PUBLIC_SUPABASE_URL: "https://localhost:54321",
      }),
    ).toThrow("local services");
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

  it("validates authentication credentials and matching recovery passwords", () => {
    expect(
      credentialsSchema.safeParse({
        email: "person@example.com",
        password: "correct-horse",
      }).success,
    ).toBe(true);
    expect(
      credentialsSchema.safeParse({
        email: "not-an-email",
        password: "short",
      }).success,
    ).toBe(false);
    expect(
      newPasswordSchema.safeParse({
        password: "correct-horse",
        confirmPassword: "different-horse",
      }).success,
    ).toBe(false);
  });
});
