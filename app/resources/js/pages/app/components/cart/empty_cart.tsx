import { ShoppingBag } from 'lucide-react';

export default function EmptyCart() {
    return (
        <div className="flex min-h-[min(45dvh,24rem)] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/2 px-5 py-10 text-center">
            <span className="flex size-20 items-center justify-center rounded-full border border-violet-300/10 bg-violet-400/5 shadow-[0_0_45px_rgba(139,92,246,0.1)]">
                <ShoppingBag
                    size={32}
                    className="text-violet-300/60"
                    aria-hidden="true"
                />
            </span>
            <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">
                    سبد خریدت هنوز خالیه
                </p>
                <p className="text-[11px] leading-6 text-muted">
                    محصولاتی که انتخاب می‌کنی، اینجا نمایش داده می‌شن.
                </p>
            </div>
        </div>
    );
}
