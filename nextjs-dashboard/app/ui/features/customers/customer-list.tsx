import Image from 'next/image';
import { FormattedCustomersTable } from '@/app/lib/definitions';
import { getTranslations } from '@/app/i18n/server';
import { CustomerSummary } from './customer-summary';
import { EmptyState } from '@/app/ui/atoms/empty-state';

export default async function CustomersTable({
  customers,
}: {
  customers: FormattedCustomersTable[];
}) {
  const { t } = await getTranslations();
  return (
    <div className="mt-6 w-full flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {customers?.map((customer) => (
                  <div
                    key={customer.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3">
                            <Image
                              src={customer.image_url}
                              className="rounded-full"
                              alt={t("{name}'s profile picture", { name: customer.name })}
                              width={28}
                              height={28}
                            />
                            <p>{customer.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <CustomerSummary pendingLabel={t('payment.pending')} paidLabel={t('Paid')} pending={customer.total_pending} paid={customer.total_paid} invoiceText={t('{count} invoices', { count: customer.total_invoices })} />
                  </div>
                ))}
              </div>
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      {t('Name')}
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      {t('Email')}
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      {t('Total Invoices')}
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      {t('Total Pending')}
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      {t('Total Paid')}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Image
                            src={customer.image_url}
                            className="rounded-full"
                            alt={t("{name}'s profile picture", { name: customer.name })}
                            width={28}
                            height={28}
                          />
                          <p>{customer.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.email}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.total_invoices}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.total_pending}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {customer.total_paid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 ? (
                <EmptyState title={t('No customers found.')} />
              ) : null}
            </div>
          </div>
        </div>
    </div>
  );
}
