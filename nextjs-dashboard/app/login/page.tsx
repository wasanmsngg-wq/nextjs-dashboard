import { login } from "@/app/lib/auth-actions";
import { safeRedirectPath } from "@/app/lib/redirects";
import { AuthForm } from "@/app/ui/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" &&
    safeRedirectPath(params.callbackUrl, "") === params.callbackUrl
      ? params.callbackUrl
      : undefined;
  return (
    <main className="p-6">
      <AuthForm action={login} mode="login" callbackUrl={callbackUrl} />
    </main>
  );
}
