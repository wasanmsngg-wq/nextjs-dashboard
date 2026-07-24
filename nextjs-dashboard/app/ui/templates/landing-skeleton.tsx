import RouteLoadingAnnouncer from '@/app/ui/molecules/route-loading-announcer';
import { SkeletonBlock } from '@/app/ui/atoms/skeleton-block';

export function LandingPageSkeleton() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <RouteLoadingAnnouncer />
      <SkeletonBlock className="h-20 shrink-0 rounded-lg bg-blue-200 md:h-52" />
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div className="h-7 w-7 animate-pulse rounded bg-gray-300" />
          <div className="space-y-3">
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-12 w-40 animate-pulse rounded-lg bg-blue-200" />
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="aspect-[4/3] w-full max-w-2xl animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    </main>
  );
}
