// Loading animation
import HospitalTableView from '@/app/ui/support/hospital-table-view';
import RouteLoadingAnnouncer from '@/app/ui/route-loading-announcer';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="rounded-xl bg-gray-100 p-4">
        <div className="sm:grid-cols-13 mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
        <div className="bg-white px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <RouteLoadingAnnouncer />
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Customer Name and Image */}
      <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-100"></div>
      </td>
      {/* Amount */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Date */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Status */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function InvoicesMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
          <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}

export function InvoicesTableSkeleton({
  labels = {
    customer: 'Customer',
    email: 'Email',
    amount: 'Amount',
    date: 'Date',
    status: 'Status',
    actions: 'Actions',
  },
  showLabels = true,
}: {
  labels?: {
    customer: string;
    email: string;
    amount: string;
    date: string;
    status: string;
    actions: string;
  };
  showLabels?: boolean;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table
            className="hidden min-w-full text-gray-900 md:table"
            aria-hidden={!showLabels}
          >
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  {showLabels ? labels.customer : <SkeletonLabel width="w-20" />}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {showLabels ? labels.email : <SkeletonLabel width="w-14" />}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {showLabels ? labels.amount : <SkeletonLabel width="w-16" />}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {showLabels ? labels.date : <SkeletonLabel width="w-12" />}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {showLabels ? labels.status : <SkeletonLabel width="w-14" />}
                </th>
                <th
                  scope="col"
                  className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6"
                >
                  <span className="sr-only">{labels.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function HospitalSkeleton({ pageSize = 10 }: { pageSize?: number }) {
  return (
    <>
      <RouteLoadingAnnouncer />
      <HospitalTableView loading pageSize={pageSize} />
    </>
  );
}

function SkeletonLabel({ width }: { width: string }) {
  return <span className={`block h-4 animate-pulse rounded bg-gray-200 ${width}`} />;
}

export function LandingPageSkeleton() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <RouteLoadingAnnouncer />
      <div className="h-20 shrink-0 animate-pulse rounded-lg bg-blue-200 md:h-52" />
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

export function InvoicesPageSkeleton() {
  return (
    <div className="w-full">
      <RouteLoadingAnnouncer />
      <div className="h-8 w-28 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="h-11 max-w-xl flex-1 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-10 w-12 animate-pulse rounded-lg bg-blue-100 md:w-40" />
      </div>
      <InvoicesTableSkeleton showLabels={false} />
      <PaginationSkeleton />
    </div>
  );
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

function PaginationSkeleton() {
  return (
    <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-10 w-10 animate-pulse rounded-md border border-gray-100 bg-gray-100"
        />
      ))}
    </div>
  );
}

export function HospitalSearchSkeleton() {
  return (
    <div className={`${shimmer} relative h-11 w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50`}>
      <div className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-200" />
      <div className="absolute left-11 top-1/2 h-3.5 w-56 max-w-[65%] -translate-y-1/2 rounded bg-gray-200" />
    </div>
  );
}

export function HospitalPaginationSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex overflow-hidden rounded-lg`}
    >
      <RouteLoadingAnnouncer />
      <div className="mr-4 h-10 w-10 rounded-md border border-gray-200 bg-gray-100" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-10 w-10 border border-gray-200 bg-gray-100 first:rounded-l-md last:rounded-r-md"
        />
      ))}
      <div className="ml-4 h-10 w-10 rounded-md border border-gray-200 bg-gray-100" />
    </div>
  );
}

