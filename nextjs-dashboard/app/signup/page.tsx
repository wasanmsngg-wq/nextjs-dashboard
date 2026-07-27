import { signup } from "@/app/lib/auth-actions";
import { AuthForm } from "@/app/ui/auth-form";

export default function SignupPage() {
  return (
    <main className="p-6">
      <AuthForm action={signup} mode="signup" />
    </main>
  );
}
