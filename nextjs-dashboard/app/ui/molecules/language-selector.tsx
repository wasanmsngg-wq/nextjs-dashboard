'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Locale } from '@/app/i18n/config';
import { useI18n } from '@/app/i18n/provider';

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className="relative flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 pl-3 pr-2 text-sm focus-within:ring-4 focus-within:ring-blue-100">
      <span className="sr-only">{t('Language')}</span>
      <span aria-hidden="true">{locale === 'th' ? '🇹🇭' : '🇬🇧'}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t('Language')}
        className="min-w-20 cursor-pointer appearance-none border-0 bg-transparent p-0 pr-6 font-medium outline-none ring-0"
      >
        <option value="en">{t('English')}</option>
        <option value="th">{t('Thai')}</option>
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4" aria-hidden="true" />
    </label>
  );
}
