'use client';

import { Skeleton, Table, type TableColumnsType } from 'antd';
import type { Hospital } from '@/app/lib/support/definitions';
import { useI18n } from '@/app/i18n/provider';
import RouteLoadingAnnouncer from '@/app/ui/molecules/route-loading-announcer';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

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
  const { t } = useI18n();
  const showSkeleton = loading;
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

export function HospitalSkeleton({ pageSize = 10 }: { pageSize?: number }) {
  return <><RouteLoadingAnnouncer /><HospitalTableView loading pageSize={pageSize} /></>;
}

export function HospitalSearchSkeleton() {
  return <div className={`${shimmer} relative h-11 w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50`}><div className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-200" /><div className="absolute left-11 top-1/2 h-3.5 w-56 max-w-[65%] -translate-y-1/2 rounded bg-gray-200" /></div>;
}

export function HospitalPaginationSkeleton() {
  return <div className={`${shimmer} relative flex overflow-hidden rounded-lg`}><div className="mr-4 h-10 w-10 rounded-md border border-gray-200 bg-gray-100" />{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-10 w-10 border border-gray-200 bg-gray-100 first:rounded-l-md last:rounded-r-md" />)}<div className="ml-4 h-10 w-10 rounded-md border border-gray-200 bg-gray-100" /></div>;
}
