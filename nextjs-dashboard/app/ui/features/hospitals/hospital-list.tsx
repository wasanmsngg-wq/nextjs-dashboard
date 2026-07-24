'use client';

import { Button, Empty, Table, Tag, Typography, type TableColumnsType } from 'antd';
import type { AccreditationStatus, Hospital } from '@/app/lib/support/definitions';
import { useI18n } from '@/app/i18n/provider';
import { HospitalActions } from './hospital-actions';

const colors = { Accredited: 'green', Pending: 'gold', 'Not Accredited': 'default' } as const;

export function HospitalTable({ hospitals, pageSize, pending, onCreate, onView, onEdit, onDelete }: { hospitals: Hospital[]; pageSize: number; pending: boolean; onCreate: () => void; onView: (hospital: Hospital) => void; onEdit: (hospital: Hospital) => void; onDelete: (hospital: Hospital) => void }) {
  const { t } = useI18n();
  const columns: TableColumnsType<Hospital> = [
    { title: t('Hospital'), dataIndex: 'hospitalName', key: 'hospitalName', render: (name, hospital) => <button type="button" className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500" onClick={() => onView(hospital)}><Typography.Text strong>{name}</Typography.Text><span className="mt-0.5 block text-xs text-gray-500">{hospital.city}, {hospital.country}</span></button> },
    { title: t('Type'), dataIndex: 'hospitalType', key: 'hospitalType', render: (value) => <Tag>{t(value)}</Tag> },
    { title: t('Ownership'), dataIndex: 'ownershipType', key: 'ownershipType', render: (value) => t(value) },
    { title: t('Capacity'), dataIndex: 'bedCapacity', key: 'bedCapacity', align: 'right', render: (value) => `${Number(value).toLocaleString()} ${t('beds')}` },
    { title: t('Status'), dataIndex: 'accreditationStatus', key: 'accreditationStatus', render: (value: AccreditationStatus) => <Tag color={colors[value]}>{t(value)}</Tag> },
    { title: '', key: 'actions', width: 56, align: 'center', render: (_, hospital) => <HospitalActions hospital={hospital} onView={() => onView(hospital)} onEdit={() => onEdit(hospital)} onDelete={() => onDelete(hospital)} /> },
  ];
  return <Table<Hospital> rowKey="hospitalId" dataSource={hospitals} columns={columns} pagination={false} loading={pending} scroll={{ x: 720, ...(pageSize > 10 ? { y: 'min(60vh, 640px)' } : {}) }} sticky={pageSize > 10} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No hospitals found')}><Button type="primary" onClick={onCreate}>{t('Add the first hospital')}</Button></Empty> }} />;
}
