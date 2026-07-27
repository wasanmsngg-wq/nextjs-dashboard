"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/lib/auth-actions";
import { Button } from "@/app/ui/atoms/button";
import { useI18n } from "@/app/i18n/provider";

export function AuthForm({
  action,
  mode,
  callbackUrl,
}: {
  action: (state: AuthState, data: FormData) => Promise<AuthState>;
  mode: "login" | "signup" | "recovery" | "update-password";
  callbackUrl?: string;
}) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(action, {});
  const needsEmail = mode !== "update-password";
  const needsPassword = mode !== "recovery";
  return (
    <form
      action={formAction}
      className="mx-auto max-w-md space-y-4 rounded-xl bg-gray-50 p-6"
    >
      <h1 className="text-2xl font-semibold">
        {mode === "login"
          ? t("Log in")
          : mode === "signup"
            ? t("Create account")
            : mode === "recovery"
              ? t("Reset password")
              : t("Choose a new password")}
      </h1>
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      {needsEmail ? (
        <label className="block text-sm font-medium">
          {t("Email")}
          <input
            className="mt-1 block w-full rounded-md border p-2"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
      ) : null}
      {needsPassword ? (
        <label className="block text-sm font-medium">
          {t("Password")}
          <input
            className="mt-1 block w-full rounded-md border p-2"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={8}
            required
          />
        </label>
      ) : null}
      {mode === "update-password" ? (
        <label className="block text-sm font-medium">
          {t("Confirm password")}
          <input
            className="mt-1 block w-full rounded-md border p-2"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
      ) : null}
      <Button className="w-full" disabled={pending}>
        {pending
          ? t("Please wait…")
          : mode === "login"
            ? t("Log in")
            : mode === "signup"
              ? t("Sign up")
              : mode === "recovery"
                ? t("Send recovery link")
                : t("Update password")}
      </Button>
      <div aria-live="polite" className="min-h-6 text-sm">
        {state.error ? <p className="text-red-700">{t(state.error)}</p> : null}
        {state.message ? (
          <p className="text-green-800">{t(state.message)}</p>
        ) : null}
      </div>
      {mode === "login" ? (
        <div className="flex justify-between gap-4 text-sm">
          <Link className="inline-flex items-center py-2" href="/signup">
            {t("Create account")}
          </Link>
          <Link
            className="inline-flex items-center py-2"
            href="/forgot-password"
          >
            {t("Forgot password?")}
          </Link>
        </div>
      ) : mode !== "update-password" ? (
        <Link className="inline-flex items-center py-2 text-sm" href="/login">
          {t("Back to login")}
        </Link>
      ) : state.message ? (
        <Link
          className="inline-flex items-center py-2 text-sm"
          href="/dashboard"
        >
          {t("Continue to dashboard")}
        </Link>
      ) : null}
    </form>
  );
}
