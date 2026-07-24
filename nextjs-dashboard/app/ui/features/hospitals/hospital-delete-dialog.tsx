'use client';

import type { Hospital } from '@/app/lib/support/definitions';
import { useI18n } from '@/app/i18n/provider';
import { ConfirmDialog } from '@/app/ui/organisms/confirm-dialog';

export function HospitalDeleteDialog({ hospital, pending, onCancel, onConfirm }: { hospital: Hospital | null; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  return <ConfirmDialog open={Boolean(hospital)} title={t('Delete hospital?')} description={hospital ? t('{name} will be permanently removed. This action cannot be undone.', { name: hospital.hospitalName }) : ''} confirmLabel={t('Delete')} cancelLabel={t('Cancel')} pending={pending} onCancel={onCancel} onConfirm={onConfirm} />;
}
