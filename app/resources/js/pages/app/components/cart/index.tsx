import type { CartResponse } from '@/types/cart';
import { usePage } from '@inertiajs/react';
import { ChevronLeft, ShoppingBag, X } from 'lucide-react';
import { useId, useRef } from 'react';
import CartProduct from './cart_product';
import EmptyCart from './empty_cart';
import CartSummary from './cart_summary';

export default function Cart() {
    const { cart = [] } = usePage<{ cart: CartResponse[] }>().props;
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
            <button
                type="button"
                onClick={() => dialogRef.current?.showModal()}
                aria-haspopup="dialog"
                className="group flex h-12 w-full cursor-pointer items-center gap-3 rounded-2xl border border-violet-300/35 bg-linear-to-br from-violet-500/15 via-violet-500/8 to-white/3 px-3 py-1 text-start text-white shadow-[0_6px_24px_rgba(124,58,237,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-colors hover:border-violet-200/50 hover:from-violet-500/25 hover:to-violet-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 active:from-white/10"
            >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-violet-100 shadow-sm transition-colors group-hover:bg-white/20">
                    <ShoppingBag size={19} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0 text-start">
                    <span className="text-sm leading-5 font-semibold">
                        سبد خرید
                    </span>
                    <span className="inline-flex items-baseline gap-1 text-[11px] leading-4 font-medium whitespace-nowrap text-violet-100 tabular-nums">
                        {total.toLocaleString('fa-IR')}
                        <span className="text-[9px] font-normal text-violet-200">
                            تومان
                        </span>
                    </span>
                </span>
                <span
                    aria-live="polite"
                    aria-atomic="true"
                    className="flex min-w-7 shrink-0 items-center justify-center rounded-lg border border-violet-200/25 bg-violet-400/20 px-2 py-1 text-xs font-bold text-violet-100 tabular-nums shadow-sm shadow-violet-950/20"
                >
                    {itemCount.toLocaleString('fa-IR')}
                </span>
                <ChevronLeft
                    size={16}
                    className="text-violet-300/60 transition-colors group-hover:text-violet-200"
                    aria-hidden="true"
                />
            </button>

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
                className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-3xl overflow-x-hidden overflow-y-auto rounded-2xl border border-white/15 bg-[#0d0d0f]/85 p-0 text-zinc-100 shadow-[0_24px_100px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm sm:max-h-[85dvh] sm:w-[calc(100vw-3rem)] sm:rounded-3xl [@media(max-height:500px)]:max-h-[calc(100dvh-0.5rem)]"
            >
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-3xl bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.10),transparent_70%)]"
                    aria-hidden="true"
                />
                <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/8 bg-[#0d0d0f]/90 p-3 backdrop-blur-xl sm:p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-300">
                        <ShoppingBag size={22} aria-hidden="true" />
                    </span>
                    <h2 id={titleId} className="flex-1 text-sm font-semibold">
                        سبد خرید
                    </h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="بستن سبد خرید"
                        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/8 bg-white/5 text-muted transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-violet-400"
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
                <div className="sticky bottom-0 z-10 border-t border-white/8 bg-[#0d0d0f]/95 p-4 backdrop-blur-xl sm:px-6">
                    {cart.length > 0 && (
                        <CartSummary itemCount={itemCount} total={total} />
                    )}
                    <button
                        type="button"
                        onClick={close}
                        className="w-full cursor-pointer rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-xs font-medium text-violet-200 transition-colors hover:bg-violet-400/20 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        ادامه گفتگو
                    </button>
                </div>
            </dialog>
        </>
    );
}
