"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeRedirectPath } from "@/app/lib/redirects";
import { resolveSiteUrl } from "@/app/lib/env";
import {
  credentialsSchema,
  newPasswordSchema,
  passwordRecoveryEmailSchema,
} from "@/app/lib/auth-validation";
import { getOperationalServices } from "@/app/lib/operations/factory";
import { runGuardedOperation } from "@/app/lib/operations/guard";
import { getRequestId } from "@/app/lib/operations/request";

export type AuthState = { error?: string; message?: string };

function credentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

async function guardAuthentication<T>(
  key: string,
  policy: "authentication" | "passwordRecovery",
  operation: string,
  execute: () => Promise<T>,
) {
  const { rateLimiter, errorReporter } = getOperationalServices();
  return runGuardedOperation({
    key,
    policy,
    operation,
    execute,
    rateLimiter,
    errorReporter,
    requestId: await getRequestId(),
  });
}

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentials(formData);
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const supabase = await createSupabaseServerClient();
  const result = await guardAuthentication(
    parsed.data.email,
    "authentication",
    "auth.login",
    () => supabase.auth.signInWithPassword(parsed.data),
  );
  if (!result.ok)
    return {
      error:
        result.error === "rate_limited"
          ? "Too many attempts. Wait and try again."
          : "Unable to log in right now.",
    };
  const { error } = result.value;
  if (error) return { error: "Email or password is incorrect." };
  redirect(safeRedirectPath(formData.get("callbackUrl")));
}

export async function signup(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentials(formData);
  if (!parsed.success)
    return {
      error: "Enter a valid email and a password of at least 8 characters.",
    };
  const supabase = await createSupabaseServerClient();
  const origin = resolveSiteUrl();
  const result = await guardAuthentication(
    parsed.data.email,
    "authentication",
    "auth.signup",
    () =>
      supabase.auth.signUp({
        ...parsed.data,
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=/onboarding/import`,
        },
      }),
  );
  if (!result.ok)
    return {
      error:
        result.error === "rate_limited"
          ? "Too many attempts. Wait and try again."
          : "Unable to create the account right now.",
    };
  const { error } = result.value;
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
  const email = passwordRecoveryEmailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter your email address." };
  const supabase = await createSupabaseServerClient();
  const origin = resolveSiteUrl();
  const result = await guardAuthentication(
    email.data,
    "passwordRecovery",
    "auth.password_recovery",
    () =>
      supabase.auth.resetPasswordForEmail(email.data, {
        redirectTo: `${origin}/auth/confirm?next=/update-password`,
      }),
  );
  if (!result.ok && result.error === "rate_limited")
    return { error: "Too many recovery requests. Wait and try again." };
  return { message: "If an account exists, a recovery link has been sent." };
}

export async function updatePassword(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some(
      (issue) => issue.path[0] === "confirmPassword",
    );
    return {
      error: mismatch
        ? "Passwords do not match."
        : "Use a password between 8 and 128 characters.",
    };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error: "This recovery link is invalid or expired. Request a new one.",
    };
  const result = await guardAuthentication(
    user.id,
    "passwordRecovery",
    "auth.password_update",
    () =>
      supabase.auth.updateUser({
        password: parsed.data.password,
      }),
  );
  if (!result.ok)
    return {
      error:
        result.error === "rate_limited"
          ? "Too many recovery attempts. Wait and try again."
          : "The password could not be updated. Request a new recovery link.",
    };
  const { error } = result.value;
  if (error)
    return {
      error: "The password could not be updated. Request a new recovery link.",
    };
  return { message: "Password updated. You can continue to your dashboard." };
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
