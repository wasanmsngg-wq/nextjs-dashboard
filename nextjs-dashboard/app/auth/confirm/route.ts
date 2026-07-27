import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeRedirectPath } from "@/app/lib/redirects";

const emailOtpTypes = new Set<EmailOtpType>([
  "email",
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  if (!code && (!tokenHash || !type || !emailOtpTypes.has(type)))
    return NextResponse.redirect(
      new URL("/login?error=invalid_callback", url.origin),
    );
  const supabase = await createSupabaseServerClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: type!,
      });
  if (error)
    return NextResponse.redirect(
      new URL("/login?error=invalid_callback", url.origin),
    );
  return NextResponse.redirect(
    new URL(safeRedirectPath(url.searchParams.get("next")), url.origin),
  );
}
