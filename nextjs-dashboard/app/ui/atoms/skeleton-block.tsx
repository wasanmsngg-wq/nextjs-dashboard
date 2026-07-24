import clsx from 'clsx';

export function SkeletonBlock({ className }: { className?: string }) {
  return <span aria-hidden="true" className={clsx('block animate-pulse rounded-md bg-gray-200', className)} />;
}
