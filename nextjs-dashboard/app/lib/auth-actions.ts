"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeRedirectPath } from "@/app/lib/redirects";
import { resolveSiteUrl } from "@/app/lib/env";

export type AuthState = { error?: string; message?: string };

function credentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  return {
    email: typeof email === "string" ? email.trim() : "",
    password: typeof password === "string" ? password : "",
  };
}

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(
    credentials(formData),
  );
  if (error) return { error: "Email or password is incorrect." };
  redirect(safeRedirectPath(formData.get("callbackUrl")));
}

export async function signup(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createSupabaseServerClient();
  const origin = resolveSiteUrl();
  const { error } = await supabase.auth.signUp({
    ...credentials(formData),
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/onboarding/import`,
    },
  });
  return error
    ? {
        error: "Unable to create the account. Check the details and try again.",
      }
    : { message: "Check your email to verify your account." };
}

export async function requestPasswordReset(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.trim())
    return { error: "Enter your email address." };
  const supabase = await createSupabaseServerClient();
  const origin = resolveSiteUrl();
  await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/confirm?next=/settings/profile`,
  });
  return { message: "If an account exists, a recovery link has been sent." };
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
