import { requireAdministrator } from "@/app/features/admin/data";
import { CategoryManager } from "@/app/features/admin/ui/category-manager";
import { getTranslations } from "@/app/i18n/server";
import { PageHeading } from "@/app/ui/molecules/page-heading";

export default async function AdminCategoriesPage() {
  const [{ supabase }, { t }] = await Promise.all([
    requireAdministrator(),
    getTranslations(),
  ]);
  const { data, error } = await supabase
    .from("exercise_categories")
    .select("key,name_en,name_th,sort_order,archived_at")
    .order("sort_order")
    .order("key");
  if (error)
    throw new Error("Exercise categories are temporarily unavailable.");
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <PageHeading
        eyebrow={t("Master data")}
        title={t("Exercise categories")}
        description={t(
          "Maintain the bilingual category suggestions used when exercises are created.",
        )}
      />
      <CategoryManager
        categories={(data ?? []).map((category) => ({
          key: category.key,
          nameEn: category.name_en,
          nameTh: category.name_th,
          sortOrder: category.sort_order,
          archived: Boolean(category.archived_at),
        }))}
      />
    </main>
  );
}
