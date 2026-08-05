import { loadWorkoutHistory } from "@/app/features/performance/data/history";
import {
  historyFiltersSchema,
  validateHistoryDateRange,
} from "@/app/features/performance/validation";
import { SessionHistory } from "@/app/features/performance/ui/session-history";
import { getTranslations } from "@/app/i18n/server";

export default async function WorkoutHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    exercise?: string;
    page?: string;
  }>;
}) {
  const rawFilters = await searchParams;
  const filters = historyFiltersSchema.parse(rawFilters);
  const filterError = validateHistoryDateRange(filters);
  const safeFilters = filterError
    ? { ...filters, from: undefined, to: undefined }
    : filters;
  const { locale, t } = await getTranslations();
  const result = await loadWorkoutHistory(safeFilters, locale);
  return (
    <SessionHistory
      result={result}
      filters={filters}
      filterError={filterError}
      locale={locale}
      t={t}
    />
  );
}
