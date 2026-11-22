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
                className="group flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border border-violet-300/20 bg-linear-to-l from-violet-500/15 to-indigo-500/10 px-3.5 py-3 text-start text-violet-100 shadow-lg shadow-black/10 transition-colors hover:border-violet-300/40 hover:from-violet-500/25 hover:to-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 active:bg-violet-500/25"
            >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300 transition-colors group-hover:bg-violet-400/25">
                    <ShoppingBag size={19} aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-medium">سبد خرید</span>
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
                    width: 'min(48rem, calc(100vw - 2rem))',
                    maxHeight: '90dvh',
                }}
                className="overflow-y-auto rounded-3xl border border-white/15 bg-[#171425]/85 p-0 text-zinc-100 shadow-[0_24px_100px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm"
            >
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-3xl bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.22),transparent_70%)]"
                    aria-hidden="true"
                />
                <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/8 bg-[#171425]/90 p-5 backdrop-blur-xl sm:p-6">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-300">
                        <ShoppingBag size={22} aria-hidden="true" />
                    </span>
                    <h2 id={titleId} className="flex-1 text-base font-semibold">
                        سبد خرید
                    </h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="بستن سبد خرید"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-white/8 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
                <div className="relative p-5 sm:p-6">
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
                <div className="sticky bottom-0 z-10 border-t border-white/8 bg-[#171425]/95 p-4 backdrop-blur-xl sm:px-6">
                    {cart.length > 0 && (
                        <CartSummary itemCount={itemCount} total={total} />
                    )}
                    <button
                        type="button"
                        onClick={close}
                        className="w-full cursor-pointer rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-400/20 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        ادامه گفتگو
                    </button>
                </div>
            </dialog>
        </>
    );
}
