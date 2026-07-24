import type { ReactNode } from 'react';
import { lusitana } from '@/app/ui/fonts';

export function DirectoryTemplate({ title, description, controls, children, footer, className = 'w-full' }: { title: ReactNode; description?: string; controls?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }) {
  return <main className={className}><header className="mb-8"><h1 className={`${lusitana.className} text-2xl`}>{title}</h1>{description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}</header>{controls ? <div className="mb-4">{controls}</div> : null}{children}{footer}</main>;
}
