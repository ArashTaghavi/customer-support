export type Category = {
    id: number;
    title: string;
    product_count: number;
    showroom_slot: 'phone' | 'laptop' | 'gaming' | 'accessories' | null;
    created_at: string | null;
};
export type Product = {
    id: number;
    title: string;
    description: string | null;
    price: number;
    stock: number;
    product_category_id: number;
    image_url: string | null;
    model_url: string | null;
    showroom_order: number | null;
    product_category: Category | null;
    created_at: string | null;
};
export type Filters = {
    q?: string;
    category?: string | number;
    sort?: string;
    direction?: 'asc' | 'desc';
    page?: number;
};
export type Collection<T> = { data: T[] };
