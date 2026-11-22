import { Check, Package } from 'lucide-react';
import AddToCart from '../cart/add_to_cart';
import { usePage } from '@inertiajs/react';
import type { CartResponse } from '@/types/cart';
import type { ProductData } from '@/types/chat_response';

type ProductsResponseProps = {
    products: ProductData[];
};

export default function ProductsResponse({ products }: ProductsResponseProps) {
    const { cart = [] } = usePage<{ cart: CartResponse[] }>().props;
    const quantities = new Map(
        cart.map((item) => [item.product.id, item.quantity]),
    );

    return (
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:gap-3 @min-[22rem]:grid-cols-2 @min-[36rem]:grid-cols-3 @min-[48rem]:grid-cols-4 @min-[60rem]:grid-cols-5">
            {products.map((product) => {
                const quantity = quantities.get(product.id) ?? 0;
                const remainingStock = Math.max(0, product.stock - quantity);
                const available = remainingStock > 0;

                return (
                    <article
                        key={product.id}
                        dir="rtl"
                        className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-linear-to-br from-surface-secondary to-brand/5 p-3 transition-colors hover:border-brand/30"
                    >
                        <div className="relative flex aspect-4/3 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                            <Package
                                size={32}
                                className="text-zinc-300"
                                aria-hidden="true"
                            />
                            <img
                                src={product.image_url}
                                alt={product.title}
                                loading="lazy"
                                onError={(event) => {
                                    event.currentTarget.hidden = true;
                                }}
                                className="absolute inset-0 size-full bg-white object-contain p-3 transition-transform duration-300 motion-safe:group-hover:scale-105"
                            />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <h3
                                dir="auto"
                                className="line-clamp-2 min-h-12 text-start text-sm leading-6 font-semibold wrap-anywhere text-foreground"
                            >
                                {product.title}
                            </h3>
                            <span
                                className={`inline-flex items-center gap-1.5 self-start text-xs ${available ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted'}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`size-1.5 shrink-0 rounded-full ${available ? 'bg-emerald-500' : 'bg-zinc-500'}`}
                                />
                                {available
                                    ? `${remainingStock.toLocaleString('fa-IR')} عدد موجود`
                                    : 'ناموجود'}
                            </span>
                            {quantity > 0 && (
                                <span className="inline-flex items-center gap-1.5 self-start rounded-lg border border-brand/20 bg-brand/10 px-2 py-1 text-[11px] font-medium text-brand">
                                    <Check size={13} aria-hidden="true" />
                                    {quantity.toLocaleString('fa-IR')} عدد در
                                    سبد خرید
                                </span>
                            )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                            <AddToCart product={product} quantity={quantity} />
                            <span className="text-base font-semibold text-brand tabular-nums">
                                {product.price.toLocaleString('fa-IR')}
                                <span className="ms-1 text-[10px] font-normal text-muted">
                                    تومان
                                </span>
                            </span>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
