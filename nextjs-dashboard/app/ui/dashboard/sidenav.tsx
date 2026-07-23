'use client';

import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useI18n } from '@/app/i18n/provider';

export default function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col px-3 py-4">
      <div className="flex grow flex-col space-y-2">
        <NavLinks onNavigate={onNavigate} />
        <div className="grow" />
        <form>
          <button className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-700 transition hover:bg-sky-50 hover:text-blue-600">
            <PowerIcon className="w-6" />
            <span>{t('Sign Out')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
