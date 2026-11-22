type CartSummaryProps = {
    itemCount: number;
    total: number;
};

export default function CartSummary({ itemCount, total }: CartSummaryProps) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-300/20 bg-linear-to-l from-violet-400/8 to-white/2 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-4">
            <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-200">
                    جمع سبد خرید
                </p>
                <p className="text-[11px] text-muted">
                    {itemCount.toLocaleString('fa-IR')} عدد کالا
                </p>
            </div>
            <p className="text-lg font-semibold text-violet-200 tabular-nums">
                {total.toLocaleString('fa-IR')}
                <span className="ms-1.5 text-[11px] font-normal text-muted">
                    تومان
                </span>
            </p>
        </div>
    );
}
