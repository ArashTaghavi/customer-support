import { useHttp } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui';
import { RotateCcw } from 'lucide-react';
import { orders, products } from '@/routes/chat-response';
import type { ChatBlock, OrderData, ProductData } from '@/types/chat_response';
import OrderResponse from './order_response';
import ProductsResponse from './products_response';
import { orderSchema, productSchema } from './parse_response';

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
    const [page, setPage] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState<{
        page: number;
        id: number;
    } | null>(null);
    const [retry, setRetry] = useState(0);
    const [result, setResult] = useState<PageResult | null>(null);
    const { post, cancel, processing } = useHttp({ ids });

    useEffect(() => {
        if (ids.length === 0) return;

        let active = true;
        const route = type === 'products' ? products : orders;

        async function loadPage() {
            try {
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

                if (active) setResult(nextResult);
            } catch {
                if (active) {
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
            cancel();
        };
    }, [type, ids.length, page, retry, post, cancel]);

    const loading = ids.length > 0 && (processing || result?.page !== page);
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
            data-chat-pagination
            className="relative min-w-0 space-y-3"
            aria-busy={loading}
        >
            {loading && !result ? (
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
                        onClick={() => setRetry((value) => value + 1)}
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
                                            className="px-1 text-zinc-500"
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
                                    className={`flex size-7! items-center justify-center rounded-lg border text-[11px]! transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${page === pageNumber ? 'border-violet-300/50 bg-violet-400/20 font-semibold text-violet-100 shadow-[0_0_12px_rgba(139,92,246,0.15)]' : 'border-white/8 bg-white/3 text-zinc-400 hover:border-violet-300/30 hover:text-zinc-100'}`}
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
