import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { ProductData } from '@/types/chat_response';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { add, remove } from '@/routes/cart';

type AddToCartProps = {
    product: ProductData;
    quantity: number;
};

export default function AddToCart({ product, quantity }: AddToCartProps) {
    const available = quantity < product.stock;

    const [processing, setProcessing] = useState(false);
    const requestPending = useRef(false);

    function updateCart(action: 'add' | 'remove') {
        if (
            requestPending.current ||
            (action === 'add' && !available) ||
            (action === 'remove' && quantity <= 0)
        )
            return;

        requestPending.current = true;
        setProcessing(true);

        router.post(
            action === 'add' ? add.url(product.id) : remove.url(product.id),
            { quantity: 1 },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    requestPending.current = false;
                    setProcessing(false);
                },
            },
        );
    }

    return quantity > 0 ? (
        <div
            role="group"
            aria-label={`تعداد ${product.title}`}
            className="inline-flex items-center gap-1 rounded-lg border border-brand/20 bg-brand/10 p-1 text-brand"
        >
            <button
                type="button"
                onClick={() => updateCart('add')}
                disabled={processing || !available}
                aria-label={`افزایش تعداد ${product.title}`}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-brand/15 focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus size={15} aria-hidden="true" />
            </button>
            <span
                aria-live="polite"
                aria-atomic="true"
                className="min-w-7 text-center text-sm font-semibold tabular-nums"
            >
                {quantity.toLocaleString('fa-IR')}
            </span>
            <button
                type="button"
                onClick={() => updateCart('remove')}
                disabled={processing}
                aria-label={`کاهش تعداد ${product.title}`}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-brand/15 focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Minus size={15} aria-hidden="true" />
            </button>
        </div>
    ) : (
        <button
            type="button"
            onClick={() => updateCart('add')}
            disabled={processing || !available}
            className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand/20 bg-brand/10 px-2.5 py-2 text-[11px] font-medium text-brand transition-colors hover:border-brand/40 hover:bg-brand/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
            <ShoppingBag size={14} aria-hidden="true" />
            افزودن به سبد خرید
        </button>
    );
}
