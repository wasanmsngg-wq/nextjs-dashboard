import type { RateLimiter } from "@/app/domain";

export type RateLimitPolicy = {
  limit: number;
  windowSeconds: number;
};

export const RATE_LIMIT_POLICIES = {
  authentication: { limit: 10, windowSeconds: 60 },
  passwordRecovery: { limit: 5, windowSeconds: 900 },
  profileWrite: { limit: 20, windowSeconds: 60 },
  guestImport: { limit: 10, windowSeconds: 60 },
  customerSearch: { limit: 60, windowSeconds: 60 },
  adminWrite: { limit: 60, windowSeconds: 60 },
  workoutWrite: { limit: 240, windowSeconds: 60 },
} as const satisfies Record<string, RateLimitPolicy>;

export class MemoryRateLimiter implements RateLimiter {
  private readonly attempts = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  constructor(
    private readonly policies: Record<
      string,
      RateLimitPolicy
    > = RATE_LIMIT_POLICIES,
    private readonly now: () => number = Date.now,
  ) {}

  async consume(key: string, policyName: string) {
    const policy = this.policies[policyName];
    if (!policy) throw new Error(`Unknown rate-limit policy: ${policyName}`);

    const id = `${policyName}:${key}`;
    const now = this.now();
    const existing = this.attempts.get(id);
    const attempt =
      !existing || existing.expiresAt <= now
        ? { count: 1, expiresAt: now + policy.windowSeconds * 1000 }
        : { ...existing, count: existing.count + 1 };
    this.attempts.set(id, attempt);

    return attempt.count <= policy.limit
      ? { allowed: true }
      : {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((attempt.expiresAt - now) / 1000)),
        };
  }
}

type Fetch = typeof fetch;

async function opaqueIdentifier(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export class UpstashRateLimiter implements RateLimiter {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly policies: Record<
      string,
      RateLimitPolicy
    > = RATE_LIMIT_POLICIES,
    private readonly request: Fetch = fetch,
  ) {}

  async consume(key: string, policyName: string) {
    const policy = this.policies[policyName];
    if (!policy) throw new Error(`Unknown rate-limit policy: ${policyName}`);

    const bucket = `exercise-tracker:rate-limit:${policyName}:${await opaqueIdentifier(key)}`;
    const script =
      "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; local ttl=redis.call('TTL',KEYS[1]); return {n,ttl}";
    const response = await this.request(
      `${this.baseUrl.replace(/\/+$/, "")}/eval/${encodeURIComponent(script)}/1/${encodeURIComponent(bucket)}/${policy.windowSeconds}`,
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    if (!response.ok) throw new Error("Distributed rate limiter unavailable.");

    const payload = (await response.json()) as {
      result?: [number, number];
      error?: string;
    };
    if (!payload.result || payload.error)
      throw new Error("Distributed rate limiter returned an invalid response.");

    const [count, ttl] = payload.result;
    return count <= policy.limit
      ? { allowed: true }
      : { allowed: false, retryAfter: Math.max(1, ttl) };
  }
}
