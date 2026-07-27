import type { ErrorReporter, RateLimiter } from "@/app/domain";

const sensitiveKey =
  /(authorization|cookie|password|secret|token|health|body|nutrition)/i;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? "[REDACTED]" : redact(item),
      ]),
    );
  }
  return value;
}

export function logEvent(
  level: "info" | "warn" | "error",
  event: string,
  context: Record<string, unknown>,
) {
  const safeContext = redact(context) as Record<string, unknown>;
  console[level](
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      ...safeContext,
    }),
  );
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly counts = new Map<string, number>();
  async consume(key: string, policy: string) {
    const id = `${policy}:${key}`;
    const count = (this.counts.get(id) ?? 0) + 1;
    this.counts.set(id, count);
    return count <= 10 ? { allowed: true } : { allowed: false, retryAfter: 60 };
  }
}

export class ConsoleErrorReporter implements ErrorReporter {
  capture(_error: unknown, context: { requestId: string; operation: string }) {
    logEvent("error", "operation_failed", context);
  }
}
