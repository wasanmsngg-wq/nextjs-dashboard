import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getTranslations } from '@/app/i18n/server';

export async function CreateInvoice() {
  const { t } = await getTranslations();
  return (
    <Link
      href="/dashboard/invoices/create"
      aria-label={t('Create Invoice')}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">{t('Create Invoice')}</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export async function UpdateInvoice({ id }: { id: string }) {
  const { t } = await getTranslations();
  return (
    <Link
      href="/dashboard/invoices"
      aria-label={t('Edit invoice')}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export async function DeleteInvoice({ id }: { id: string }) {
  const { t } = await getTranslations();
  return (
    <>
      <button
        type="submit"
        className="rounded-md border p-2 hover:bg-gray-100"
        aria-label={t('Delete invoice')}
      >
        <span className="sr-only">{t('Delete')}</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}
