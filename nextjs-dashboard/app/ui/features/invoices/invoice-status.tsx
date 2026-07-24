import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getTranslations } from '@/app/i18n/server';
import { StatusBadge } from '@/app/ui/atoms/status-badge';

export default async function InvoiceStatus({ status }: { status: string }) {
  const { t } = await getTranslations();
  return (
    status === 'paid'
      ? <StatusBadge tone="success" icon={<CheckIcon className="w-4" />}>{t('Paid')}</StatusBadge>
      : <StatusBadge tone="warning" icon={<ClockIcon className="w-4" />}>{t('payment.pending')}</StatusBadge>
  );
}
