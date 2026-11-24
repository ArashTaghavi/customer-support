import ListingFilters from '../components/listing_filters';
import { Link, router } from '@inertiajs/react';
import { ReceiptText, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../layout';
import ListingPage from '../components/listing_page';
import OrderResponse from '../components/chat_response/order_response';
import PagePagination from '../components/page_pagination';
import { orderSchema } from '../components/chat_response/parse_response';
import { index } from '@/routes/orders';
import { shop } from '@/routes';
import type { Paginated } from '@/types/pagination';

export default function Orders({ orders }: { orders: Paginated<unknown> }) {
    const items = orderSchema.array().parse(orders.data);
    const [expanded, setExpanded] = useState<number | null>(null);
    return (
        <ListingPage
            title="سفارشات من"
            description={`${orders.meta.total.toLocaleString('fa-IR')} سفارش؛ برای مشاهدهٔ جزئیات روی سفارش بزنید.`}
            icon={ReceiptText}
            footer={
                <PagePagination
                    meta={orders.meta}
                    onPage={(page) =>
                        router.get(
                            index.url({
                                query: {
                                    ...Object.fromEntries(
                                        new URLSearchParams(
                                            window.location.search,
                                        ),
                                    ),
                                    page,
                                },
                            }),
                            {},
                            { preserveState: true },
                        )
                    }
                />
            }
        >
            <ListingFilters kind="orders" />
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((order) => (
                        <OrderResponse
                            key={order.id}
                            order={order}
                            open={expanded === order.id}
                            onToggle={() =>
                                setExpanded(
                                    expanded === order.id ? null : order.id,
                                )
                            }
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-outline/10 bg-highlight/2 px-5 py-16 text-center">
                    <ReceiptText
                        size={38}
                        className="text-highlight/60"
                        aria-hidden="true"
                    />
                    <p className="text-sm text-secondary">
                        هنوز سفارشی ثبت نکرده‌اید.
                    </p>
                    <Link
                        href={shop()}
                        className="inline-flex items-center gap-2 rounded-xl bg-glow/15 px-5 py-3 text-sm text-highlight transition-colors hover:bg-glow/25 focus-visible:outline-2 focus-visible:outline-glow"
                    >
                        <ShoppingBag size={16} aria-hidden="true" />
                        مشاهده فروشگاه
                    </Link>
                </div>
            )}
        </ListingPage>
    );
}

Orders.layout = AppLayout;
