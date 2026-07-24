import Pagination from '@/app/ui/molecules/pagination';
import Search from '@/app/ui/molecules/search-field';
import Table from '@/app/ui/features/invoices/invoice-list';
import {CreateInvoice} from '@/app/ui/features/invoices/invoice-actions';
import {InvoicesTableSkeleton} from '@/app/ui/features/invoices/invoice-list-skeleton';
import {Suspense} from 'react';
import {fetchFilteredInvoices, fetchInvoicesPages} from "@/app/lib/data";
import {getTranslations} from '@/app/i18n/server';
import {DirectoryTemplate} from '@/app/ui/templates/directory-template';

async function InvoiceListSection({query, currentPage}: Readonly<{ query: string; currentPage: number }>) {
    const invoices = await fetchFilteredInvoices(query, currentPage);
    return <Table invoices={invoices}/>;
}

export default async function Page(props: Readonly<{
    searchParams?: Promise<{
        query?: string; page?: string;
    }>
}>) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchInvoicesPages(query);
    const {t} = await getTranslations();
    return (<DirectoryTemplate
        title={t('Invoices')}
        controls={<div className="flex items-center justify-between gap-2">
            <Search placeholder={t('Search invoices...')}/>
            <CreateInvoice/>
        </div>}
        footer={<div className="mt-5 flex w-full justify-center"><Pagination totalPages={totalPages}/></div>}
    >
        <Suspense
            key={query + currentPage}
            fallback={<InvoicesTableSkeleton
                labels={{
                    customer: t('Customer'),
                    email: t('Email'),
                    amount: t('Amount'),
                    date: t('Date'),
                    status: t('Status'),
                    actions: t('Actions'),
                }}
            />}
        >
            <InvoiceListSection query={query} currentPage={currentPage}/>
        </Suspense>
    </DirectoryTemplate>);
}
