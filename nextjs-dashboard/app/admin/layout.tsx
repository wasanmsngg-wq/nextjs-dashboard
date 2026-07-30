import AppShell from "@/app/ui/organisms/app-shell";
import { getAuthorization } from "@/app/lib/authorization";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAuthorization();
  return (
    <AppShell userEmail={user?.email} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
