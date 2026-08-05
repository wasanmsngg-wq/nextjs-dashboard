import { SkeletonBlock } from "@/app/ui/atoms/skeleton-block";
import { Surface } from "@/app/ui/atoms/surface";
import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";

export default function ExerciseHistoryLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <RouteLoadingAnnouncer />
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-24 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Surface key={index}>
            <SkeletonBlock className="h-20 w-full" />
          </Surface>
        ))}
      </div>
      <SkeletonBlock className="h-64 w-full" />
    </main>
  );
}
