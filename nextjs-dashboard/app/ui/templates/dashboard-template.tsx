import type {ReactNode} from 'react';
import {lusitana} from '@/app/ui/fonts';

export function DashboardTemplate({title, metrics, chart, activity}: Readonly<{
    title: string;
    metrics: ReactNode;
    chart: ReactNode;
    activity: ReactNode
}>) {
    return <main><h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>{title}</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{metrics}</div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">{chart}{activity}</div>
    </main>;
}
