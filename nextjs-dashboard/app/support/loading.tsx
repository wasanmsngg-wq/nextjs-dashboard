import {
  HospitalPaginationSkeleton,
  HospitalSearchSkeleton,
  HospitalSkeleton,
} from '@/app/ui/skeletons';
import RouteLoadingAnnouncer from '@/app/ui/route-loading-announcer';

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl">
      <RouteLoadingAnnouncer />
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-blue-50" />
          <div>
            <div className="h-7 w-52 animate-pulse rounded-md bg-gray-200" />
            <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <HospitalSearchSkeleton />
        </div>
        <HospitalSkeleton />
        <div className="flex min-h-20 border-t border-gray-100 px-5 py-5">
          <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-10 w-16 animate-pulse rounded-lg bg-gray-100" />
            </div>
            <HospitalPaginationSkeleton />
          </div>
        </div>
      </section>
    </main>
  );
}
