import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});

const publicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV,
  VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV,
};

const serverSchema = publicSchema.extend({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  VERCEL_URL: z.string().min(1).optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["development", "test", "preview", "production"]).optional(),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  RATE_LIMIT_ADAPTER: z.enum(["memory", "distributed"]).default("memory"),
  ERROR_REPORTER_ADAPTER: z.enum(["console", "sentry"]).default("console"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(20).optional(),
  SENTRY_DSN: z.string().url().optional(),
});

function formatError(error: z.ZodError) {
  return error.issues.map((issue) => issue.path.join(".")).join(", ");
}

type EnvironmentInput = Record<string, string | undefined>;

function resolveAppEnvironment(input: EnvironmentInput) {
  if (input.APP_ENV && input.VERCEL_ENV && input.APP_ENV !== input.VERCEL_ENV) {
    throw new Error(
      "APP_ENV and VERCEL_ENV must identify the same environment.",
    );
  }
  return input.VERCEL_ENV ?? input.APP_ENV;
}

export function readPublicEnv(input: EnvironmentInput = publicEnvironment) {
  const parsed = publicSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      `Invalid public environment configuration: ${formatError(parsed.error)}`,
    );
  }
  return parsed.data;
}

export function readServerEnv(input: EnvironmentInput = process.env) {
  const forbidden = Object.keys(input).filter(
    (key) =>
      key.startsWith("NEXT_PUBLIC_") &&
      /(SECRET|SERVICE|PASSWORD|PRIVATE)/i.test(key),
  );
  if (forbidden.length) {
    throw new Error("Secret-like values must not use the NEXT_PUBLIC_ prefix.");
  }

  const parsed = serverSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment configuration: ${formatError(parsed.error)}`,
    );
  }
  const appEnvironment = resolveAppEnvironment(parsed.data);
  if (parsed.data.NODE_ENV === "production" && !appEnvironment) {
    throw new Error(
      "APP_ENV is required outside Vercel when NODE_ENV is production.",
    );
  }
  if (
    parsed.data.RATE_LIMIT_ADAPTER === "distributed" &&
    (!parsed.data.UPSTASH_REDIS_REST_URL ||
      !parsed.data.UPSTASH_REDIS_REST_TOKEN)
  ) {
    throw new Error(
      "Distributed rate limiting requires an Upstash REST URL and token.",
    );
  }
  if (
    parsed.data.ERROR_REPORTER_ADAPTER === "sentry" &&
    !parsed.data.SENTRY_DSN
  ) {
    throw new Error("Sentry-compatible monitoring requires SENTRY_DSN.");
  }
  if (
    appEnvironment === "production" &&
    (parsed.data.RATE_LIMIT_ADAPTER !== "distributed" ||
      parsed.data.ERROR_REPORTER_ADAPTER !== "sentry")
  ) {
    throw new Error(
      "Production requires configured distributed rate limiting and Sentry-compatible monitoring.",
    );
  }
  if (appEnvironment === "production") {
    if (!parsed.data.NEXT_PUBLIC_SITE_URL) {
      throw new Error("Production URLs must be configured.");
    }
    const siteUrl = new URL(parsed.data.NEXT_PUBLIC_SITE_URL);
    const supabaseUrl = new URL(parsed.data.NEXT_PUBLIC_SUPABASE_URL);
    const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
    if (
      siteUrl.protocol !== "https:" ||
      supabaseUrl.protocol !== "https:" ||
      loopbackHosts.has(siteUrl.hostname) ||
      loopbackHosts.has(supabaseUrl.hostname)
    ) {
      throw new Error(
        "Production URLs must use HTTPS and must not point to local services.",
      );
    }
  }
  return { ...parsed.data, APP_ENV: appEnvironment };
}

export function resolveSiteUrl(input: EnvironmentInput = process.env) {
  const env = readServerEnv(input);
  if (env.APP_ENV === "preview" && env.VERCEL_URL) {
    return `https://${env.VERCEL_URL.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  throw new Error(
    "Preview requires VERCEL_URL and production requires NEXT_PUBLIC_SITE_URL.",
  );
}
