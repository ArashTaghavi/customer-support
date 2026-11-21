import { z } from 'zod';
import type { ChatResponse } from '@/types/chat_response';

const nullableText = z.string().nullable().default(null);

const productSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    stock: z.number(),
    image: z.string(),
});

const orderItemSchema = z.object({
    id: z.number(),
    order_id: z.number(),
    product_id: z.number(),
    quantity: z.number(),
    unit_price: z.number(),
    total_price: z.number(),
});

const paymentSchema = z.object({
    id: z.number(),
    order_id: z.number(),
    amount: z.number(),
    status: z.string(),
    method: z.string(),
    transaction_id: nullableText,
    reference_id: nullableText,
    paid_at: nullableText,
    refunded_at: nullableText,
    failure_reason: nullableText,
    created_at: nullableText,
    updated_at: nullableText,
});

const orderSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    order_number: z.string(),
    total_amount: z.number(),
    order_status: z.string(),
    payment_status: z.string(),
    tracking_code: nullableText,
    shipping_address: z.string(),
    paid_at: nullableText,
    shipped_at: nullableText,
    delivered_at: nullableText,
    cancelled_at: nullableText,
    cancellation_reason: nullableText,
    created_at: nullableText,
    updated_at: nullableText,
    items: z.array(orderItemSchema).default([]),
    payments: z.array(paymentSchema).default([]),
});

const chatResponseSchema = z.object({
    message: z.string(),
    blocks: z
        .array(
            z.discriminatedUnion('type', [
                z.object({
                    type: z.literal('products'),
                    data: z.array(productSchema),
                }),
                z.object({ type: z.literal('order'), data: orderSchema }),
            ]),
        )
        .default([]),
});

export function parseChatResponse(answer: unknown): ChatResponse | null {
    let parsed: unknown = answer;
    if (typeof answer === 'string') {
        try {
            parsed = JSON.parse(answer);
        } catch {
            return null;
        }
    }

    const result = chatResponseSchema.safeParse(parsed);
    return result.success ? result.data : null;
}
