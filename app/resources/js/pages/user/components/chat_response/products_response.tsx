import { Package } from 'lucide-react';
import AddToCart from '../cart/add_to_cart';
import { Link, usePage } from '@inertiajs/react';
import { show } from '@/actions/App/Http/Controllers/ProductController';
import type { CartResponse } from '@/types/cart';
import type { ProductData } from '@/types/chat_response';

type ProductsResponseProps = {
    products: ProductData[];
    columns?: 3 | 4 | 5;
};

export default function ProductsResponse({
    products,
    columns = 5,
}: ProductsResponseProps) {
    const layouts = {
        3: '@min-[22rem]:grid-cols-2 @min-[48rem]:grid-cols-3',
        4: '@min-[22rem]:grid-cols-2 @min-[36rem]:grid-cols-3 @min-[48rem]:grid-cols-4',
        5: '@min-[22rem]:grid-cols-2 @min-[36rem]:grid-cols-3 @min-[48rem]:grid-cols-4 @min-[60rem]:grid-cols-5',
    };
    const { cart = [] } = usePage<{ cart?: CartResponse[] }>().props;
    const quantities = new Map(
        cart.map((item) => [item.product.id, item.quantity]),
    );

    return (
        <div className="@container w-full min-w-0">
            <div
                className={`grid min-w-0 grid-cols-1 gap-2 sm:gap-3 ${layouts[columns]}`}
            >
                {products.map((product) => {
                    const quantity = quantities.get(product.id) ?? 0;
                    const remainingStock = Math.max(
                        0,
                        product.stock - quantity,
                    );
                    const available = remainingStock > 0;

                    return (
                        <article
                            key={product.id}
                            dir="ltr"
                            className="group glass-card product-card relative isolate flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl p-3 text-foreground shadow-glass transition-colors hover:border-outline/45"
                        >
                            <div className="relative flex aspect-4/3 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                                <Package
                                    size={32}
                                    className="text-secondary"
                                    aria-hidden="true"
                                />
                                <img
                                    src={product.image_url}
                                    alt={product.title}
                                    loading="lazy"
                                    onError={(event) => {
                                        event.currentTarget.hidden = true;
                                    }}
                                    className="absolute inset-0 size-full bg-white object-contain p-3"
                                />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <h3
                                    dir="auto"
                                    className="line-clamp-2 min-h-12 text-start text-sm leading-6 font-semibold wrap-anywhere text-foreground"
                                >
                                    <Link
                                        href={show(product.id)}
                                        className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-glow"
                                    >
                                        {product.title}
                                    </Link>
                                </h3>
                                <span
                                    className={`inline-flex items-center gap-1.5 self-start text-xs ${available ? 'text-success' : 'text-danger'}`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`size-1.5 shrink-0 rounded-full ${available ? 'bg-success' : 'bg-danger'}`}
                                    />
                                    {available
                                        ? `${remainingStock.toLocaleString('en-US')} available`
                                        : 'Out of stock'}
                                </span>
                            </div>

                            <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-outline/15 pt-3">
                                <AddToCart
                                    product={product}
                                    quantity={quantity}
                                />
                                <span className="text-base font-semibold text-foreground tabular-nums">
                                    {product.price.toLocaleString('en-US')}
                                    <span className="ms-1 text-[10px] font-normal text-muted">
                                        Toman
                                    </span>
                                </span>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
