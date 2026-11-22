import { Package } from 'lucide-react';
import type { CartResponse } from '@/types/cart';

type CartProductProps = {
    item: CartResponse;
};

export default function CartProduct({ item }: CartProductProps) {
    const { product, quantity } = item;

    return (
        <li className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br from-white/4 to-white/1 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-colors hover:border-violet-300/30 hover:bg-white/5 sm:items-center sm:gap-5 sm:p-5">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-black/10 ring-white/10 sm:size-24">
                <Package
                    size={28}
                    className="text-zinc-300"
                    aria-hidden="true"
                />
                <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.hidden = true;
                    }}
                    className="absolute inset-0 size-full bg-white object-contain p-3 transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
                <h3
                    dir="auto"
                    className="text-start text-xs leading-6 font-medium wrap-anywhere text-zinc-100 sm:text-sm"
                >
                    {product.title}
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                    <span className="rounded-lg border border-violet-300/15 bg-violet-400/10 px-2.5 py-1 font-medium text-violet-200">
                        {quantity.toLocaleString('fa-IR')} عدد
                    </span>
                    <span className="text-xs font-medium text-zinc-200 tabular-nums">
                        {product.price.toLocaleString('fa-IR')}
                        <span className="ms-1.5 text-[10px] font-normal text-muted">
                            تومان
                        </span>
                    </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-white/6 pt-3">
                    <span className="text-[11px] text-muted">مجموع</span>
                    <p className="text-sm font-semibold text-violet-200 tabular-nums sm:text-base">
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
