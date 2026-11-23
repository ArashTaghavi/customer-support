import { Link, router } from '@inertiajs/react';
import { PackageSearch, ShoppingBag } from 'lucide-react';
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
            <nav
                aria-label="دسته‌بندی محصولات"
                className="flex flex-wrap gap-2"
            >
                {[{ id: null, title: 'همه محصولات' }, ...categories.data].map(
                    (item) => (
                        <Link
                            key={item.id ?? 'all'}
                            href={shop({
                                query: item.id ? { category: item.id } : {},
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
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-zinc-200">
                    {selected?.title ?? 'همه محصولات'}
                </h2>
                <span className="text-xs text-zinc-400">
                    {products.meta.total.toLocaleString('fa-IR')} محصول
                </span>
            </div>
            {items.length > 0 ? (
                <ProductsResponse products={items} />
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
