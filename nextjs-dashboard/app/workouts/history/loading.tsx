import { SkeletonBlock } from "@/app/ui/atoms/skeleton-block";
import { Surface } from "@/app/ui/atoms/surface";
import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";

export default function WorkoutHistoryLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <RouteLoadingAnnouncer />
      <SkeletonBlock className="h-8 w-36" />
      <SkeletonBlock className="h-24 w-full" />
      <Surface className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-12 w-full" />
        ))}
      </Surface>
      {Array.from({ length: 3 }, (_, index) => (
        <SkeletonBlock key={index} className="h-48 w-full" />
      ))}
    </main>
  );
}
