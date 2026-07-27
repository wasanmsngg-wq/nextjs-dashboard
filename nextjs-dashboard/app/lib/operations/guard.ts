import type { ErrorReporter, RateLimiter } from "@/app/domain";

export type GuardedOperationResult<T> =
  | { ok: true; value: T; requestId: string }
  | {
      ok: false;
      error: "rate_limited" | "operation_failed";
      requestId: string;
      retryAfter?: number;
    };

export async function runGuardedOperation<T>({
  key,
  policy,
  operation,
  execute,
  rateLimiter,
  errorReporter,
  requestId = crypto.randomUUID(),
}: {
  key: string;
  policy: string;
  operation: string;
  execute: () => Promise<T>;
  rateLimiter: RateLimiter;
  errorReporter: ErrorReporter;
  requestId?: string;
}): Promise<GuardedOperationResult<T>> {
  try {
    const rateLimit = await rateLimiter.consume(key, policy);
    if (!rateLimit.allowed) {
      return {
        ok: false,
        error: "rate_limited",
        requestId,
        retryAfter: rateLimit.retryAfter,
      };
    }
    return { ok: true, value: await execute(), requestId };
  } catch (error) {
    errorReporter.capture(error, { requestId, operation });
    return { ok: false, error: "operation_failed", requestId };
  }
}
