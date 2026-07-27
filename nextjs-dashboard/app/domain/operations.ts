export interface RateLimiter {
  consume(
    key: string,
    policy: string,
  ): Promise<{ allowed: boolean; retryAfter?: number }>;
}

export interface ErrorReporter {
  capture(
    error: unknown,
    context: { requestId: string; operation: string },
  ): void;
}
