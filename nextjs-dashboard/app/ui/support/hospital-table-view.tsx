'use client';

import { Skeleton, Table, type TableColumnsType } from 'antd';
import type { Hospital } from '@/app/lib/support/definitions';
import { useSupportNavigation } from '@/app/ui/support/support-navigation';

const hospitalColumns: TableColumnsType<Hospital> = [
  {
    title: 'Hospital',
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
    title: 'Type',
    dataIndex: 'hospitalType',
    key: 'hospitalType',
    render: () => <Skeleton.Input active size="small" style={{ width: 88 }} />,
  },
  {
    title: 'Ownership',
    dataIndex: 'ownershipType',
    key: 'ownershipType',
    render: () => <Skeleton.Input active size="small" style={{ width: 92 }} />,
  },
  {
    title: 'Capacity',
    dataIndex: 'bedCapacity',
    key: 'bedCapacity',
    align: 'right',
    render: () => <Skeleton.Input active size="small" style={{ width: 76 }} />,
  },
  {
    title: 'Status',
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

const skeletonRows = Array.from({ length: 6 }, (_, index) => ({
  hospitalId: -(index + 1),
})) as Hospital[];

export default function HospitalTableView({
  hospitals,
  loading = false,
}: {
  hospitals?: Hospital[];
  loading?: boolean;
}) {
  const { isNavigating } = useSupportNavigation();
  const showSkeleton = loading || isNavigating;

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
        columns={hospitalColumns}
        pagination={false}
        scroll={{ x: 720 }}
        locale={{ emptyText: 'No hospitals found' }}
      />
    </div>
  );
}
