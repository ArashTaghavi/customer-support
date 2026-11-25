import { Head, Link, router } from '@inertiajs/react';
import { Box, FolderTree, Plus, Cuboid } from 'lucide-react';
import { Table, GridSort, StatCard, type TableColumn } from '@/components/ui';
import { index, create, edit, destroy } from '@/routes/admin/products';
import type { Paginated } from '@/types/pagination';
import AdminLayout from '../layout';
import CatalogFilters from '../components/filters';
import Pager from '../components/pager';
import RecordActions from '../components/record_actions';
import type { Category, Collection, Filters, Product } from '../types';

export default function Products({
    products,
    categories,
    filters,
    modelCount,
}: {
    products: Paginated<Product>;
    categories: Collection<Category>;
    filters: Filters;
    modelCount: number;
}) {
    function visit(values: Filters) {
        router.get(
            index.url(),
            { ...filters, ...values },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }
    function sort(field: string, direction: 'asc' | 'desc') {
        visit({ sort: field, direction, page: 1 });
    }
    const heading = (field: string, label: string) => (
        <GridSort
            field={field}
            label={label}
            direction={filters.sort === field ? filters.direction : undefined}
            onSort={sort}
        >
            {label}
        </GridSort>
    );
    const columns: TableColumn<Product>[] = [
        {
            id: 'title',
            header: heading('title', 'Product'),
            rowHeader: true,
            cell: (row) => (
                <div className="flex min-w-48 items-center gap-3">
                    {row.image_url ? (
                        <img
                            src={row.image_url}
                            alt=""
                            className="size-11 rounded-lg border border-border object-cover"
                        />
                    ) : (
                        <span className="grid size-11 place-items-center rounded-lg bg-highlight/5 text-muted">
                            <Box size={20} />
                        </span>
                    )}
                    <span dir="auto">{row.title}</span>
                </div>
            ),
        },
        {
            id: 'category',
            header: 'Category',
            cell: (row) => (
                <span dir="auto">{row.product_category?.title ?? '—'}</span>
            ),
        },
        {
            id: 'price',
            header: heading('price', 'Price'),
            cell: (row) => (
                <span className="tabular-nums">
                    {row.price.toLocaleString()}
                </span>
            ),
        },
        {
            id: 'stock',
            header: heading('stock', 'Stock'),
            cell: (row) => (
                <span className={row.stock ? 'text-success' : 'text-danger'}>
                    {row.stock.toLocaleString()}
                </span>
            ),
        },
        {
            id: 'model',
            header: '3D model',
            cell: (row) =>
                row.model_url ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs text-highlight">
                        <Cuboid size={14} />
                        GLB ready
                    </span>
                ) : (
                    <span className="text-muted">Not uploaded</span>
                ),
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
            <Head title="Products · Catalog" />
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Products</h1>
                    <p className="mt-2 text-sm text-muted">
                        Manage inventory, images and 3D models.
                    </p>
                </div>
                <Link
                    href={create()}
                    className="button-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm"
                >
                    <Plus size={18} />
                    Add product
                </Link>
            </header>
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Products in this view"
                    value={products.meta.total}
                    icon={<Box />}
                />
                <StatCard
                    label="Categories"
                    value={categories.data.length}
                    icon={<FolderTree />}
                />
                <StatCard
                    label="Products with 3D models"
                    value={modelCount}
                    icon={<Cuboid />}
                />
            </div>
            <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface/60">
                <CatalogFilters
                    filters={filters}
                    categories={categories.data}
                    onChange={visit}
                />
                <Table
                    data={products.data}
                    columns={columns}
                    getRowKey={(row) => row.id}
                    caption="Product catalog"
                    tableClassName="min-w-[760px] [&_th]:text-left"
                    emptyState={
                        <div>
                            <p>No products found.</p>
                            <Link
                                href={create()}
                                className="mt-2 inline-block text-highlight underline"
                            >
                                Create a product
                            </Link>
                        </div>
                    }
                />
                <Pager
                    meta={products.meta}
                    onPage={(page) => visit({ page })}
                />
            </section>
        </>
    );
}
Products.layout = AdminLayout;
