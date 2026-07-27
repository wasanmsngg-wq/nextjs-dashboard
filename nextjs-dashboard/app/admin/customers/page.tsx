import { notFound } from "next/navigation";
import { z } from "zod";
import { getAuthorization } from "@/app/lib/authorization";
import { getTranslations } from "@/app/i18n/server";
import Search from "@/app/ui/molecules/search-field";
import CustomersTable from "@/app/ui/features/customers/customer-list";
import { DirectoryTemplate } from "@/app/ui/templates/directory-template";
import { getOperationalServices } from "@/app/lib/operations/factory";
import { runGuardedOperation } from "@/app/lib/operations/guard";
import { getRequestId } from "@/app/lib/operations/request";

const querySchema = z.string().trim().max(80).catch("");

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { supabase, user, isAdmin } = await getAuthorization();
  if (!isAdmin || !user) notFound();
  const query = querySchema.parse((await searchParams).query ?? "");
  let request = supabase
    .from("customers")
    .select("id,name,email,image_url")
    .order("name");
  if (query)
    request = request.or(
      `name.ilike.%${query.replaceAll(/[,%()]/g, "")}%,email.ilike.%${query.replaceAll(/[,%()]/g, "")}%`,
    );
  const { rateLimiter, errorReporter } = getOperationalServices();
  const [result, { t }] = await Promise.all([
    runGuardedOperation({
      key: `${user.id}:${query}`,
      policy: "customerSearch",
      operation: "admin.customer_search",
      rateLimiter,
      errorReporter,
      requestId: await getRequestId(),
      execute: async () => await request,
    }),
    getTranslations(),
  ]);
  if (!result.ok)
    throw new Error(
      result.error === "rate_limited"
        ? "Too many searches. Wait and try again."
        : "The customer directory is temporarily unavailable.",
    );
  const { data, error } = result.value;
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
