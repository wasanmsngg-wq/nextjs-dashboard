import type { ReactNode } from 'react';

export function MetricCard({ icon, title, value }: { icon: ReactNode; title: string; value: string | number }) {
  return <article className="rounded-xl bg-gray-50 p-2 shadow-sm"><div className="flex p-4">{icon}<h3 className="ml-2 text-sm font-medium">{title}</h3></div><p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl">{value}</p></article>;
}
