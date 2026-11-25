import { Head, Link, router } from '@inertiajs/react';
import { Plus, FolderTree } from 'lucide-react';
import { Table, GridSort, type TableColumn } from '@/components/ui';
import {
    index,
    create,
    edit,
    destroy,
} from '@/routes/admin/product-categories';
import type { Paginated } from '@/types/pagination';
import AdminLayout from '../layout';
import CatalogFilters from '../components/filters';
import Pager from '../components/pager';
import RecordActions from '../components/record_actions';
import type { Category, Filters } from '../types';

export default function Categories({
    categories,
    filters,
}: {
    categories: Paginated<Category>;
    filters: Filters;
}) {
    function visit(values: Filters) {
        router.get(
            index.url(),
            { ...filters, ...values },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }
    const heading = (field: string, label: string) => (
        <GridSort
            field={field}
            label={label}
            direction={filters.sort === field ? filters.direction : undefined}
            onSort={(sort, direction) => visit({ sort, direction, page: 1 })}
        >
            {label}
        </GridSort>
    );
    const columns: TableColumn<Category>[] = [
        {
            id: 'title',
            header: heading('title', 'Category'),
            rowHeader: true,
            cell: (row) => (
                <span className="flex items-center gap-3">
                    <FolderTree size={18} className="text-highlight" />
                    <span dir="auto">{row.title}</span>
                </span>
            ),
        },
        {
            id: 'count',
            header: heading('product_count', 'Products'),
            cell: (row) => row.product_count.toLocaleString(),
        },
        {
            id: 'showroom',
            header: 'Showroom table',
            cell: (row) => row.showroom_slot ?? 'Not assigned',
        },
        {
            id: 'created',
            header: 'Created',
            cell: (row) =>
                row.created_at
                    ? new Date(row.created_at).toLocaleDateString()
                    : '—',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (row) => (
                <RecordActions
                    title={row.title}
                    editUrl={edit.url(row.id)}
                    deleteUrl={destroy.url(row.id)}
                />
            ),
        },
    ];
    return (
        <>
            <Head title="Categories · Catalog" />
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <p className="mt-2 text-sm text-muted">
                        Organize your products. Product counts update
                        automatically.
                    </p>
                </div>
                <Link
                    href={create()}
                    className="button-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm"
                >
                    <Plus size={18} />
                    Add category
                </Link>
            </header>
            <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface/60">
                <CatalogFilters filters={filters} onChange={visit} />
                <Table
                    data={categories.data}
                    columns={columns}
                    getRowKey={(row) => row.id}
                    caption="Product categories"
                    tableClassName="min-w-[560px] [&_th]:text-left"
                    emptyState="No categories found. Create your first category to get started."
                />
                <Pager
                    meta={categories.meta}
                    onPage={(page) => visit({ page })}
                />
            </section>
        </>
    );
}
Categories.layout = AdminLayout;
