import { SkeletonBlock } from "@/app/ui/atoms/skeleton-block";
import { Surface } from "@/app/ui/atoms/surface";
import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";

export default function PerformanceExerciseDirectoryLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <RouteLoadingAnnouncer />
      <SkeletonBlock className="h-8 w-36" />
      <SkeletonBlock className="h-24 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Surface key={index} className="space-y-4">
            <SkeletonBlock className="h-6 w-3/4" />
            <SkeletonBlock className="h-8 w-36" />
          </Surface>
        ))}
      </div>
    </main>
  );
}
