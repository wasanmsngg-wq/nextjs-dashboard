import HospitalTable from "@/app/ui/support/hospital-table";
import Search from "@/app/ui/search";
import {Suspense} from "react";
import {
    HospitalPaginationSkeleton,
    HospitalSkeleton
} from "@/app/ui/skeletons";
import SupportPagination from "@/app/ui/support/support-pagination";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default async function Page({
    searchParams
                             }: Readonly<{
    searchParams: Promise<{
        query?: string;
        page?: string;
    }>
}>){
    const params = await searchParams;
    const query = params.query ?? '';
    const page = Number(params.page) || 1;
    return (
        <main className="mx-auto w-full max-w-7xl">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BuildingOffice2Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Hospital directory
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Search and browse hospitals in your support network.
                        </p>
                    </div>
                </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-5 sm:p-6">
                    <div className="max-w-xl">
                        <Search placeholder="Search by name, type, city, or country" />
                    </div>
                </div>

                <Suspense
                    key={`table-${query}-${page}`}
                    fallback={<HospitalSkeleton/>}
                >
                    <HospitalTable page={page} query={query}/>
                </Suspense>

                <div className="flex min-h-20 items-center justify-center border-t border-gray-100 px-5 py-5">
                    <Suspense
                        key={`pagination-${query}`}
                        fallback={<HospitalPaginationSkeleton/>}
                    >
                        <SupportPagination query={query} />
                    </Suspense>
                </div>
            </section>
        </main>
    )
}
