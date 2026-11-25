import type { CartResponse } from '@/types/cart';
import { usePage } from '@inertiajs/react';
import { ChevronLeft, ShoppingBag, X } from 'lucide-react';
import { useId, useRef } from 'react';
import CartProduct from './cart_product';
import EmptyCart from './empty_cart';
import CartSummary from './cart_summary';

export default function Cart({ variant = 'default' }: { variant?: 'default' | 'header' }) {
    const { cart = [] } = usePage<{ cart?: CartResponse[] }>().props;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
    );
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    function close() {
        dialogRef.current?.close();
    }

    return (
        <>
            {variant === 'header' ? (
                <button
                    type="button"
                    onClick={() => dialogRef.current?.showModal()}
                    aria-haspopup="dialog"
                    aria-label={`سبد خرید، ${itemCount.toLocaleString('fa-IR')} کالا`}
                    className="site-cart-trigger"
                >
                    <span className="site-cart-icon">
                        <ShoppingBag size={20} strokeWidth={1.7} aria-hidden="true" />
                        <span className="site-cart-count" aria-live="polite" aria-atomic="true">{itemCount.toLocaleString('fa-IR')}</span>
                    </span>
                    <span className="site-cart-label">سبد خرید</span>
                </button>
            ) : <button
                type="button"
                onClick={() => dialogRef.current?.showModal()}
                aria-haspopup="dialog"
                className="group glass-nav flex h-12 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-1 text-start text-foreground transition-colors hover:border-outline/50 hover:from-primary/25 hover:to-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight active:from-highlight/10"
            >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-highlight/10 text-foreground shadow-sm transition-colors group-hover:bg-highlight/20">
                    <ShoppingBag size={19} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0 text-start">
                    <span className="text-sm leading-5 font-semibold">
                        سبد خرید
                    </span>
                    <span className="inline-flex items-baseline gap-1 text-[11px] leading-4 font-medium whitespace-nowrap text-foreground tabular-nums">
                        {total.toLocaleString('fa-IR')}
                        <span className="text-[9px] font-normal text-foreground">
                            تومان
                        </span>
                    </span>
                </span>
                <span
                    aria-live="polite"
                    aria-atomic="true"
                    className="flex min-w-7 shrink-0 items-center justify-center rounded-lg border border-outline/25 bg-glow/20 px-2 py-1 text-xs font-bold text-foreground tabular-nums shadow-sm shadow-deep/20"
                >
                    {itemCount.toLocaleString('fa-IR')}
                </span>
                <ChevronLeft
                    size={16}
                    className="text-foreground/60 transition-colors group-hover:text-foreground"
                    aria-hidden="true"
                />
            </button>}

            <dialog
                ref={dialogRef}
                dir="rtl"
                aria-labelledby={titleId}
                onClick={(event) => {
                    if (event.target !== event.currentTarget) return;
                    const bounds = event.currentTarget.getBoundingClientRect();
                    if (
                        event.clientX < bounds.left ||
                        event.clientX > bounds.right ||
                        event.clientY < bounds.top ||
                        event.clientY > bounds.bottom
                    )
                        close();
                }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    margin: 'auto',
                }}
                className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-3xl overflow-x-hidden overflow-y-auto rounded-2xl border border-border-hover bg-surface/95 p-0 text-foreground shadow-modal backdrop-blur-md backdrop:bg-black/55 backdrop:backdrop-blur-sm sm:max-h-[85dvh] sm:w-[calc(100vw-3rem)] sm:rounded-3xl [@media(max-height:500px)]:max-h-[calc(100dvh-0.5rem)]"
            >
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-3xl bg-ambient"
                    aria-hidden="true"
                />
                <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/40 bg-surface/90 p-3 backdrop-blur-xl sm:p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-outline/20 bg-glow/10 text-foreground">
                        <ShoppingBag size={22} aria-hidden="true" />
                    </span>
                    <h2 id={titleId} className="flex-1 text-sm font-semibold">
                        سبد خرید
                    </h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="بستن سبد خرید"
                        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-highlight/5 text-muted transition-colors hover:bg-highlight/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-glow"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
                <div className="relative p-3 sm:p-5">
                    {cart.length > 0 ? (
                        <ul className="space-y-3">
                            {cart.map((item) => (
                                <CartProduct key={item.id} item={item} />
                            ))}
                        </ul>
                    ) : (
                        <EmptyCart />
                    )}
                </div>
                <div className="sticky bottom-0 z-10 border-t border-border/40 bg-surface/95 p-4 backdrop-blur-xl sm:px-6">
                    {cart.length > 0 && (
                        <CartSummary itemCount={itemCount} total={total} />
                    )}
                    <button
                        type="button"
                        onClick={close}
                        className="w-full cursor-pointer rounded-xl border border-outline/20 bg-glow/10 px-4 py-3 text-xs font-medium text-foreground transition-colors hover:bg-glow/20 focus-visible:outline-2 focus-visible:outline-glow"
                    >
                        ادامه گفتگو
                    </button>
                </div>
            </dialog>
        </>
    );
}
