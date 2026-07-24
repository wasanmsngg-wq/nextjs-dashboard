import Image from 'next/image';
import { UpdateInvoice, DeleteInvoice } from '@/app/ui/features/invoices/invoice-actions';
import InvoiceStatus from '@/app/ui/features/invoices/invoice-status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { getTranslations } from '@/app/i18n/server';
import type { InvoicesTable as InvoiceRow } from '@/app/lib/definitions';

export default async function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const { locale, t } = await getTranslations();
  const dateLocale = locale === 'th' ? 'th-TH' : 'en-US';

  return (
    <div className="mt-6 flow-root overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="lg:hidden">
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={invoice.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={t("{name}'s profile picture", { name: invoice.name })}
                      />
                      <p>{invoice.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p>{formatDateToLocal(invoice.date, dateLocale)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 lg:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  {t('Customer')}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t('Email')}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t('Amount')}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t('Date')}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t('Status')}
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">{t('Actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={invoice.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={t("{name}'s profile picture", { name: invoice.name })}
                      />
                      <p>{invoice.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {invoice.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(invoice.date, dateLocale)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 ? (
            <div className="rounded-md bg-white px-6 py-12 text-center text-sm text-gray-500">
              {t('No invoices found.')}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
