import { z } from 'zod';
import type { ChatResponse } from '@/types/chat_response';

const nullableText = z.string().nullable().default(null);

export const productSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z
        .string()
        .nullable()
        .transform((value) => value ?? ''),
    price: z.number(),
    stock: z.number(),
    image: z
        .string()
        .nullable()
        .transform((value) => value ?? ''),
    image_url: z.string(),
});

const orderItemSchema = z.object({
    product: productSchema.nullable().optional(),
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
});

export const orderSchema = z
    .object({
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
        items: z.array(orderItemSchema).default([]),
        order_items: z.array(orderItemSchema).optional(),
        payments: z.array(paymentSchema).default([]),
    })
    .transform(({ order_items, ...order }) => ({
        ...order,
        items: order_items ?? order.items,
    }));

const idSchema = z.number().int().positive();
const idsSchema = z.array(
    z.union([
        idSchema,
        z.object({ id: idSchema }).transform((item) => item.id),
    ]),
);
const orderIdsSchema = z.union([
    idsSchema,
    z.object({ id: idSchema }).transform((order) => [order.id]),
]);

const chatResponseSchema = z.object({
    message: z.string(),
    confirmation: z
        .object({
            type: z.literal('order_cancellation_confirmation'),
            thread_id: z.string(),
            interrupt_id: z.string(),
            order_id: idSchema,
            order_number: z.string(),
            total_amount: z.number(),
            message: z.string(),
        })
        .optional(),
    blocks: z
        .array(
            z.discriminatedUnion('type', [
                z.object({
                    type: z.literal('products'),
                    data: idsSchema,
                }),
                z.object({ type: z.literal('order'), data: orderIdsSchema }),
                z.object({ type: z.literal('orders'), data: orderIdsSchema }),
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
    if (!result.success) return null;

    const blocks: ChatResponse['blocks'] = [];

    for (const block of result.data.blocks) {
        const type = block.type === 'order' ? 'orders' : block.type;
        const existing = blocks.find((group) => group.type === type);

        if (existing) {
            existing.data.push(...block.data);
        } else {
            blocks.push({ type, data: [...block.data] });
        }
    }

    return {
        ...result.data,
        blocks: blocks.map((block) => ({
            ...block,
            data: [...new Set(block.data)],
        })),
    };
}
