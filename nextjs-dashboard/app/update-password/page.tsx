import { updatePassword } from "@/app/lib/auth-actions";
import { AuthForm } from "@/app/ui/auth-form";

export default function UpdatePasswordPage() {
  return (
    <main className="p-6">
      <AuthForm action={updatePassword} mode="update-password" />
    </main>
  );
}
