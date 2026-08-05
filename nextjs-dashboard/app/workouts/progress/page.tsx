import { loadPerformanceProgress } from "@/app/features/performance/data/progress";
import { ProgressDashboard } from "@/app/features/performance/ui/progress-dashboard";
import { progressFiltersSchema } from "@/app/features/performance/validation";
import { getTranslations } from "@/app/i18n/server";

export default async function WorkoutProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ weeks?: string; exercise?: string }>;
}) {
  const filters = progressFiltersSchema.parse(await searchParams);
  const { locale, t } = await getTranslations();
  const result = await loadPerformanceProgress(filters, locale);
  return (
    <ProgressDashboard
      result={result}
      selectedWeeks={filters.weeks}
      locale={locale}
      t={t}
    />
  );
}
