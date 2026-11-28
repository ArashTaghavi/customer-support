import type { OrderData } from '@/types/chat_response';
import { useId, type ReactNode } from 'react';
import {
    CreditCard,
    ChevronDown,
    Package,
    ReceiptText,
    Truck,
    Wallet,
} from 'lucide-react';
import { Button, StatusBadge, type StatusTone } from '@/components/ui';
import { messageDate } from '@/utils/message_dates';

const orderStatuses: Record<string, { label: string; tone: StatusTone }> = {
    PENDING: {
        label: 'Pending review',
        tone: 'warning',
    },
    PROCESSING: {
        label: 'Preparing',
        tone: 'processing',
    },
    SHIPPED: {
        label: 'Shipped',
        tone: 'info',
    },
    DELIVERED: {
        label: 'Delivered',
        tone: 'success',
    },
    CANCELLED: {
        label: 'Cancelled',
        tone: 'danger',
    },
};

const paymentStatuses: Record<string, string> = {
    UNPAID: 'Unpaid',
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
};

const paymentTones: Record<string, StatusTone> = {
    UNPAID: 'warning',
    PAID: 'success',
    FAILED: 'danger',
    REFUNDED: 'info',
};

const paymentMethods: Record<string, string> = {
    ONLINE: 'Online',
    WALLET: 'Wallet',
    CARD_TO_CARD: 'Card transfer',
    CASH_ON_DELIVERY: 'Cash on delivery',
    BANK_TRANSFER: 'Bank transfer',
};

type OrderResponseProps = {
    order: OrderData;
    open: boolean;
    onToggle: () => void;
};

function DetailRow({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="grid min-w-0 grid-cols-[6rem_minmax(0,1fr)] items-baseline gap-x-2 py-1.5 text-xs leading-6">
            <dt className="text-muted">{label}:</dt>
            <dd className="min-w-0 wrap-anywhere text-foreground">
                {children}
            </dd>
        </div>
    );
}

function OrderDateRow({
    label,
    timestamp,
}: {
    label: string;
    timestamp: string | null;
}) {
    if (!timestamp) return null;

    const date = messageDate(timestamp);
    if (!date.iso) return null;

    return (
        <DetailRow label={label}>
            <time dateTime={date.iso} className="tabular-nums">
                {date.full}
            </time>
        </DetailRow>
    );
}

