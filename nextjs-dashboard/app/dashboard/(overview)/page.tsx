import CardWrapper, { Card } from '@/app/ui/features/dashboard/metric-cards';
import RevenueChart from '@/app/ui/features/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/features/dashboard/latest-invoices';
import {Suspense} from "react";
import {CardsSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton} from "@/app/ui/features/dashboard/dashboard-skeleton";
import { getTranslations } from '@/app/i18n/server';
import { DashboardTemplate } from '@/app/ui/templates/dashboard-template';
import { fetchCardData, fetchLatestInvoices, fetchRevenue } from '@/app/lib/data';

async function MetricSection() {
  const [data, { t }] = await Promise.all([fetchCardData(), getTranslations()]);
  return <CardWrapper {...data} labels={{ collected: t('Collected'), pending: t('payment.pending'), invoices: t('Total Invoices'), customers: t('Total Customers') }} />;
}

async function RevenueSection() {
  const [revenue, { t }] = await Promise.all([fetchRevenue(), getTranslations()]);
  const months = Object.fromEntries(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month) => [month, t(month)]));
  return <RevenueChart revenue={revenue} labels={{ empty: t('No data available.'), title: t('Recent Revenue'), period: t('Last 12 months'), months }} />;
}

async function LatestSection() {
  const [latestInvoices, { t }] = await Promise.all([fetchLatestInvoices(), getTranslations()]);
  return <LatestInvoices latestInvoices={latestInvoices} labels={{ title: t('Latest Invoices'), updated: t('Updated just now'), imageAlt: (name) => t("{name}'s profile picture", { name }) }} />;
}

export default async function Page() {
  const { t } = await getTranslations();
  return (
    <DashboardTemplate
      title={t('Dashboard')}
      metrics={
        <Suspense fallback={<CardsSkeleton/>}>
            <MetricSection />
        </Suspense>
      }
      chart={
          <Suspense fallback={<RevenueChartSkeleton/>}>
              <RevenueSection />
          </Suspense>
      }
      activity={
          <Suspense fallback={<LatestInvoicesSkeleton/>}>
              <LatestSection />
          </Suspense>
      }
    />
  );
}
