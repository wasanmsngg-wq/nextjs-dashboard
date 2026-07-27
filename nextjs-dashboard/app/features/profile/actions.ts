"use server";

import { revalidatePath } from "next/cache";
import { profileSchema } from "@/app/lib/profile-validation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

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
  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      display_name: parsed.data.displayName,
      locale: parsed.data.locale,
      timezone: parsed.data.timezone,
      unit_system: parsed.data.unitSystem,
    },
    { onConflict: "user_id" },
  );
  if (error)
    return { ok: false as const, error: "The profile could not be saved." };
  revalidatePath("/settings/profile");
  return { ok: true as const };
}
