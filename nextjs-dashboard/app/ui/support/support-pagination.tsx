import Pagination from '@/app/ui/invoices/pagination';
import { fetchHospitalPages } from '@/app/lib/support/data';

export default async function SupportPagination({ query }: { query: string }) {
  const totalPages = await fetchHospitalPages(query);

  if (totalPages <= 1) {
    return null;
  }

  return <Pagination totalPages={totalPages} />;
}
