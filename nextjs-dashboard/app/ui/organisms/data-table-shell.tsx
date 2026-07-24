import type { ReactNode } from 'react';

export function DataTableShell({ toolbar, children, footer }: { toolbar?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">{toolbar}{children}{footer ? <footer className="border-t border-gray-100 p-4">{footer}</footer> : null}</section>;
}
