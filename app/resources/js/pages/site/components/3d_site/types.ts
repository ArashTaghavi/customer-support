export type ShowroomSlot = 'phone' | 'laptop' | 'headphone';
export type ShowroomProduct = {
    id: number;
    title: string;
    description: string | null;
    price: number;
    stock: number;
    model_url: string;
    image_url: string | null;
};
export type ShowroomTable = {
    slot: ShowroomSlot;
    category: {
        id: number;
        title: string;
        showroom_slot: ShowroomSlot;
        product_count: number;
    } | null;
    products: ShowroomProduct[];
};
