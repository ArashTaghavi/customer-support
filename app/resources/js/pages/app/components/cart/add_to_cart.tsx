import { LoaderCircle, Minus, Plus, ShoppingCart } from 'lucide-react';
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

    return (
        <div className="flex h-9 w-16 shrink-0 items-center">
            {quantity > 0 ? (
                <div
                    role="group"
                    aria-label={`تعداد ${product.title}`}
                    className="inline-flex h-9 w-16 shrink-0 items-center justify-between rounded-lg border-0 bg-brand/10 text-brand"
                >
                    <button
                        type="button"
                        onClick={() => updateCart('add')}
                        disabled={processing || !available}
                        aria-label={`افزایش تعداد ${product.title}`}
                        className="flex h-9 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={14} aria-hidden="true" />
                    </button>
                    <span
                        aria-live="polite"
                        aria-atomic="true"
                        className="min-w-0 flex-1 truncate text-center text-xs font-semibold tabular-nums"
                    >
                        {quantity.toLocaleString('fa-IR')}
                    </span>
                    <button
                        type="button"
                        onClick={() => updateCart('remove')}
                        disabled={processing}
                        aria-label={`کاهش تعداد ${product.title}`}
                        className="flex h-9 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Minus size={14} aria-hidden="true" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => updateCart('add')}
                    disabled={processing || !available}
                    aria-label={`افزودن ${product.title} به سبد خرید`}
                    title={available ? 'افزودن به سبد خرید' : 'ناموجود'}
                    aria-busy={processing}
                    className="button-primary cart-add-button inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {processing ? (
                        <LoaderCircle
                            size={17}
                            className="animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <ShoppingCart size={17} aria-hidden="true" />
                    )}
                </button>
            )}
        </div>
    );
}
