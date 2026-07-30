import { SkeletonBlock } from "@/app/ui/atoms/skeleton-block";

export default function Loading() {
  return (
    <main className="space-y-4 p-8" aria-busy="true">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-24 w-full" />
      <SkeletonBlock className="h-48 w-full" />
    </main>
  );
}
