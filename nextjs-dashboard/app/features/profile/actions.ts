"use server";

import { revalidatePath } from "next/cache";
import { profileSchema } from "@/app/lib/profile-validation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { getOperationalServices } from "@/app/lib/operations/factory";
import { runGuardedOperation } from "@/app/lib/operations/guard";
import { getRequestId } from "@/app/lib/operations/request";

export async function saveRegisteredProfile(formData: FormData) {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Check the profile fields and try again.",
    };
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      ok: false as const,
      error: "Log in before saving an account profile.",
    };
  const { rateLimiter, errorReporter } = getOperationalServices();
  const result = await runGuardedOperation({
    key: user.id,
    policy: "profileWrite",
    operation: "profile.save",
    rateLimiter,
    errorReporter,
    requestId: await getRequestId(),
    execute: async () =>
      await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          display_name: parsed.data.displayName,
          locale: parsed.data.locale,
          timezone: parsed.data.timezone,
          unit_system: parsed.data.unitSystem,
        },
        { onConflict: "user_id" },
      ),
  });
  if (!result.ok)
    return {
      ok: false as const,
      error:
        result.error === "rate_limited"
          ? "Too many profile updates. Wait and try again."
          : "The profile could not be saved.",
    };
  const { error } = result.value;
  if (error)
    return { ok: false as const, error: "The profile could not be saved." };
  revalidatePath("/settings/profile");
  return { ok: true as const };
}
