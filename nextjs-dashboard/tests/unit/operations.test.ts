import { describe, expect, it, vi } from "vitest";
import { readServerEnv } from "@/app/lib/env";
import {
  MemoryRateLimiter,
  UpstashRateLimiter,
} from "@/app/lib/operations/rate-limit";
import { SentryErrorReporter } from "@/app/lib/operations/error-reporting";
import { runGuardedOperation } from "@/app/lib/operations/guard";

const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key-long-enough",
  NEXT_PUBLIC_SITE_URL: "https://exercise.example",
};

describe("operational controls", () => {
  it("requires real production adapter configuration, not adapter labels", () => {
    expect(() =>
      readServerEnv({
        ...publicEnv,
        NODE_ENV: "production",
        APP_ENV: "production",
        RATE_LIMIT_ADAPTER: "distributed",
        ERROR_REPORTER_ADAPTER: "sentry",
      }),
    ).toThrow("Upstash");

    expect(
      readServerEnv({
        ...publicEnv,
        NODE_ENV: "production",
        APP_ENV: "production",
        RATE_LIMIT_ADAPTER: "distributed",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "upstash-token-long-enough",
        ERROR_REPORTER_ADAPTER: "sentry",
        SENTRY_DSN: "https://public@example.ingest.sentry.io/123",
      }),
    ).toMatchObject({ APP_ENV: "production" });
  });

  it("provides deterministic fixed-window limiting", async () => {
    let now = 1_000;
    const limiter = new MemoryRateLimiter(
      { test: { limit: 2, windowSeconds: 10 } },
      () => now,
    );
    await expect(limiter.consume("person", "test")).resolves.toEqual({
      allowed: true,
    });
    await expect(limiter.consume("person", "test")).resolves.toEqual({
      allowed: true,
    });
    await expect(limiter.consume("person", "test")).resolves.toEqual({
      allowed: false,
      retryAfter: 10,
    });
    now = 11_000;
    await expect(limiter.consume("person", "test")).resolves.toEqual({
      allowed: true,
    });
  });

  it("uses the distributed response count and ttl", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ result: [3, 17] }), { status: 200 }),
      );
    const limiter = new UpstashRateLimiter(
      "https://example.upstash.io",
      "token",
      { test: { limit: 2, windowSeconds: 30 } },
      request,
    );
    await expect(limiter.consume("opaque-key", "test")).resolves.toEqual({
      allowed: false,
      retryAfter: 17,
    });
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining("/eval/"),
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      }),
    );
    expect(request.mock.calls[0][0]).not.toContain("opaque-key");
  });

  it("returns request-correlated safe failures and reports thrown errors", async () => {
    const capture = vi.fn();
    const result = await runGuardedOperation({
      key: "opaque",
      policy: "test",
      operation: "profile.save",
      requestId: "request-123",
      rateLimiter: { consume: async () => ({ allowed: true }) },
      errorReporter: { capture },
      execute: async () => {
        throw new Error("database secret");
      },
    });
    expect(result).toEqual({
      ok: false,
      error: "operation_failed",
      requestId: "request-123",
    });
    expect(capture).toHaveBeenCalledWith(expect.any(Error), {
      requestId: "request-123",
      operation: "profile.save",
    });
  });

  it("delivers Sentry-compatible envelopes without throwing to callers", () => {
    const request = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const reporter = new SentryErrorReporter(
      "https://public@example.ingest.sentry.io/123",
      request,
    );
    reporter.capture(new Error("database-password=do-not-send"), {
      requestId: "request-123",
      operation: "auth.login",
    });
    expect(request).toHaveBeenCalledWith(
      "https://example.ingest.sentry.io/api/123/envelope/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-sentry-envelope",
        }),
      }),
    );
    expect(request.mock.calls[0][1].body).not.toContain("do-not-send");
  });
});
