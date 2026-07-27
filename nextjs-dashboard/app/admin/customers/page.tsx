import { notFound } from "next/navigation";
import { z } from "zod";
import { getAuthorization } from "@/app/lib/authorization";
import { getTranslations } from "@/app/i18n/server";
import Search from "@/app/ui/molecules/search-field";
import CustomersTable from "@/app/ui/features/customers/customer-list";
import { DirectoryTemplate } from "@/app/ui/templates/directory-template";

const querySchema = z.string().trim().max(80).catch("");

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { supabase, isAdmin } = await getAuthorization();
  if (!isAdmin) notFound();
  const query = querySchema.parse((await searchParams).query ?? "");
  let request = supabase
    .from("customers")
    .select("id,name,email,image_url")
    .order("name");
  if (query)
    request = request.or(
      `name.ilike.%${query.replaceAll(/[,%()]/g, "")}%,email.ilike.%${query.replaceAll(/[,%()]/g, "")}%`,
    );
  const [{ data, error }, { t }] = await Promise.all([
    request,
    getTranslations(),
  ]);
  if (error)
    throw new Error("The customer directory is temporarily unavailable.");
  return (
    <DirectoryTemplate
      title={t("Customers")}
      description={t("View and search customers.")}
      controls={
        <div className="max-w-xl">
          <Search placeholder={t("Search customers...")} />
        </div>
      }
    >
      <CustomersTable customers={data ?? []} />
    </DirectoryTemplate>
  );
}
