import type { ErrorReporter, RateLimiter } from "@/app/domain";
import { readServerEnv } from "@/app/lib/env";
import {
  ConsoleErrorReporter,
  SentryErrorReporter,
} from "@/app/lib/operations/error-reporting";
import {
  MemoryRateLimiter,
  UpstashRateLimiter,
} from "@/app/lib/operations/rate-limit";

export type OperationalServices = {
  rateLimiter: RateLimiter;
  errorReporter: ErrorReporter;
};

let services: OperationalServices | undefined;

export function createOperationalServices(): OperationalServices {
  const env = readServerEnv();
  const rateLimiter =
    env.RATE_LIMIT_ADAPTER === "distributed"
      ? new UpstashRateLimiter(
          env.UPSTASH_REDIS_REST_URL!,
          env.UPSTASH_REDIS_REST_TOKEN!,
        )
      : new MemoryRateLimiter();
  const errorReporter =
    env.ERROR_REPORTER_ADAPTER === "sentry"
      ? new SentryErrorReporter(env.SENTRY_DSN!)
      : new ConsoleErrorReporter();
  return { rateLimiter, errorReporter };
}

export function getOperationalServices() {
  services ??= createOperationalServices();
  return services;
}

export function setOperationalServicesForTests(
  value: OperationalServices | undefined,
) {
  services = value;
}
