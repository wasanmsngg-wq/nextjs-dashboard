import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { ProfileForm } from "@/app/features/profile/ui/profile-form";
import type { ProfilePreferences } from "@/app/domain";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = user
    ? await supabase
        .from("user_profiles")
        .select("display_name,locale,timezone,unit_system")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const initial: ProfilePreferences = data
    ? {
        displayName: data.display_name,
        locale: data.locale,
        timezone: data.timezone,
        unitSystem: data.unit_system,
      }
    : { displayName: "", locale: "en", timezone: "UTC", unitSystem: "metric" };
  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Profile settings</h1>
      <ProfileForm initial={initial} userId={user?.id} />
    </main>
  );
}
