import { useState } from 'react';
import { Button } from '@/components/ui';
import { Link, router, usePage } from '@inertiajs/react';
import { PackageSearch, ShoppingBag, ArrowUpDown, LayoutGrid } from 'lucide-react';
import AppLayout from '../layout';
import ListingPage from '../components/listing_page';
import ProductsResponse from '../components/chat_response/products_response';
import PagePagination from '../components/page_pagination';
import { productSchema } from '../components/chat_response/parse_response';
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
    const [density, setDensity] = useState<'comfortable' | 'compact'>('compact');
    const [sorting, setSorting] = useState(false);
    const query = new URLSearchParams(url.split('?')[1] ?? '');
    const sort = query.get('sort');
    function toggleSort() {
        query.delete('page');
        query.delete('min_price');
        query.delete('max_price');
        query.set('sort', sort === 'price_asc' ? 'price_desc' : 'price_asc');
        router.get(shop.url(), Object.fromEntries(query), {
            preserveState: true, preserveScroll: true,
            onStart: () => setSorting(true), onFinish: () => setSorting(false),
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
                                    ...Object.fromEntries(new URLSearchParams(window.location.search)),
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
                {[{ id: null, title: 'همه محصولات' }, ...categories.data].map(
                    (item) => (
                        <Link
                            key={item.id ?? 'all'}
                            href={shop({
                                query: { ...Object.fromEntries([...new URLSearchParams(window.location.search)].filter(([key]) => key !== 'page' && key !== 'category')), ...(item.id ? { category: item.id } : {}) },
                            })}
                            preserveState
                            aria-current={
                                category === item.id ? 'page' : undefined
                            }
                            className={`rounded-xl border px-4 py-2 text-xs leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${category === item.id ? 'border-violet-300/40 bg-violet-400/15 text-violet-200' : 'border-white/8 bg-white/3 text-zinc-400 hover:border-violet-300/25 hover:text-zinc-100'}`}
                        >
                            {item.title}
                        </Link>
                    ),
                )}
            </nav>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" loading={sorting} onClick={toggleSort} startIcon={<ArrowUpDown size={14} />} className="h-9!">
                    {sort === 'price_asc' ? 'قیمت: ارزان‌ترین' : sort === 'price_desc' ? 'قیمت: گران‌ترین' : 'مرتب‌سازی قیمت'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')} startIcon={<LayoutGrid size={14} />} aria-pressed={density === 'compact'} className="h-9!">
                    {density === 'compact' ? 'چیدمان: فشرده' : 'چیدمان: درشت'}
                </Button>
            </div>
            </div>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-zinc-200">
                    {selected?.title ?? 'همه محصولات'}
                </h2>
                <span className="text-xs text-zinc-400">
                    {products.meta.total.toLocaleString('fa-IR')} محصول
                </span>
            </div>
            {items.length > 0 ? (
                <ProductsResponse products={items} density={density} />
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-violet-300/10 bg-white/2 px-5 py-16 text-center text-zinc-400">
                    <PackageSearch
                        size={36}
                        className="text-violet-300/60"
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

Shop.layout = AppLayout;
