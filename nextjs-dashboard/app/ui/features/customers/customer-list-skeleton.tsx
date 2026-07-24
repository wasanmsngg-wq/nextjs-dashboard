import RouteLoadingAnnouncer from '@/app/ui/molecules/route-loading-announcer';

function SkeletonLabel({ width }: { width: string }) {
  return <span className={`block h-4 animate-pulse rounded bg-gray-200 ${width}`} />;
}
export function CustomersPageSkeleton() {
  return (
    <main className="w-full">
      <RouteLoadingAnnouncer />
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
      <div className="mt-8 h-11 max-w-xl animate-pulse rounded-xl bg-gray-100" />
      <div className="mt-6 overflow-hidden rounded-md bg-gray-50 p-2">
        <div className="space-y-2 md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <CustomerMobileSkeleton key={index} />
          ))}
        </div>
        <table className="hidden min-w-full md:table" aria-hidden="true">
          <thead>
            <tr>
              {['w-16', 'w-14', 'w-24', 'w-24', 'w-20'].map((width, index) => (
                <th key={index} className="px-4 py-5">
                  <SkeletonLabel width={width} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {Array.from({ length: 5 }).map((_, index) => (
              <CustomerTableRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function CustomerMobileSkeleton() {
  return (
    <div className="rounded-md bg-white p-4">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-44 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 py-5">
        <div className="h-10 animate-pulse rounded bg-gray-100" />
        <div className="h-10 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function CustomerTableRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        </div>
      </td>
      {Array.from({ length: 4 }).map((_, index) => (
        <td key={index} className="px-4 py-5">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}
