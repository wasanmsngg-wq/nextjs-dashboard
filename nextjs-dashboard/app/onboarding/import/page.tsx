import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { GuestImport } from "@/app/features/profile/ui/guest-import";

export default async function ImportPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Guest data</h1>
      <GuestImport canImport={Boolean(user?.email_confirmed_at)} />
    </main>
  );
}
