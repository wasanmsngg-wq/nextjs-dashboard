import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { MetricCard } from '@/app/ui/molecules/metric-card';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default function CardWrapper({
  numberOfCustomers,
  numberOfInvoices,
  totalPendingInvoices,
  totalPaidInvoices,
  labels,
}: {
  numberOfCustomers: number;
  numberOfInvoices: number;
  totalPendingInvoices: string;
  totalPaidInvoices: string;
  labels: { collected: string; pending: string; invoices: string; customers: string };
}) {
  return (
    <>
      <Card title={labels.collected} value={totalPaidInvoices} type="collected" />
      <Card title={labels.pending} value={totalPendingInvoices} type="pending" />
      <Card title={labels.invoices} value={numberOfInvoices} type="invoices" />
      <Card
        title={labels.customers}
        value={numberOfCustomers}
        type="customers"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <MetricCard title={title} value={value} icon={Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null} />
  );
}
