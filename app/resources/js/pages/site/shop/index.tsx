import { useState } from 'react';
import { Button } from '@/components/ui';
import { Link, router, usePage } from '@inertiajs/react';
import {
    PackageSearch,
    ShoppingBag,
    ArrowUpDown,
    LayoutGrid,
} from 'lucide-react';
import SiteLayout from '../layout';
import ListingPage from '../../user/components/listing_page';
import ProductsResponse from '../../user/components/chat_response/products_response';
import PagePagination from '../../user/components/page_pagination';
import { productSchema } from '../../user/components/chat_response/parse_response';
import { shop } from '@/routes';
import type { Paginated } from '@/types/pagination';

type Category = { id: number; title: string };
type Props = {
    categories: { data: Category[] };
    products: Paginated<unknown>;
    category: number | null;
};

export default function Shop({ categories, products, category }: Props) {
    const { url } = usePage();
    const [columns, setColumns] = useState<3 | 4 | 5>(5);
    const [sorting, setSorting] = useState(false);
    const query = new URLSearchParams(url.split('?')[1] ?? '');
    const sort = query.get('sort');
    function toggleSort() {
        query.delete('page');
        query.delete('min_price');
        query.delete('max_price');
        query.set('sort', sort === 'price_asc' ? 'price_desc' : 'price_asc');
        router.get(shop.url(), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setSorting(true),
            onFinish: () => setSorting(false),
        });
    }
    const items = productSchema.array().parse(products.data);
    const selected = categories.data.find((item) => item.id === category);
    return (
        <ListingPage
            title="فروشگاه"
            description="دسته‌بندی را انتخاب کنید و محصولات را ببینید."
            icon={ShoppingBag}
            footer={
                <PagePagination
                    meta={products.meta}
                    onPage={(page) =>
                        router.get(
                            shop.url({
                                query: {
                                    ...Object.fromEntries(
                                        new URLSearchParams(
                                            window.location.search,
                                        ),
                                    ),
                                    ...(category ? { category } : {}),
                                    page,
                                },
                            }),
                            {},
                            { preserveState: true },
                        )
                    }
                />
            }
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <nav
                    aria-label="دسته‌بندی محصولات"
                    className="flex min-w-0 flex-1 flex-wrap gap-2"
                >
                    {[
                        { id: null, title: 'همه محصولات' },
                        ...categories.data,
                    ].map((item) => (
                        <Link
                            key={item.id ?? 'all'}
                            href={shop({
                                query: {
                                    ...Object.fromEntries(
                                        [
                                            ...new URLSearchParams(
                                                window.location.search,
                                            ),
                                        ].filter(
                                            ([key]) =>
                                                key !== 'page' &&
                                                key !== 'category',
                                        ),
                                    ),
                                    ...(item.id ? { category: item.id } : {}),
                                },
                            })}
                            preserveState
                            aria-current={
                                category === item.id ? 'page' : undefined
                            }
                            className={`rounded-xl border px-4 py-2 text-xs leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-glow ${category === item.id ? 'border-outline/40 bg-glow/15 text-foreground' : 'border-border/40 bg-highlight/3 text-secondary hover:border-outline/25 hover:text-foreground'}`}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        loading={sorting}
                        onClick={toggleSort}
                        startIcon={<ArrowUpDown size={14} />}
                        className="h-9!"
                    >
                        {sort === 'price_asc'
                            ? 'قیمت: ارزان‌ترین'
                            : sort === 'price_desc'
                              ? 'قیمت: گران‌ترین'
                              : 'مرتب‌سازی قیمت'}
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="border-0!"
                        onClick={() =>
                            setColumns(
                                columns === 5 ? 4 : columns === 4 ? 3 : 5,
                            )
                        }
                        aria-label={`تغییر چیدمان به ${(columns === 5 ? 4 : columns === 4 ? 3 : 5).toLocaleString('fa-IR')} ستون`}
                        tooltip={`تغییر چیدمان به ${(columns === 5 ? 4 : columns === 4 ? 3 : 5).toLocaleString('fa-IR')} ستون`}
                    >
                        <LayoutGrid size={16} aria-hidden="true" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-foreground">
                    {selected?.title ?? 'همه محصولات'}
                </h2>
                <span className="text-xs text-secondary">
                    {products.meta.total.toLocaleString('fa-IR')} محصول
                </span>
            </div>
            {items.length > 0 ? (
                <ProductsResponse products={items} columns={columns} />
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-outline/10 bg-highlight/2 px-5 py-16 text-center text-secondary">
                    <PackageSearch
                        size={36}
                        className="text-foreground/60"
                        aria-hidden="true"
                    />
                    <p className="text-sm">
                        محصولی در این دسته‌بندی وجود ندارد.
                    </p>
                </div>
            )}
        </ListingPage>
    );
}

Shop.layout = SiteLayout;
