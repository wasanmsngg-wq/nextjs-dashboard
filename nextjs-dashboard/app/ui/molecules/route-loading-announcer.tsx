'use client';

import { useI18n } from '@/app/i18n/provider';

export default function RouteLoadingAnnouncer() {
  const { t } = useI18n();

  return (
    <span className="sr-only" role="status" aria-live="polite">
      {t('Loading...')}
    </span>
  );
}
