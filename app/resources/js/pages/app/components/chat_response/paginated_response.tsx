import { useHttp, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui';
import { RotateCcw } from 'lucide-react';
import { orders, products } from '@/routes/chat-response';
import type { ChatBlock, OrderData, ProductData } from '@/types/chat_response';
import OrderResponse from './order_response';
import ProductsResponse from './products_response';
import { orderSchema, productSchema } from './parse_response';
import { cachedRequest } from '@/utils/request_cache';

const paginationSchema = z.object({
    current_page: z.number().int(),
    last_page: z.number().int(),
    total: z.number().int(),
});

type PageResult = {
    page: number;
    products: ProductData[];
    orders: OrderData[];
    meta: z.infer<typeof paginationSchema> | null;
    error: boolean;
};

export default function PaginatedResponse({ type, data: ids }: ChatBlock) {
    const sectionRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);
    const userId =
        usePage<{ auth: { user: { id: number } | null } }>().props.auth?.user
            ?.id ?? null;
    const [page, setPage] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState<{
        page: number;
        id: number;
    } | null>(null);
    const [retry, setRetry] = useState(0);
    const [settledKey, setSettledKey] = useState('');
    const [result, setResult] = useState<PageResult | null>(null);
    const { post } = useHttp({ ids });
    const requestKey = JSON.stringify([
        userId,
        type === 'products' ? 'products' : 'orders',
        [...new Set(ids)].sort((first, second) => first - second),
        page,
    ]);

    useEffect(() => {
        if (type === 'products') return;
        const refresh = () => setRetry((current) => current + 1);
        window.addEventListener('chat-orders-changed', refresh);
        return () => window.removeEventListener('chat-orders-changed', refresh);
    }, [type]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { root: section.closest('[role="log"]'), rootMargin: '200px 0px' },
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible || ids.length === 0) return;

        let active = true;
        const route = type === 'products' ? products : orders;

        async function loadPage() {
            try {
                const nextResult = await cachedRequest(requestKey, async () => {
                    const response = await post(route.url({ query: { page } }));
                    const nextResult: PageResult = {
                        page,
                        products: [],
                        orders: [],
                        meta: null,
                        error: false,
                    };

                    if (type === 'products') {
                        const parsed = z
                            .object({
                                data: z.array(productSchema),
                                meta: paginationSchema,
                            })
                            .parse(response);
                        nextResult.products = parsed.data;
                        nextResult.meta = parsed.meta;
                    } else {
                        const parsed = z
                            .object({
                                data: z.array(orderSchema),
                                meta: paginationSchema,
                            })
                            .parse(response);
                        nextResult.orders = parsed.data;
                        nextResult.meta = parsed.meta;
                    }

                    return nextResult;
                });

                if (active) {
                    setResult(nextResult);
                    setSettledKey(`${requestKey}:${retry}`);
                }
            } catch {
                if (active) {
                    setSettledKey(`${requestKey}:${retry}`);
                    setResult((previous) => ({
                        page,
                        products: [],
                        orders: [],
                        meta: previous?.meta ?? null,
                        error: true,
                    }));
                }
            }
        }

        void loadPage();

        return () => {
            active = false;
        };
    }, [visible, requestKey, type, ids.length, page, retry, post]);

    const loading =
        visible && ids.length > 0 && settledKey !== `${requestKey}:${retry}`;
    const current = result?.page === page ? result : null;
    const pagination = result?.meta;
    const pageNumbers = pagination
        ? [
              ...new Set([
                  1,
                  ...Array.from({ length: 5 }, (_, index) => page - 2 + index),
                  pagination.last_page,
              ]),
          ]
              .filter((value) => value >= 1 && value <= pagination.last_page)
              .sort((first, second) => first - second)
        : [];

    return (
        <section
            ref={sectionRef}
            data-chat-pagination
            className="@container relative min-w-0 space-y-3"
            aria-busy={loading}
        >
            {!visible && ids.length > 0 ? (
                <div className="flex min-h-40 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-xs text-muted">
                    اطلاعات هنگام مشاهده پیام دریافت می‌شود.
                </div>
            ) : loading && !result ? (
                <div
                    role="status"
                    className="animate-pulse rounded-xl border border-border p-4 text-sm text-muted"
                >
                    در حال دریافت اطلاعات…
                </div>
            ) : current?.error ? (
                <div role="alert" className="space-y-2 text-sm text-muted">
                    <p>دریافت اطلاعات انجام نشد.</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        startIcon={<RotateCcw size={14} aria-hidden="true" />}
                        type="button"
                        className="rounded-lg border border-border px-3 py-2"
                        onClick={() => {
                            setResult(null);
                            setRetry((value) => value + 1);
                        }}
                    >
                        تلاش دوباره
                    </Button>
                </div>
            ) : !pagination?.total ? (
                <p className="text-sm text-muted">موردی برای نمایش پیدا نشد.</p>
            ) : (
                <>
                    {type === 'products' ? (
                        <ProductsResponse products={result?.products ?? []} />
                    ) : (
                        result?.orders.map((order) => (
                            <OrderResponse
                                key={order.id}
                                order={order}
                                open={
                                    expandedOrder?.page === page &&
                                    expandedOrder.id === order.id
                                }
                                onToggle={() =>
                                    setExpandedOrder((current) =>
                                        current?.page === page &&
                                        current.id === order.id
                                            ? null
                                            : { page, id: order.id },
                                    )
                                }
                            />
                        ))
                    )}
                </>
            )}
            {pagination && pagination.total > 0 && (
                <nav
                    aria-label="صفحه‌بندی نتایج"
                    className="flex justify-center py-1"
                >
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {pageNumbers.map((pageNumber, index) => (
                            <span
                                key={pageNumber}
                                className="inline-flex items-center gap-1.5"
                            >
                                {index > 0 &&
                                    pageNumber - pageNumbers[index - 1] > 1 && (
                                        <span
                                            className="px-1 text-muted"
                                            aria-hidden="true"
                                        >
                                            …
                                        </span>
                                    )}
                                <Button
                                    variant={
                                        page === pageNumber
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    size="icon"
                                    type="button"
                                    aria-label={`صفحه ${pageNumber.toLocaleString('fa-IR')}`}
                                    aria-current={
                                        page === pageNumber ? 'page' : undefined
                                    }
                                    disabled={loading}
                                    onClick={() => setPage(pageNumber)}
                                    className={`flex size-7! items-center justify-center rounded-lg border text-[11px]! transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${page === pageNumber ? 'border-violet-300/50 bg-violet-400/20 font-semibold text-violet-100 shadow-[0_0_12px_rgba(139,92,246,0.15)]' : 'border-white/8 bg-white/3 text-muted hover:border-violet-300/30 hover:text-zinc-100'}`}
                                >
                                    {pageNumber.toLocaleString('fa-IR')}
                                </Button>
                            </span>
                        ))}
                    </div>
                </nav>
            )}
        </section>
    );
}
