import { SkeletonBlock } from "@/app/ui/atoms/skeleton-block";

export function AdminLoading() {
  return (
    <main className="mx-auto max-w-7xl space-y-6" aria-busy="true">
      <SkeletonBlock className="h-10 w-64" />
      <SkeletonBlock className="h-20 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-48 w-full" />
      </div>
    </main>
  );
}
