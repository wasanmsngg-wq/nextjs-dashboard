"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/lib/auth-actions";
import { Button } from "@/app/ui/atoms/button";

export function AuthForm({
  action,
  mode,
  callbackUrl,
}: {
  action: (state: AuthState, data: FormData) => Promise<AuthState>;
  mode: "login" | "signup" | "recovery";
  callbackUrl?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const needsPassword = mode !== "recovery";
  return (
    <form
      action={formAction}
      className="mx-auto max-w-md space-y-4 rounded-xl bg-gray-50 p-6"
    >
      <h1 className="text-2xl font-semibold">
        {mode === "login"
          ? "Log in"
          : mode === "signup"
            ? "Create account"
            : "Reset password"}
      </h1>
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      <label className="block text-sm font-medium">
        Email
        <input
          className="mt-1 block w-full rounded-md border p-2"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      {needsPassword ? (
        <label className="block text-sm font-medium">
          Password
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
      <Button className="w-full" disabled={pending}>
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Log in"
            : mode === "signup"
              ? "Sign up"
              : "Send recovery link"}
      </Button>
      <div aria-live="polite" className="min-h-6 text-sm">
        {state.error ? <p className="text-red-700">{state.error}</p> : null}
        {state.message ? (
          <p className="text-green-800">{state.message}</p>
        ) : null}
      </div>
      {mode === "login" ? (
        <div className="flex justify-between gap-4 text-sm">
          <Link className="inline-flex items-center py-2" href="/signup">
            Create account
          </Link>
          <Link
            className="inline-flex items-center py-2"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
      ) : (
        <Link className="inline-flex items-center py-2 text-sm" href="/login">
          Back to login
        </Link>
      )}
    </form>
  );
}
