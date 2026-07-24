import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      {icon ? <div className="text-gray-400" aria-hidden="true">{icon}</div> : null}
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {description ? <p className="max-w-md text-sm text-gray-500">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
