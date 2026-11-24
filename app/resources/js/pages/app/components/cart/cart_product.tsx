import { Package } from 'lucide-react';
import type { CartResponse } from '@/types/cart';

type CartProductProps = {
    item: CartResponse;
};

export default function CartProduct({ item }: CartProductProps) {
    const { product, quantity } = item;

    return (
        <li className="group glass-card relative flex items-start gap-3 overflow-hidden rounded-2xl p-3 shadow-glass transition-colors hover:border-outline/30 hover:bg-highlight/5 sm:items-center sm:gap-5 sm:p-5">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-black/10 ring-border/50 sm:size-24">
                <Package
                    size={28}
                    className="text-secondary"
                    aria-hidden="true"
                />
                <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.hidden = true;
                    }}
                    className="absolute inset-0 size-full bg-white object-contain p-3"
                />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
                <h3
                    dir="auto"
                    className="text-start text-xs leading-6 font-medium wrap-anywhere text-foreground sm:text-sm"
                >
                    {product.title}
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                    <span className="rounded-lg border border-outline/15 bg-glow/10 px-2.5 py-1 font-medium text-highlight">
                        {quantity.toLocaleString('fa-IR')} عدد
                    </span>
                    <span className="text-xs font-medium text-foreground tabular-nums">
                        {product.price.toLocaleString('fa-IR')}
                        <span className="ms-1.5 text-[10px] font-normal text-muted">
                            تومان
                        </span>
                    </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border/30 pt-3">
                    <span className="text-[11px] text-muted">مجموع</span>
                    <p className="text-sm font-semibold text-highlight tabular-nums sm:text-base">
                        {(product.price * quantity).toLocaleString('fa-IR')}
                        <span className="ms-1.5 text-[10px] font-normal text-muted">
                            تومان
                        </span>
                    </p>
                </div>
            </div>
        </li>
    );
}
