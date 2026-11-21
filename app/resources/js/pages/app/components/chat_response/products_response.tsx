import { Package } from 'lucide-react';
import type { ProductData } from '@/types/chat_response';

type ProductsResponseProps = {
    products: ProductData[];
};

export default function ProductsResponse({ products }: ProductsResponseProps) {
    return (
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {products.map((product) => {
                const available = product.stock > 0;

                return (
                    <article
                        key={product.id}
                        dir="rtl"
                        className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-linear-to-br from-surface-secondary to-brand/5 p-3 transition-colors hover:border-brand/30"
                    >
                        <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
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
                                    ? `${product.stock.toLocaleString('fa-IR')} عدد موجود`
                                    : 'ناموجود'}
                            </span>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                            <span className="text-xs text-muted">قیمت</span>
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
