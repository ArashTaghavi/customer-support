type CartSummaryProps = {
    itemCount: number;
    total: number;
};

export default function CartSummary({ itemCount, total }: CartSummaryProps) {
    return (
        <div className="glass-card mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 shadow-glass sm:p-4">
            <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">
                    جمع سبد خرید
                </p>
                <p className="text-[11px] text-muted">
                    {itemCount.toLocaleString('fa-IR')} عدد کالا
                </p>
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">
                {total.toLocaleString('fa-IR')}
                <span className="ms-1.5 text-[11px] font-normal text-muted">
                    تومان
                </span>
            </p>
        </div>
    );
}
