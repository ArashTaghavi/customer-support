import { ShoppingBag } from 'lucide-react';

export default function EmptyCart() {
    return (
        <div className="flex min-h-[min(45dvh,24rem)] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/50 bg-highlight/2 px-5 py-10 text-center">
            <span className="flex size-20 items-center justify-center rounded-full border border-outline/10 bg-glow/5 shadow-glass">
                <ShoppingBag
                    size={32}
                    className="text-foreground/60"
                    aria-hidden="true"
                />
            </span>
            <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                    Your cart is empty
                </p>
                <p className="text-[11px] leading-6 text-muted">
                    Products you add will appear here.
                </p>
            </div>
        </div>
    );
}
