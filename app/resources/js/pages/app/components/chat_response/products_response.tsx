import { Package } from 'lucide-react';
import type { ProductData } from '@/types/chat_response';

type ProductsResponseProps = {
    products: ProductData[];
};

export default function ProductsResponse({ products }: ProductsResponseProps) {
    return (
        <div className="min-w-0 space-y-3">
            {products.map((product) => {
                const available = product.stock > 0;
                const image = product.image
                    ? /^(https?:\/\/|\/)/.test(product.image)
                        ? product.image
                        : `/${product.image}`
                    : null;

                return (
                    <article
                        key={product.id}
                        dir="rtl"
                        className="group flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-linear-to-br from-surface-secondary to-brand/5 p-4 transition-colors hover:border-brand/30 sm:flex-row sm:items-center"
                    >
                        <div className="relative flex h-36 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white sm:size-28">
                            <Package
                                size={32}
                                className="text-zinc-300"
                                aria-hidden="true"
                            />
                            {image && (
                                <img
                                    src={image}
                                    alt={product.title}
                                    loading="lazy"
                                    onError={(event) => {
                                        event.currentTarget.hidden = true;
                                    }}
                                    className="absolute inset-0 size-full bg-white object-contain p-3 transition-transform duration-300 motion-safe:group-hover:scale-105"
                                />
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <h3
                                dir="auto"
                                className="line-clamp-2 text-start text-sm leading-6 font-semibold text-foreground"
                            >
                                {product.title}
                            </h3>
                            {product.description && (
                                <p
                                    dir="auto"
                                    className="line-clamp-2 text-start text-xs leading-6 wrap-anywhere text-muted"
                                >
                                    {product.description}
                                </p>
                            )}
                            <span
                                className={`inline-flex items-center gap-1.5 self-start text-xs ${available ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted'}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`size-1.5 shrink-0 rounded-full ${available ? 'bg-emerald-500' : 'bg-zinc-500'}`}
                                />
                                {available
                                    ? `${product.stock.toLocaleString('fa-IR')} عدد موجود`
                                    : 'ناموجود'}
                            </span>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-s sm:border-t-0 sm:ps-5 sm:pt-0">
                            <span className="text-xs text-muted">قیمت</span>
                            <span className="text-lg font-semibold text-brand tabular-nums">
                                {product.price.toLocaleString('fa-IR')}
                            </span>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
