'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HOSPITAL_PAGE_SIZE_OPTIONS } from '@/app/lib/support/pagination';
import { useI18n } from '@/app/i18n/provider';
import { useSupportNavigation } from '@/app/ui/support/support-navigation';

export default function PageSizeSelect({ pageSize }: { pageSize: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const { startNavigation } = useSupportNavigation();
  const { t } = useI18n();

  const updatePageSize = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', value);
    params.set('page', '1');
    startNavigation();
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span>{t('Rows per page')}</span>
      <select
        value={pageSize}
        onChange={(event) => updatePageSize(event.target.value)}
        aria-label={t('Rows per page')}
        className="h-10 rounded-lg border-gray-200 bg-white py-1 pl-3 pr-8 text-sm font-medium text-gray-900 shadow-sm outline-none transition hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {HOSPITAL_PAGE_SIZE_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
}
