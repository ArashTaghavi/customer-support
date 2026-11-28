type CartSummaryProps = {
    itemCount: number;
    total: number;
};

export default function CartSummary({ itemCount, total }: CartSummaryProps) {
    return (
        <div className="glass-card mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 shadow-glass sm:p-4">
            <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">
                    Cart total
                </p>
                <p className="text-[11px] text-muted">
                    {itemCount.toLocaleString('en-US')} items
                </p>
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">
                {total.toLocaleString('en-US')}
                <span className="ms-1.5 text-[11px] font-normal text-muted">
                    Toman
                </span>
            </p>
        </div>
    );
}
