import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { X, Package } from 'lucide-react';
import type { CartResponse } from '@/types/cart';
import AddToCart from '../../../user/components/cart/add_to_cart';
import type { ShowroomTable } from './types';

export default function CategoryModal({
    table,
    onClose,
}: {
    table?: ShowroomTable;
    onClose: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const { cart = [], errors = {} } = usePage<{
        cart?: CartResponse[];
        errors?: Record<string, string>;
    }>().props;
    const quantities = new Map(
        cart.map((item) => [item.product.id, item.quantity]),
    );
    useEffect(() => {
        const element = dialog.current;
        element?.showModal();
        return () => element?.close();
    }, []);
    return (
        <dialog
            ref={dialog}
            className="showroom-category-modal"
            aria-labelledby="category-modal-title"
            onCancel={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section dir="ltr">
                <header>
                    <h2 id="category-modal-title">
                        {table?.category?.title ?? 'Category products'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close products"
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
                    <div className="showroom-category-products">
                        {table?.catalog_products.map((product) => {
                            const quantity = quantities.get(product.id) ?? 0;
                            const remainingStock = Math.max(
                                0,
                                product.stock - quantity,
                            );
                            const available = remainingStock > 0;
                            return (
                                <article key={product.id}>
                                    <div className="showroom-category-image">
                                        <Package size={40} aria-hidden="true" />
                                        {product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                onError={(event) => {
                                                    event.currentTarget.hidden = true;
                                                }}
                                            />
                                        )}
                                    </div>
                                    <h3>{product.title}</h3>
                                    <p>
                                        {product.price.toLocaleString('en-US')}{' '}
                                        Toman
                                    </p>
                                    <div className="showroom-category-buy">
                                        <span
                                            className={`showroom-product-stock ${available ? 'available' : 'unavailable'}`}
                                            aria-live="polite"
                                            aria-atomic="true"
                                        >
                                            {available
                                                ? `${remainingStock.toLocaleString('en-US')} available`
                                                : 'Out of stock'}
                                        </span>
                                        <AddToCart
                                            locale="en"
                                            product={{
                                                ...product,
                                                description:
                                                    product.description ?? '',
                                                image: product.image_url ?? '',
                                                image_url:
                                                    product.image_url ?? '',
                                            }}
                                            quantity={quantity}
                                        />
                                    </div>
                                </article>
                            );
                        })}
                        {!table?.catalog_products.length && (
                            <p>
                                No products with photos are available in this
                                category yet.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </dialog>
    );
}
