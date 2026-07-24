'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { withPageSize } from '@/app/lib/url-state';

export function PageSizeSelector({
  value,
  options,
  label,
  onNavigate,
}: {
  value: number;
  options: readonly number[];
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span>{label}</span>
      <select
        value={value}
        aria-label={label}
        onChange={(event) => {
          const next = Number(event.target.value);
          const params = withPageSize(new URLSearchParams(searchParams), next, options);
          if (!options.includes(next)) return;
          onNavigate?.();
          replace(`${pathname}?${params}`);
        }}
        className="h-10 rounded-lg border-gray-200 bg-white py-1 pl-3 pr-8 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
