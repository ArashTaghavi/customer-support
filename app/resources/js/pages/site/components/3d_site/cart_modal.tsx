import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Package, ShoppingCart, X, ArrowRight } from 'lucide-react';
import type { CartResponse } from '@/types/cart';
import AddToCart from '../../../user/components/cart/add_to_cart';

export default function CartModal({
    mode,
    onClose,
    onCheckout,
}: {
    mode: 'cart' | 'checkout';
    onClose: () => void;
    onCheckout: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const { cart = [], errors = {} } = usePage<{
        cart?: CartResponse[];
        errors?: Record<string, string>;
    }>().props;
    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
    );
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const ready =
        cart.length > 0 &&
        cart.every((item) => item.quantity <= item.product.stock);
    useEffect(() => {
        const element = dialog.current;
        element?.showModal();
        return () => element?.close();
    }, []);
    return (
        <dialog
            ref={dialog}
            className="showroom-category-modal showroom-cart-modal"
            aria-labelledby="cart-modal-title"
            onCancel={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section dir="ltr">
                <header>
                    <div>
                        <p className="showroom-cart-eyebrow">
                            {mode === 'checkout'
                                ? 'CHECKOUT COUNTER'
                                : 'NOVA SHOWROOM'}
                        </p>
                        <h2 id="cart-modal-title">
                            {mode === 'checkout'
                                ? 'Order summary'
                                : 'Your cart'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close cart"
                    >
                        <X size={22} />
                    </button>
                </header>
                <div className="showroom-category-body">
                    {Object.values(errors).map((error, index) => (
                        <p role="alert" key={index}>
                            {error}
                        </p>
                    ))}
                    {cart.length ? (
                        <ul className="showroom-cart-items">
                            {cart.map((item) => (
                                <li
                                    key={item.id}
                                    className="showroom-cart-item"
                                >
                                    <div className="showroom-cart-image">
                                        <Package size={28} aria-hidden="true" />
                                        {item.product.image && (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.title}
                                                onError={(event) => {
                                                    event.currentTarget.hidden = true;
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="showroom-cart-details">
                                        <h3>{item.product.title}</h3>
                                        <p>
                                            {item.product.price.toLocaleString(
                                                'en-US',
                                            )}{' '}
                                            Toman each
                                        </p>
                                        <span
                                            className="showroom-product-stock"
                                            aria-live="polite"
                                        >
                                            {Math.max(
                                                0,
                                                item.product.stock -
                                                    item.quantity,
                                            ).toLocaleString('en-US')}{' '}
                                            available
                                        </span>
                                        {item.quantity > item.product.stock && (
                                            <p role="alert">
                                                Reduce the quantity to match
                                                available stock.
                                            </p>
                                        )}
                                    </div>
                                    <div className="showroom-category-buy showroom-cart-quantity">
                                        <AddToCart
                                            locale="en"
                                            product={{
                                                ...item.product,
                                                description: '',
                                                image_url: item.product.image,
                                            }}
                                            quantity={item.quantity}
                                        />
                                        <strong>
                                            {(
                                                item.product.price *
                                                item.quantity
                                            ).toLocaleString('en-US')}{' '}
                                            Toman
                                        </strong>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="showroom-cart-empty">
                            <ShoppingCart size={44} aria-hidden="true" />
                            <h3>Your cart is empty</h3>
                            <p>
                                Visit a product table to add items to your cart.
                            </p>
                        </div>
                    )}
                </div>
                <footer className="showroom-cart-footer">
                    <div aria-live="polite" aria-atomic="true">
                        <p>
                            {count.toLocaleString('en-US')}{' '}
                            {count === 1 ? 'item' : 'items'}
                        </p>
                        <strong>
                            Total: {total.toLocaleString('en-US')} Toman
                        </strong>
                    </div>
                    {mode === 'checkout' ? (
                        <button
                            type="button"
                            className="showroom-checkout-button"
                            disabled={!ready}
                        >
                            Pay now
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="showroom-checkout-button"
                            disabled={!ready}
                            onClick={onCheckout}
                        >
                            Proceed to checkout{' '}
                            <ArrowRight size={17} aria-hidden="true" />
                        </button>
                    )}
                </footer>
            </section>
        </dialog>
    );
}
