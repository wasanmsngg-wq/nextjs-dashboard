'use client';

import Link from 'next/link';
import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import AcmeLogo from '@/app/ui/acme-logo';
import { useI18n } from '@/app/i18n/provider';
import { IconButton } from '@/app/ui/atoms/icon-button';
import { LanguageSelector } from '@/app/ui/molecules/language-selector';

export function AppHeader({ sidebarOpen, onOpen }: { sidebarOpen: boolean; onOpen: () => void }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
      <IconButton label={t('Open navigation')} onClick={onOpen} aria-controls="application-sidebar" aria-expanded={sidebarOpen}>
        <Bars3Icon className="h-6 w-6" />
      </IconButton>
      <Link href="/" className="ml-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><AcmeLogo compact /></Link>
      <div className="ml-auto flex items-center gap-2">
        <LanguageSelector />
        <IconButton label={t('User profile (coming soon)')} disabled className="rounded-full">
          <UserCircleIcon className="h-8 w-8" />
        </IconButton>
      </div>
    </header>
  );
}
