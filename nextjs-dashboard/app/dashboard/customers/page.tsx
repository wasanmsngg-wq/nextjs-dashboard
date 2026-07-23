import { fetchFilteredCustomers } from '@/app/lib/data';
import { getTranslations } from '@/app/i18n/server';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import CustomersTable from '@/app/ui/customers/table';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query ?? '';
  const [customers, { t }] = await Promise.all([
    fetchFilteredCustomers(query),
    getTranslations(),
  ]);

  return (
    <main className="w-full">
      <div className="mb-8">
        <h1 className={`${lusitana.className} text-2xl`}>{t('Customers')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('View customers and their invoice totals.')}
        </p>
      </div>
      <div className="max-w-xl">
        <Search placeholder={t('Search customers...')} />
      </div>
      <CustomersTable customers={customers} />
    </main>
  );
}
