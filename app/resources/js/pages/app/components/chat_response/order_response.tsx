import type { OrderData } from '@/types/chat_response';

type OrderResponseProps = {
    order: OrderData;
};

export default function OrderResponse({ order }: OrderResponseProps) {
    return (
        <article className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-3">
            <h3 className="text-sm font-semibold text-foreground">
                سفارش <bdi>{order.order_number}</bdi>
            </h3>
            <dl className="grid gap-3 text-xs sm:grid-cols-2">
                {[
                    ['وضعیت سفارش', order.order_status],
                    ['وضعیت پرداخت', order.payment_status],
                    ['مبلغ کل', order.total_amount.toLocaleString('fa-IR')],
                    ['کد رهگیری', order.tracking_code],
                    ['آدرس ارسال', order.shipping_address],
                    ['علت لغو', order.cancellation_reason],
                ].map(([label, value]) =>
                    value != null && value !== '' ? (
                        <div key={label} className="min-w-0 space-y-1">
                            <dt className="text-muted">{label}</dt>
                            <dd
                                dir="auto"
                                className="text-start leading-6 wrap-anywhere whitespace-pre-wrap text-foreground"
                            >
                                {value}
                            </dd>
                        </div>
                    ) : null,
                )}
            </dl>
            {order.items.length > 0 && (
                <section className="space-y-2" aria-label="اقلام سفارش">
                    <h4 className="text-xs font-semibold text-foreground">
                        اقلام سفارش
                    </h4>
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <caption className="sr-only">
                                اقلام سفارش {order.order_number}
                            </caption>
                            <thead className="text-muted">
                                <tr>
                                    {[
                                        'شناسه محصول',
                                        'تعداد',
                                        'قیمت واحد',
                                        'جمع',
                                    ].map((label) => (
                                        <th
                                            key={label}
                                            scope="col"
                                            className="px-2 py-2 text-start whitespace-nowrap"
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-border text-foreground"
                                    >
                                        {[
                                            item.product_id,
                                            item.quantity,
                                            item.unit_price,
                                            item.total_price,
                                        ].map((value, index) => (
                                            <td
                                                key={index}
                                                className="px-2 py-2 whitespace-nowrap"
                                            >
                                                {value.toLocaleString('fa-IR')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
            {order.payments.length > 0 && (
                <section className="space-y-2" aria-label="پرداخت‌های سفارش">
                    <h4 className="text-xs font-semibold text-foreground">
                        پرداخت‌ها
                    </h4>
                    {order.payments.map((payment) => (
                        <dl
                            key={payment.id}
                            className="grid gap-2 rounded-lg border border-border p-2 text-xs sm:grid-cols-2"
                        >
                            {[
                                [
                                    'مبلغ',
                                    payment.amount.toLocaleString('fa-IR'),
                                ],
                                ['وضعیت', payment.status],
                                ['روش پرداخت', payment.method],
                                ['شماره تراکنش', payment.transaction_id],
                                ['شماره مرجع', payment.reference_id],
                                ['علت خطا', payment.failure_reason],
                            ].map(([label, value]) =>
                                value != null && value !== '' ? (
                                    <div
                                        key={label}
                                        className="min-w-0 space-y-1"
                                    >
                                        <dt className="text-muted">{label}</dt>
                                        <dd
                                            dir="auto"
                                            className="text-start wrap-anywhere text-foreground"
                                        >
                                            {value}
                                        </dd>
                                    </div>
                                ) : null,
                            )}
                        </dl>
                    ))}
                </section>
            )}
        </article>
    );
}
