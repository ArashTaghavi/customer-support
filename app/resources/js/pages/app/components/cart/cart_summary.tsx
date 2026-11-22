type CartSummaryProps = {
    itemCount: number;
    total: number;
};

export default function CartSummary({ itemCount, total }: CartSummaryProps) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-300/20 bg-linear-to-l from-violet-400/15 to-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
            <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">
                    جمع سبد خرید
                </p>
                <p className="text-xs text-zinc-500">
                    {itemCount.toLocaleString('fa-IR')} عدد کالا
                </p>
            </div>
            <p className="text-xl font-semibold text-violet-200 tabular-nums">
                {total.toLocaleString('fa-IR')}
                <span className="ms-1.5 text-xs font-normal text-zinc-400">
                    تومان
                </span>
            </p>
        </div>
    );
}
