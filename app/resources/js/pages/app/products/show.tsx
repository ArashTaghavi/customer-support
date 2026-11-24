import { Link, usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { shop } from '@/routes';
import type { ProductData } from '@/types/chat_response';
import type { CartResponse } from '@/types/cart';
import AppLayout from '../layout';
import ListingPage from '../components/listing_page';
import AddToCart from '../components/cart/add_to_cart';

type Props = {
    product: { data: ProductData & { product_category?: { id: number; title: string } | null } };
};

export default function Show({ product: { data: product } }: Props) {
    const { cart = [] } = usePage<{ cart?: CartResponse[] }>().props;
    const quantity = cart.find((item) => item.product.id === product.id)?.quantity ?? 0;

    return (
        <ListingPage title={product.title} description="مشخصات و توضیحات محصول" icon={Package} footer={null}>
            <Link href={shop()} className="text-sm text-secondary hover:text-foreground">بازگشت به فروشگاه</Link>
            <article dir="rtl" className="glass-card grid gap-8 rounded-3xl p-5 text-foreground sm:p-8 lg:grid-cols-2">
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white">
                    <Package size={64} className="text-secondary" aria-hidden="true" />
                    <img src={product.image_url} alt={product.title} onError={(event) => { event.currentTarget.hidden = true; }} className="absolute inset-0 size-full object-contain p-6" />
                </div>
                <div className="flex min-w-0 flex-col gap-6">
                    <h2 dir="auto" className="text-2xl leading-relaxed font-semibold wrap-anywhere">{product.title}</h2>
                    <dl className="space-y-4 text-sm">
                        <div className="flex justify-between gap-4"><dt className="text-secondary">کد محصول</dt><dd>{product.id.toLocaleString('fa-IR')}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-secondary">دسته‌بندی</dt><dd>{product.product_category?.title ?? 'بدون دسته‌بندی'}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-secondary">موجودی</dt><dd className={product.stock > 0 ? 'text-success' : 'text-danger'}>{product.stock > 0 ? `${product.stock.toLocaleString('fa-IR')} عدد` : 'ناموجود'}</dd></div>
                    </dl>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline/15 pt-6">
                        <p className="text-2xl font-semibold">{product.price.toLocaleString('fa-IR')} <span className="text-sm font-normal text-secondary">تومان</span></p>
                        <AddToCart product={product} quantity={quantity} />
                    </div>
                    <section className="border-t border-outline/15 pt-6">
                        <h3 className="mb-3 font-semibold">توضیحات کامل محصول</h3>
                        <p dir="auto" className="text-sm leading-8 whitespace-pre-wrap wrap-anywhere text-secondary">{product.description || 'توضیحاتی برای این محصول ثبت نشده است.'}</p>
                    </section>
                </div>
            </article>
        </ListingPage>
    );
}

Show.layout = AppLayout;
