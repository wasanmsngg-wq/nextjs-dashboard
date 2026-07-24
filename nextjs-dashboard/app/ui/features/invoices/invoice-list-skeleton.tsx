import RouteLoadingAnnouncer from '@/app/ui/molecules/route-loading-announcer';

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
          <div className="lg:hidden">
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table
            className="hidden min-w-full text-gray-900 lg:table"
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

function SkeletonLabel({ width }: { width: string }) {
  return <span className={`block h-4 animate-pulse rounded bg-gray-200 ${width}`} />;
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
