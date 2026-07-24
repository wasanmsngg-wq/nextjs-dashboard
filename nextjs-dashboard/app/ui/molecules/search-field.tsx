'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useDebouncedCallback} from "use-debounce";
import { useI18n } from '@/app/i18n/provider';
import { withSearchQuery } from '@/app/lib/url-state';

export default function Search({ placeholder }: { placeholder: string }) {

    const searchParams = useSearchParams();
    const pathName = usePathname();
    const {replace} = useRouter();
    const { t } = useI18n();

    const handleSearch = useDebouncedCallback((term:string) => {
        const params = withSearchQuery(new URLSearchParams(searchParams), term);
        const nextUrl = `${pathName}?${params.toString()}`;
        const currentUrl = `${pathName}?${searchParams.toString()}`;

        if (nextUrl !== currentUrl) {
            replace(nextUrl);
        }
    },300);


  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        {t('Search')}
      </label>
      <input
        className="peer block h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition peer-focus:text-blue-600" />
    </div>
  );
}
