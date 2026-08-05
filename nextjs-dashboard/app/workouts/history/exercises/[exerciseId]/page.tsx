import { notFound } from "next/navigation";
import { loadExerciseHistory } from "@/app/features/performance/data/exercise-history";
import { ExerciseHistory } from "@/app/features/performance/ui/exercise-history";
import { exerciseHistoryParamsSchema } from "@/app/features/performance/validation";
import { getTranslations } from "@/app/i18n/server";

export default async function ExerciseHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const parsed = exerciseHistoryParamsSchema.safeParse({
    ...(await params),
    page: (await searchParams).page,
  });
  if (!parsed.success) notFound();
  const { locale, t } = await getTranslations();
  const result = await loadExerciseHistory(
    parsed.data.exerciseId,
    parsed.data.page,
    locale,
  );
  return <ExerciseHistory result={result} locale={locale} t={t} />;
}
