import AppShell from "@/app/ui/organisms/app-shell";
import { getAuthorization } from "@/app/lib/authorization";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAuthorization();
  if (!user || !isAdmin) notFound();
  return (
    <AppShell userEmail={user?.email} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
