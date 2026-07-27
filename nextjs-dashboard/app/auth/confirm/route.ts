import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeRedirectPath } from "@/app/lib/redirects";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code)
    return NextResponse.redirect(
      new URL("/login?error=invalid_callback", url.origin),
    );
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(
      new URL("/login?error=invalid_callback", url.origin),
    );
  return NextResponse.redirect(
    new URL(safeRedirectPath(url.searchParams.get("next")), url.origin),
  );
}
