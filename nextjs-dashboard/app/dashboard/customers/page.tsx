import { fetchFilteredCustomers } from '@/app/lib/data';
import { getTranslations } from '@/app/i18n/server';
import Search from '@/app/ui/molecules/search-field';
import CustomersTable from '@/app/ui/features/customers/customer-list';
import { DirectoryTemplate } from '@/app/ui/templates/directory-template';

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
    <DirectoryTemplate
      title={t('Customers')}
      description={t('View customers and their invoice totals.')}
      controls={<div className="max-w-xl"><Search placeholder={t('Search customers...')} /></div>}
    >
      <CustomersTable customers={customers} />
    </DirectoryTemplate>
  );
}