export default function OrderResponse({
    order,
    open,
    onToggle,
}: OrderResponseProps) {
    const detailsId = useId();
    const triggerId = useId();
    const status = orderStatuses[order.order_status] ?? {
        label: order.order_status,
        tone: 'neutral' as const,
    };
    const paidAmount = order.payments
        .filter((payment) => payment.status === 'PAID')
        .reduce((total, payment) => total + payment.amount, 0);
    const methods = [
        ...new Set(
            order.payments.map(
                (payment) => paymentMethods[payment.method] ?? payment.method,
            ),
        ),
    ];

    return (
        <article
            dir="ltr"
            className="glass-card order-card relative isolate w-full min-w-0 overflow-hidden rounded-2xl text-foreground shadow-glass"
        >
            <h3>
                <Button
                    id={triggerId}
                    variant="tab"
                    fullWidth
                    onClick={onToggle}
                    aria-expanded={open}
                    aria-controls={detailsId}
                    className="h-auto! justify-start! gap-3! rounded-none! p-3! text-start sm:p-4!"
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-outline/20 bg-glow/10 text-foreground">
                        <ReceiptText size={18} aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <span className="min-w-0 space-y-1">
                            <span className="block text-xs font-semibold wrap-anywhere text-foreground">
                                Order <bdi>{order.order_number}</bdi>
                            </span>
                            <span className="block text-[11px] font-normal text-muted">
                                {open ? 'Hide details' : 'View details'}
                            </span>
                        </span>
                        <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold whitespace-nowrap text-foreground tabular-nums">
                                {order.total_amount.toLocaleString('en-US')}{' '}
                                <span className="text-[10px] font-normal text-muted">
                                    Toman
                                </span>
                            </span>
                            <StatusBadge tone={status.tone}>
                                <Truck size={12} aria-hidden="true" />
                                {status.label}
                            </StatusBadge>
                            <StatusBadge
                                tone={
                                    paymentTones[order.payment_status] ??
                                    'neutral'
                                }
                            >
                                <CreditCard size={12} aria-hidden="true" />
                                {paymentStatuses[order.payment_status] ??
                                    order.payment_status}
                            </StatusBadge>
                        </span>
                    </span>
                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={`shrink-0 text-foreground transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                    />
                </Button>
            </h3>
            <div
                id={detailsId}
                role="region"
                aria-labelledby={triggerId}
                className="order-details"
                data-open={open}
                aria-hidden={!open}
                inert={!open}
            >
                <div className="order-details-clip">
                    <div className="space-y-3 border-t border-border/40 p-3 sm:p-4">
                        <div className="grid min-w-0 gap-3 md:grid-cols-2">
                            <section
                                className="min-w-0 rounded-xl border border-border/40 bg-input/70 px-3 py-2"
                                aria-label="Order information"
                            >
                                <h4 className="mb-1 flex items-center gap-2 border-b border-border/30 pb-2 text-xs font-medium text-foreground">
                                    <ReceiptText size={14} aria-hidden="true" />
                                    Order information
                                </h4>
                                <dl className="divide-y divide-border/25">
                                    <DetailRow label="Address">
                                        {order.shipping_address ||
                                            'Not provided'}
                                    </DetailRow>
                                    <DetailRow label="Order total">
                                        <span className="tabular-nums">
                                            {order.total_amount.toLocaleString(
                                                'en-US',
                                            )}{' '}
                                            Toman
                                        </span>
                                    </DetailRow>
                                    {order.tracking_code && (
                                        <DetailRow label="Tracking number">
                                            <bdi>{order.tracking_code}</bdi>
                                        </DetailRow>
                                    )}
                                    {order.cancellation_reason && (
                                        <DetailRow label="Cancellation reason">
                                            <span className="text-danger">
                                                {order.cancellation_reason}
                                            </span>
                                        </DetailRow>
                                    )}
                                    <OrderDateRow
                                        label="Order date"
                                        timestamp={order.created_at}
                                    />
                                    {['PAID', 'REFUNDED'].includes(
                                        order.payment_status,
                                    ) && (
                                        <OrderDateRow
                                            label="Payment date"
                                            timestamp={order.paid_at}
                                        />
                                    )}
                                    {['SHIPPED', 'DELIVERED'].includes(
                                        order.order_status,
                                    ) && (
                                        <OrderDateRow
                                            label="Shipping date"
                                            timestamp={order.shipped_at}
                                        />
                                    )}
                                    {order.order_status === 'DELIVERED' && (
                                        <OrderDateRow
                                            label="Delivery date"
                                            timestamp={order.delivered_at}
                                        />
                                    )}
                                    {order.order_status === 'CANCELLED' && (
                                        <OrderDateRow
                                            label="Cancellation date"
                                            timestamp={order.cancelled_at}
                                        />
                                    )}
                                    {order.payment_status === 'REFUNDED' &&
                                        order.payments
                                            .filter(
                                                (payment) =>
                                                    payment.status ===
                                                    'REFUNDED',
                                            )
                                            .map((payment) => (
                                                <OrderDateRow
                                                    key={payment.id}
                                                    label="Refunded"
                                                    timestamp={
                                                        payment.refunded_at
                                                    }
                                                />
                                            ))}
                                </dl>
                            </section>
                            <section
                                className="min-w-0 rounded-xl border border-border/40 bg-input/70 px-3 py-2"
                                aria-label="Payment information"
                            >
                                <h4 className="mb-1 flex items-center gap-2 border-b border-border/30 pb-2 text-xs font-medium text-foreground">
                                    <Wallet size={14} aria-hidden="true" />
                                    Payment information
                                </h4>
                                <dl className="divide-y divide-border/25">
                                    <DetailRow label="Amount paid">
                                        <span className="text-success tabular-nums">
                                            {paidAmount.toLocaleString('en-US')}{' '}
                                            Toman
                                        </span>
                                    </DetailRow>
                                    <DetailRow label="Payment method">
                                        <span className="flex flex-wrap gap-1">
                                            {methods.length
                                                ? methods.map((method) => (
                                                      <StatusBadge key={method}>
                                                          {method}
                                                      </StatusBadge>
                                                  ))
                                                : 'Not provided'}
                                        </span>
                                    </DetailRow>
                                    <DetailRow label="Status">
                                        <StatusBadge
                                            tone={
                                                paymentTones[
                                                    order.payment_status
                                                ] ?? 'neutral'
                                            }
                                        >
                                            {paymentStatuses[
                                                order.payment_status
                                            ] ?? order.payment_status}
                                        </StatusBadge>
                                    </DetailRow>
                                </dl>
                                {order.payments.map((payment) => (
                                    <dl
                                        key={payment.id}
                                        className="mt-2 divide-y divide-border/25 border-t border-border/40 pt-1"
                                    >
                                        <DetailRow label="Transaction">
                                            <span className="flex flex-wrap items-center gap-1.5">
                                                <span className="tabular-nums">
                                                    {payment.amount.toLocaleString(
                                                        'en-US',
                                                    )}{' '}
                                                    Toman
                                                </span>
                                                <StatusBadge
                                                    tone={
                                                        paymentTones[
                                                            payment.status
                                                        ] ?? 'neutral'
                                                    }
                                                >
                                                    {paymentStatuses[
                                                        payment.status
                                                    ] ?? payment.status}
                                                </StatusBadge>
                                            </span>
                                        </DetailRow>
                                        {payment.transaction_id && (
                                            <DetailRow label="Transaction ID">
                                                <bdi>
                                                    {payment.transaction_id}
                                                </bdi>
                                            </DetailRow>
                                        )}
                                        {payment.reference_id && (
                                            <DetailRow label="Reference number">
                                                <bdi>
                                                    {payment.reference_id}
                                                </bdi>
                                            </DetailRow>
                                        )}
                                        {payment.failure_reason && (
                                            <DetailRow label="Failure reason">
                                                <span className="text-danger">
                                                    {payment.failure_reason}
                                                </span>
                                            </DetailRow>
                                        )}
                                    </dl>
                                ))}
                            </section>
                        </div>
                        {order.items.length > 0 && (
                            <section
                                className="min-w-0 space-y-2"
                                aria-label="Order items"
                            >
                                <h4 className="flex items-center gap-2 text-xs font-medium text-foreground">
                                    <Package
                                        size={15}
                                        className="text-foreground"
                                        aria-hidden="true"
                                    />
                                    Order items{' '}
                                    <StatusBadge>
                                        {order.items.length.toLocaleString(
                                            'en-US',
                                        )}{' '}
                                        items
                                    </StatusBadge>
                                </h4>
                                <div className="max-w-full overflow-x-auto rounded-xl border border-border/40">
                                    <table className="w-full text-start text-xs">
                                        <caption className="sr-only">
                                            Order items {order.order_number}
                                        </caption>
                                        <thead className="bg-highlight/4 text-muted">
                                            <tr>
                                                {[
                                                    'Product',
                                                    'Quantity',
                                                    'Unit price (Toman)',
                                                    'Total price (Toman)',
                                                ].map((label) => (
                                                    <th
                                                        key={label}
                                                        scope="col"
                                                        className="px-3 py-2 text-start font-normal whitespace-nowrap"
                                                    >
                                                        {label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {order.items.map((item) => {
                                                const product = item.product;
                                                const image =
                                                    product?.image_url;
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="text-foreground hover:bg-highlight/3"
                                                    >
                                                        <td className="px-3 py-2">
                                                            <div className="flex min-w-40 items-center gap-2">
                                                                <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-white">
                                                                    <Package
                                                                        size={
                                                                            17
                                                                        }
                                                                        className="text-muted"
                                                                        aria-hidden="true"
                                                                    />
                                                                    {image && (
                                                                        <img
                                                                            src={
                                                                                image
                                                                            }
                                                                            alt={
                                                                                product?.title ??
                                                                                'Product'
                                                                            }
                                                                            loading="lazy"
                                                                            onError={(
                                                                                event,
                                                                            ) => {
                                                                                event.currentTarget.hidden = true;
                                                                            }}
                                                                            className="absolute inset-0 size-full bg-white object-contain p-1"
                                                                        />
                                                                    )}
                                                                </span>
                                                                <span
                                                                    dir="auto"
                                                                    className="max-w-64 text-start leading-5 wrap-anywhere"
                                                                >
                                                                    {product?.title ||
                                                                        'Product unavailable'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 tabular-nums">
                                                            {item.quantity.toLocaleString(
                                                                'en-US',
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                                                            {item.unit_price.toLocaleString(
                                                                'en-US',
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 font-medium whitespace-nowrap text-foreground tabular-nums">
                                                            {item.total_price.toLocaleString(
                                                                'en-US',
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
