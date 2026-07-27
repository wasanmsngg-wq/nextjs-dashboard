import { notFound, redirect } from "next/navigation";
import { getAuthorization } from "@/app/lib/authorization";

export default async function LegacyCustomersPage() {
  const { isAdmin } = await getAuthorization();
  if (!isAdmin) notFound();
  redirect("/admin/customers");
}
