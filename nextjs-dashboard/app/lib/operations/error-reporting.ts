import type { ErrorReporter } from "@/app/domain";
import { logEvent, redact } from "@/app/lib/observability";

export class ConsoleErrorReporter implements ErrorReporter {
  capture(_error: unknown, context: { requestId: string; operation: string }) {
    logEvent("error", "operation_failed", context);
  }
}

type Fetch = typeof fetch;

function sentryEndpoint(dsn: string) {
  const parsed = new URL(dsn);
  const projectId = parsed.pathname.replace(/^\/+/, "");
  if (!parsed.username || !projectId)
    throw new Error("SENTRY_DSN must include a public key and project ID.");
  return {
    url: `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/`,
    publicKey: parsed.username,
  };
}

export class SentryErrorReporter implements ErrorReporter {
  private readonly endpoint: ReturnType<typeof sentryEndpoint>;

  constructor(
    private readonly dsn: string,
    private readonly request: Fetch = fetch,
  ) {
    this.endpoint = sentryEndpoint(dsn);
  }

  capture(error: unknown, context: { requestId: string; operation: string }) {
    const eventId = crypto.randomUUID().replaceAll("-", "");
    const errorType = error instanceof Error ? error.name : "UnknownError";
    const envelope = [
      JSON.stringify({
        event_id: eventId,
        sent_at: new Date().toISOString(),
        dsn: this.dsn,
      }),
      JSON.stringify({ type: "event" }),
      JSON.stringify({
        event_id: eventId,
        level: "error",
        message: "Operation failed",
        exception: {
          values: [
            { type: errorType, value: "Details redacted by application" },
          ],
        },
        tags: redact(context),
      }),
    ].join("\n");

    void this.request(this.endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7,sentry_key=${this.endpoint.publicKey}`,
      },
      body: envelope,
      keepalive: true,
    }).catch(() => {
      logEvent("warn", "error_report_delivery_failed", context);
    });
  }
}
