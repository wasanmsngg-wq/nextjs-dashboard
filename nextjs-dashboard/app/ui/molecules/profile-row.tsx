import type { ReactNode } from 'react';

export function ProfileRow({ icon, label, value, children }: { icon?: ReactNode; label: string; value?: ReactNode; children?: ReactNode }) {
  return <div className="flex gap-3 py-3"><div className="mt-0.5 text-gray-400" aria-hidden="true">{icon}</div><div className="min-w-0"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 break-words text-sm text-gray-900">{children ?? value}</div></div></div>;
}
