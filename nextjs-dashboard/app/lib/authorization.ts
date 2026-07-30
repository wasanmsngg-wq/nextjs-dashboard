import "server-only";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function getAuthorization() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email_confirmed_at)
    return { supabase, user: null, isAdmin: false };
  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, user, isAdmin: Boolean(data) };
}
