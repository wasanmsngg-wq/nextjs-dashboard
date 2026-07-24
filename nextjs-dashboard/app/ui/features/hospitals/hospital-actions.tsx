'use client';

import { Button, Dropdown, type MenuProps } from 'antd';
import { EllipsisHorizontalIcon, EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Hospital } from '@/app/lib/support/definitions';
import { useI18n } from '@/app/i18n/provider';

export function HospitalActions({ hospital, onView, onEdit, onDelete }: { hospital: Hospital; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const { t } = useI18n();
  const items: MenuProps['items'] = [
    { key: 'view', icon: <EyeIcon className="h-4 w-4" />, label: t('View details'), onClick: onView },
    { key: 'edit', icon: <PencilSquareIcon className="h-4 w-4" />, label: t('Edit hospital'), onClick: onEdit },
    { type: 'divider' },
    { key: 'delete', danger: true, icon: <TrashIcon className="h-4 w-4" />, label: t('Delete'), onClick: onDelete },
  ];
  return <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight"><Button type="text" icon={<EllipsisHorizontalIcon className="h-5 w-5" />} aria-label={t('Actions for {name}', { name: hospital.hospitalName })} /></Dropdown>;
}
