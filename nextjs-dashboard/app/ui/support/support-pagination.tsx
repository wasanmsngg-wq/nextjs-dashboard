import Pagination from '@/app/ui/invoices/pagination';
import { fetchHospitalPages } from '@/app/lib/support/data';
import PageSizeSelect from '@/app/ui/support/page-size-select';

export default async function SupportPagination({
  query,
  pageSize,
}: {
  query: string;
  pageSize: number;
}) {
  const totalPages = await fetchHospitalPages(query, pageSize);

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
      <PageSizeSelect pageSize={pageSize} />
      {totalPages > 1 ? <Pagination totalPages={totalPages} /> : <div />}
    </div>
  );
}
