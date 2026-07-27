import { requestPasswordReset } from "@/app/lib/auth-actions";
import { AuthForm } from "@/app/ui/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="p-6">
      <AuthForm action={requestPasswordReset} mode="recovery" />
    </main>
  );
}
