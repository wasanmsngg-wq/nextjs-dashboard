import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

const serverSchema = publicSchema.extend({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["development", "test", "preview", "production"]).optional(),
  RATE_LIMIT_ADAPTER: z.enum(["memory", "distributed"]).default("memory"),
  ERROR_REPORTER_ADAPTER: z.enum(["console", "sentry"]).default("console"),
});

function formatError(error: z.ZodError) {
  return error.issues.map((issue) => issue.path.join(".")).join(", ");
}

type EnvironmentInput = Record<string, string | undefined>;

export function readPublicEnv(input: EnvironmentInput = process.env) {
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
  if (parsed.data.NODE_ENV === "production" && !parsed.data.APP_ENV) {
    throw new Error("APP_ENV is required when NODE_ENV is production.");
  }
  if (
    parsed.data.APP_ENV === "production" &&
    (parsed.data.RATE_LIMIT_ADAPTER !== "distributed" ||
      parsed.data.ERROR_REPORTER_ADAPTER !== "sentry")
  ) {
    throw new Error(
      "Production requires distributed rate limiting and monitoring.",
    );
  }
  if (
    parsed.data.APP_ENV === "production" &&
    (new URL(parsed.data.NEXT_PUBLIC_SITE_URL).hostname === "localhost" ||
      new URL(parsed.data.NEXT_PUBLIC_SUPABASE_URL).hostname === "127.0.0.1")
  ) {
    throw new Error("Production URLs must not point to local services.");
  }
  return parsed.data;
}
