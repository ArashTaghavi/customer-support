export type ProductData = {
    id: number;
    title: string;
    description: string;
    price: number;
    stock: number;
    image: string;
};

export type ProductsBlock = {
    type: 'products';
    data: ProductData[];
};

export type OrderItemData = {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export type PaymentData = {
    id: number;
    order_id: number;
    amount: number;
    status: string;
    method: string;
    transaction_id: string | null;
    reference_id: string | null;
    paid_at: string | null;
    refunded_at: string | null;
    failure_reason: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type OrderData = {
    id: number;
    user_id: number;
    order_number: string;
    total_amount: number;
    order_status: string;
    payment_status: string;
    tracking_code: string | null;
    shipping_address: string;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    created_at: string | null;
    updated_at: string | null;
    items: OrderItemData[];
    payments: PaymentData[];
};

export type OrderBlock = {
    type: 'order';
    data: OrderData;
};

export type ChatBlock = ProductsBlock | OrderBlock;

export type ChatResponse = {
    message: string;
    blocks: ChatBlock[];
};
