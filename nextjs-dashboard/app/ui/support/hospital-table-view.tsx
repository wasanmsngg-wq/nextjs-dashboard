'use client';

import { Skeleton, Table, type TableColumnsType } from 'antd';
import type { Hospital } from '@/app/lib/support/definitions';
import { useSupportNavigation } from '@/app/ui/support/support-navigation';
import { useI18n } from '@/app/i18n/provider';

const getHospitalColumns = (t: (key: string) => string): TableColumnsType<Hospital> => [
  {
    title: t('Hospital'),
    dataIndex: 'hospitalName',
    key: 'hospitalName',
    render: () => (
      <div className="space-y-2">
        <Skeleton.Input active size="small" style={{ width: 210 }} />
        <Skeleton.Input active size="small" style={{ width: 120, height: 12 }} />
      </div>
    ),
  },
  {
    title: t('Type'),
    dataIndex: 'hospitalType',
    key: 'hospitalType',
    render: () => <Skeleton.Input active size="small" style={{ width: 88 }} />,
  },
  {
    title: t('Ownership'),
    dataIndex: 'ownershipType',
    key: 'ownershipType',
    render: () => <Skeleton.Input active size="small" style={{ width: 92 }} />,
  },
  {
    title: t('Capacity'),
    dataIndex: 'bedCapacity',
    key: 'bedCapacity',
    align: 'right',
    render: () => <Skeleton.Input active size="small" style={{ width: 76 }} />,
  },
  {
    title: t('Status'),
    dataIndex: 'accreditationStatus',
    key: 'accreditationStatus',
    render: () => <Skeleton.Input active size="small" style={{ width: 96 }} />,
  },
  {
    title: '',
    key: 'actions',
    width: 56,
    align: 'center',
    render: () => (
      <Skeleton.Button active shape="circle" size="small" />
    ),
  },
];

export default function HospitalTableView({
  hospitals,
  loading = false,
  pageSize = 10,
}: {
  hospitals?: Hospital[];
  loading?: boolean;
  pageSize?: number;
}) {
  const { isNavigating } = useSupportNavigation();
  const { t } = useI18n();
  const showSkeleton = loading || isNavigating;
  const skeletonRows = Array.from(
    { length: Math.min(pageSize, 10) },
    (_, index) => ({ hospitalId: -(index + 1) }),
  ) as Hospital[];

  return (
    <div className="overflow-hidden" aria-busy={showSkeleton}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
        <div className="space-y-2">
          <Skeleton.Input active size="small" style={{ width: 72 }} />
          <Skeleton.Input active size="small" style={{ width: 126, height: 12 }} />
        </div>
        <Skeleton.Button active style={{ width: 124, height: 32 }} />
      </div>
      <Table<Hospital>
        rowKey="hospitalId"
        dataSource={showSkeleton ? skeletonRows : hospitals}
        columns={getHospitalColumns(t)}
        pagination={false}
        scroll={{ x: 720 }}
        locale={{ emptyText: t('No hospitals found') }}
      />
    </div>
  );
}
