import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
export async function GET() {
  let unavailable = true;
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("health_check");
    unavailable = Boolean(error);
  } catch {
    unavailable = true;
  }
  return NextResponse.json(
    { status: unavailable ? "unavailable" : "ready" },
    {
      status: unavailable ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
