import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("health_check");
  return NextResponse.json(
    { status: error ? "unavailable" : "ready" },
    { status: error ? 503 : 200 },
  );
}
