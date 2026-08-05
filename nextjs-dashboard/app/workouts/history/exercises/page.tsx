import { loadPerformanceExerciseDirectory } from "@/app/features/performance/data/exercise-history";
import { ExerciseDirectory } from "@/app/features/performance/ui/exercise-directory";
import { getTranslations } from "@/app/i18n/server";

export default async function PerformanceExerciseDirectoryPage() {
  const { locale, t } = await getTranslations();
  const exercises = await loadPerformanceExerciseDirectory(locale);
  return <ExerciseDirectory exercises={exercises} t={t} />;
}
