import { SkeletonBlock } from "@/app/ui/atoms/skeleton-block";
import { Surface } from "@/app/ui/atoms/surface";
import RouteLoadingAnnouncer from "@/app/ui/molecules/route-loading-announcer";

export default function WorkoutProgressLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <RouteLoadingAnnouncer />
      <SkeletonBlock className="h-8 w-36" />
      <SkeletonBlock className="h-24 w-full" />
      <Surface className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock key={index} className="h-12 w-full" />
        ))}
      </Surface>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-72 w-full" />
        ))}
      </div>
    </main>
  );
}
