import HospitalManager from "@/app/ui/features/hospitals/hospital-manager";
import Search from "@/app/ui/molecules/search-field";
import {Suspense} from "react";
import {
    HospitalPaginationSkeleton,
    HospitalSkeleton
} from "@/app/ui/features/hospitals/hospital-list-skeleton";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { getTranslations } from '@/app/i18n/server';
import { normalizeHospitalPageSize } from '@/app/lib/support/pagination';
import { DirectoryTemplate } from '@/app/ui/templates/directory-template';
import { fetchHospitalPages, fetchHospitals } from '@/app/lib/support/data';
import { PageSizeSelector } from '@/app/ui/molecules/page-size-selector';
import Pagination from '@/app/ui/molecules/pagination';
import { HOSPITAL_PAGE_SIZE_OPTIONS } from '@/app/lib/support/pagination';
import { DataTableShell } from '@/app/ui/organisms/data-table-shell';

async function HospitalListSection({ query, page, pageSize }: { query: string; page: number; pageSize: number }) {
    const hospitals = await fetchHospitals(query, page, pageSize);
    return <HospitalManager hospitals={hospitals} pageSize={pageSize} />;
}

async function HospitalPaginationSection({ query, pageSize, label }: { query: string; pageSize: number; label: string }) {
    const totalPages = await fetchHospitalPages(query, pageSize);
    return <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row"><PageSizeSelector value={pageSize} options={HOSPITAL_PAGE_SIZE_OPTIONS} label={label} />{totalPages > 1 ? <Pagination totalPages={totalPages} /> : <div />}</div>;
}

export default async function Page({
    searchParams
                             }: Readonly<{
    searchParams: Promise<{
        query?: string;
        page?: string;
        pageSize?: string;
    }>
}>){
    const params = await searchParams;
    const { t } = await getTranslations();
    const query = params.query ?? '';
    const requestedPage = Number(params.page);
    const page =
        Number.isInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;
    const pageSize = normalizeHospitalPageSize(params.pageSize);
    return (
        <DirectoryTemplate
            className="mx-auto w-full max-w-7xl"
            title={<span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BuildingOffice2Icon className="h-6 w-6" />
                    </span>
                    <span>{t('Hospital directory')}</span>
                </span>}
            description={t('Search and manage hospitals in your support network.')}
        >
            <DataTableShell
                toolbar={<div className="border-b border-gray-100 p-5 sm:p-6">
                    <div className="max-w-xl">
                        <Search placeholder={t('Search by name, type, city, or country')} />
                    </div>
                </div>}
                footer={<div className="flex min-h-20 items-center justify-center px-1 py-1">
                    <Suspense
                        key={`pagination-${query}-${pageSize}`}
                        fallback={<HospitalPaginationSkeleton/>}
                    >
                        <HospitalPaginationSection query={query} pageSize={pageSize} label={t('Rows per page')} />
                    </Suspense>
                </div>}
            >

                <Suspense
                    key={`table-${query}-${page}-${pageSize}`}
                    fallback={<HospitalSkeleton pageSize={pageSize}/>}
                >
                    <HospitalListSection page={page} pageSize={pageSize} query={query}/>
                </Suspense>

            </DataTableShell>
        </DirectoryTemplate>
    )
}
