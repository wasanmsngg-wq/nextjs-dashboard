'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Bars3Icon,
  ChevronDownIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AcmeLogo from '@/app/ui/acme-logo';
import SideNav from '@/app/ui/dashboard/sidenav';
import { useI18n } from '@/app/i18n/provider';
import type { Locale } from '@/app/i18n/config';

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('Open navigation')}
          aria-controls="application-sidebar"
          aria-expanded={sidebarOpen}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <Link href="/" className="ml-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <AcmeLogo compact />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-0 pl-3 pr-2 text-sm text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <span className="sr-only">{t('Language')}</span>
            <span className="text-base leading-none" aria-hidden="true">
              {locale === 'th' ? '🇹🇭' : '🇬🇧'}
            </span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              aria-label={t('Language')}
              style={{ backgroundImage: 'none' }}
              className="min-w-20 cursor-pointer appearance-none border-0 bg-transparent p-0 pr-6 font-medium text-gray-800 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
            >
              <option value="en">{t('English')}</option>
              <option value="th">{t('Thai')}</option>
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-3 h-4 w-4 text-gray-500"
              aria-hidden="true"
            />
          </label>
          <button
            type="button"
            disabled
            aria-label={t('User profile (coming soon)')}
            className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full text-gray-400"
          >
            <UserCircleIcon className="h-8 w-8" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-gray-950/35 transition-opacity duration-200 ${
          sidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="application-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <AcmeLogo compact />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('Close navigation')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <SideNav onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <main className="p-5 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
