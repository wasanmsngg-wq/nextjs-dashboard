import clsx from 'clsx';
import type { ReactNode } from 'react';

const tones = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-700',
};

export function StatusBadge({
  children,
  icon,
  tone = 'neutral',
}: {
  children: ReactNode;
  icon?: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs', tones[tone])}>
      {icon}
      {children}
    </span>
  );
}
