"use server";

import { z } from "zod";
import { profileSchema } from "@/app/lib/profile-validation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { getOperationalServices } from "@/app/lib/operations/factory";
import { runGuardedOperation } from "@/app/lib/operations/guard";
import { getRequestId } from "@/app/lib/operations/request";

const importSchema = z.object({
  schemaVersion: z.literal(1),
  exportId: z.string().uuid(),
  exportedAt: z.string().datetime(),
  profile: profileSchema,
});

export async function importGuestProfile(value: unknown) {
  const envelope = importSchema.safeParse(value);
  if (!envelope.success)
    return {
      ok: false as const,
      error: "The guest export is invalid or unsupported.",
    };
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email_confirmed_at)
    return {
      ok: false as const,
      error: "Verify your account before importing guest data.",
    };
  const profile = envelope.data.profile;
  const { rateLimiter, errorReporter } = getOperationalServices();
  const result = await runGuardedOperation({
    key: `${user.id}:${envelope.data.exportId}`,
    policy: "guestImport",
    operation: "profile.guest_import",
    rateLimiter,
    errorReporter,
    requestId: await getRequestId(),
    execute: async () =>
      await supabase.rpc("import_guest_profile", {
        import_export_id: envelope.data.exportId,
        import_display_name: profile.displayName,
        import_locale: profile.locale,
        import_timezone: profile.timezone,
        import_unit_system: profile.unitSystem,
      }),
  });
  if (!result.ok)
    return {
      ok: false as const,
      error:
        result.error === "rate_limited"
          ? "Too many import attempts. Wait and try again."
          : "The import could not be confirmed. Your browser data was kept.",
    };
  const { data: imported, error } = result.value;
  if (error)
    return {
      ok: false as const,
      error: "The import could not be confirmed. Your browser data was kept.",
    };
  return { ok: true as const, alreadyImported: !imported };
}
